"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import JSZip from "jszip";

export type ActionState = {
  error?: string;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

async function ensureUploadsDir(...parts: string[]) {
  const uploadRoot = path.join(process.cwd(), "uploads", ...parts);
  await mkdir(uploadRoot, { recursive: true });
  return uploadRoot;
}

function validateDocxFile(file: File | null) {
  if (!file || file.size === 0) {
    return { error: "A .docx file is required." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size must be 25MB or less." };
  }

  const filename = file.name ?? "";
  const lowerName = filename.toLowerCase();
  if (!lowerName.endsWith(".docx")) {
    return { error: "Only .docx files are supported." };
  }
  if (!DOCX_MIME_TYPES.has(file.type)) {
    return { error: "File must be a valid .docx document." };
  }
  return { file };
}

async function writeDocxFile(
  documentId: string,
  versionNumber: number,
  file: File,
  buffer?: Buffer
) {
  const resolvedBuffer = buffer ?? Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(resolvedBuffer).digest("hex");
  const fileSize = resolvedBuffer.length;
  const versionDir = await ensureUploadsDir(documentId);
  const fileName = `v${versionNumber}.docx`;
  const filePath = path.join(versionDir, fileName);
  await writeFile(filePath, resolvedBuffer);
  return {
    fileHash,
    fileSize,
    filePath: path.relative(process.cwd(), filePath)
  };
}

const XML_ENTITY_MAP: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": "\"",
  "&apos;": "'"
};

function decodeXml(value: string) {
  return value.replace(
    /&(lt|gt|amp|quot|apos);/g,
    (match) => XML_ENTITY_MAP[match] ?? match
  );
}

function extractTextFromXml(fragment: string) {
  const textMatches = fragment.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g);
  const parts = Array.from(textMatches, (match) => decodeXml(match[1] ?? ""));
  const withTabs = fragment.includes("<w:tab")
    ? parts.flatMap((part) => [part, " "])
    : parts;
  return withTabs.join("").replace(/\s+/g, " ").trim();
}

async function parseDocxContent(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = zip.file("word/document.xml");
  if (!documentXml) {
    throw new Error("Document XML not found.");
  }
  const xml = await documentXml.async("string");

  const paragraphMatches = xml.matchAll(/<w:p[\s\S]*?<\/w:p>/g);
  const lines = Array.from(paragraphMatches, (match) =>
    extractTextFromXml(match[0])
  ).filter((line) => line.length > 0);

  const rowMatches = xml.matchAll(/<w:tr[\s\S]*?<\/w:tr>/g);
  const tableRows = Array.from(rowMatches, (match) => {
    const cellMatches = match[0].matchAll(/<w:tc[\s\S]*?<\/w:tc>/g);
    const cellTexts = Array.from(cellMatches, (cellMatch) =>
      extractTextFromXml(cellMatch[0])
    ).filter((text) => text.length > 0);
    const rowText = cellTexts.join(" | ").trim();
    return rowText;
  }).filter((row) => row.length > 0);

  return { lines, tableRows };
}

type TextChange =
  | { type: "changed"; before: string; after: string }
  | { type: "added"; before: ""; after: string };

type ContentSummary = {
  textChanges: TextChange[];
  tableRowAdds: { rowsAdded: number; samples: string[] }[];
};

function buildContentSummary(
  previous: { lines: string[]; tableRows: string[] },
  next: { lines: string[]; tableRows: string[] }
): ContentSummary {
  const textChanges: TextChange[] = [];
  const maxLines = Math.max(previous.lines.length, next.lines.length);
  for (let index = 0; index < maxLines; index += 1) {
    if (textChanges.length >= 3) {
      break;
    }
    const before = previous.lines[index];
    const after = next.lines[index];
    if (before && after && before !== after) {
      textChanges.push({ type: "changed", before, after });
    }
  }

  if (textChanges.length < 3) {
    const previousSet = new Set(previous.lines);
    for (const line of next.lines) {
      if (textChanges.length >= 3) {
        break;
      }
      if (line && !previousSet.has(line)) {
        textChanges.push({ type: "added", before: "", after: line });
      }
    }
  }

  const previousRowSet = new Set(previous.tableRows);
  const addedRows = next.tableRows.filter(
    (row) => row && !previousRowSet.has(row)
  );
  const tableRowAdds =
    addedRows.length > 0
      ? [
          {
            rowsAdded: addedRows.length,
            samples: addedRows.slice(0, 2)
          }
        ]
      : [];

  return { textChanges, tableRowAdds };
}

function getActorName(formData: FormData) {
  const actorName = String(formData.get("actorName") ?? "").trim();
  if (!actorName) {
    return { error: "Actor name is required to perform this action." };
  }
  return { actorName };
}

async function ensureNotClient(projectId: string, actorName: string) {
  const member = await prisma.member.findFirst({
    where: { projectId, name: actorName }
  });
  if (member?.role === "CLIENT") {
    return { error: "Client role is read-only." };
  }
  return { member };
}

function parseRole(roleInput: string) {
  switch (roleInput.toUpperCase()) {
    case "OWNER":
    case "ADMIN":
    case "MEMBER":
    case "VIEWER":
    case "CLIENT":
      return roleInput.toUpperCase();
    default:
      return "MEMBER";
  }
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function parseStatus(statusInput: string) {
  switch (statusInput.toUpperCase().replace(/\s+/g, "_")) {
    case "IN_REVIEW":
      return "IN_REVIEW";
    case "FINAL":
      return "FINAL";
    case "SENT":
      return "SENT";
    default:
      return "DRAFT";
  }
}

export async function createProject(
  _prevState: ActionState,
  formData: FormData
) {
  const actorResult = getActorName(formData);
  if ("error" in actorResult) {
    return { error: actorResult.error };
  }

  const name = String(formData.get("projectName") ?? "").trim();
  const staleDaysValue = String(formData.get("staleDays") ?? "7").trim();
  const staleDays = Number.parseInt(staleDaysValue, 10);

  if (!name) {
    return { error: "Project name is required." };
  }

  const project = await prisma.project.create({
    data: {
      name,
      staleDays: Number.isNaN(staleDays) ? 7 : staleDays
    }
  });

  await prisma.member.create({
    data: {
      projectId: project.id,
      name: actorResult.actorName,
      email: `${actorResult.actorName.toLowerCase().replace(/\s+/g, ".")}@trace.dev`,
      role: "OWNER"
    }
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      actorName: actorResult.actorName,
      eventType: "PROJECT_CREATED",
      message: `${actorResult.actorName} created the project ${project.name}.`,
      payloadJson: JSON.stringify({ projectId: project.id })
    }
  });

  revalidatePath("/projects");
  return {};
}

export async function addMember(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
) {
  const actorResult = getActorName(formData);
  if ("error" in actorResult) {
    return { error: actorResult.error };
  }

  const clientCheck = await ensureNotClient(projectId, actorResult.actorName);
  if (clientCheck.error) {
    return { error: clientCheck.error };
  }

  const name = String(formData.get("memberName") ?? "").trim();
  const email = String(formData.get("memberEmail") ?? "").trim();
  const roleInput = String(formData.get("memberRole") ?? "MEMBER").trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  const role = parseRole(roleInput);
  const roleLabel = formatRole(role);

  const member = await prisma.member.create({
    data: {
      projectId,
      name,
      email,
      role
    }
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actorName: actorResult.actorName,
      eventType: "MEMBER_ADDED",
      message: `${actorResult.actorName} added ${member.name} as ${roleLabel}.`,
      payloadJson: JSON.stringify({ memberId: member.id })
    }
  });

  await prisma.notification.create({
    data: {
      projectId,
      actorName: actorResult.actorName,
      type: "New member added",
      message: `${member.name} joined the project as ${roleLabel}.`
    }
  });

  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function uploadDocument(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
) {
  const actorResult = getActorName(formData);
  if ("error" in actorResult) {
    return { error: actorResult.error };
  }

  const clientCheck = await ensureNotClient(projectId, actorResult.actorName);
  if (clientCheck.error) {
    return { error: clientCheck.error };
  }

  const changeNote = String(formData.get("changeNote") ?? "").trim();
  if (!changeNote) {
    return { error: "Change note is required." };
  }

  const fileInput = formData.get("file");
  const fileResult = validateDocxFile(fileInput instanceof File ? fileInput : null);
  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  const titleInput = String(formData.get("title") ?? "").trim();
  const baseFileName = fileResult.file.name.replace(/\.docx$/i, "");
  const title = titleInput || baseFileName || "Untitled document";

  const document = await prisma.document.create({
    data: {
      projectId,
      title,
      status: "DRAFT",
      lastActivityAt: new Date(),
      stale: false
    }
  });

  const fileData = await writeDocxFile(document.id, 1, fileResult.file);

  await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber: 1,
      filePath: fileData.filePath,
      fileHash: fileData.fileHash,
      fileSize: fileData.fileSize,
      changeNote,
      actorName: actorResult.actorName
    }
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      documentId: document.id,
      actorName: actorResult.actorName,
      eventType: "DOC_UPLOADED",
      message: `${actorResult.actorName} uploaded ${title} (v1).`,
      payloadJson: JSON.stringify({ version: 1 })
    }
  });

  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function updateDocumentMetadata(
  documentId: string,
  _prevState: ActionState,
  formData: FormData
) {
  const actorResult = getActorName(formData);
  if ("error" in actorResult) {
    return { error: actorResult.error };
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { project: true, assignedMember: true }
  });

  if (!document) {
    return { error: "Document not found." };
  }

  const clientCheck = await ensureNotClient(
    document.projectId,
    actorResult.actorName
  );
  if (clientCheck.error) {
    return { error: clientCheck.error };
  }

  const statusInput = String(formData.get("status") ?? "DRAFT").trim();
  const dueDateInput = String(formData.get("dueDate") ?? "").trim();
  const assignedInput = String(formData.get("assigned") ?? "").trim();
  const tagsInput = String(formData.get("tags") ?? "").trim();

  const status = parseStatus(statusInput);
  const dueDate = dueDateInput ? new Date(dueDateInput) : null;

  const assignedMember = assignedInput
    ? await prisma.member.findFirst({
        where: { projectId: document.projectId, name: assignedInput }
      })
    : null;

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const memberRole = clientCheck.member?.role;
  if (status === "FINAL" && memberRole !== "OWNER" && memberRole !== "ADMIN") {
    return { error: "Only owners and admins can mark documents as Final." };
  }

  const formatDateValue = (value: Date | null) =>
    value ? value.toISOString().split("T")[0] : "";
  const safeTags = (value: string) => {
    try {
      return JSON.parse(value) as string[];
    } catch {
      return [];
    }
  };

  const beforeTags = safeTags(document.tagsJson || "[]");
  const diffs = [
    {
      field: "dueDate",
      before: formatDateValue(document.dueDate),
      after: formatDateValue(dueDate)
    },
    {
      field: "status",
      before: document.status,
      after: status
    },
    {
      field: "assignedMemberId",
      before: document.assignedMember?.name ?? "",
      after: assignedMember?.name ?? ""
    },
    {
      field: "tags",
      before: JSON.stringify(beforeTags),
      after: JSON.stringify(tags)
    }
  ].filter((diff) => diff.before !== diff.after);

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status,
      dueDate,
      assignedMemberId: assignedMember?.id ?? null,
      tagsJson: JSON.stringify(tags),
      lastActivityAt: new Date(),
      stale: false
    }
  });

  await prisma.activityLog.create({
    data: {
      projectId: document.projectId,
      documentId,
      actorName: actorResult.actorName,
      eventType: "DOC_METADATA_CHANGED",
      message: `${actorResult.actorName} updated metadata for ${document.title}.`,
      payloadJson: JSON.stringify({ diffs })
    }
  });

  const notifyMembers = await prisma.member.findMany({
    where: { projectId: document.projectId, role: { not: "CLIENT" } },
    select: { id: true }
  });

  if (notifyMembers.length > 0) {
    await prisma.notification.createMany({
      data: notifyMembers.map(() => ({
        projectId: document.projectId,
        documentId,
        actorName: actorResult.actorName,
        type: "Metadata updated",
        message: `${document.title} metadata was updated.`
      }))
    });
  }

  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/projects/${document.projectId}`);
  return {};
}

export async function addDocumentVersion(
  documentId: string,
  _prevState: ActionState,
  formData: FormData
) {
  const actorResult = getActorName(formData);
  if ("error" in actorResult) {
    return { error: actorResult.error };
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { versions: true }
  });

  if (!document) {
    return { error: "Document not found." };
  }

  const clientCheck = await ensureNotClient(
    document.projectId,
    actorResult.actorName
  );
  if (clientCheck.error) {
    return { error: clientCheck.error };
  }

  const changeNote = String(formData.get("changeNote") ?? "").trim();
  if (!changeNote) {
    return { error: "Change note is required." };
  }

  const fileInput = formData.get("file");
  const fileResult = validateDocxFile(fileInput instanceof File ? fileInput : null);
  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  const nextVersion =
    document.versions.reduce((max, version) => {
      return Math.max(max, version.versionNumber);
    }, 0) + 1;

  const newFileBuffer = Buffer.from(await fileResult.file.arrayBuffer());
  const fileData = await writeDocxFile(
    documentId,
    nextVersion,
    fileResult.file,
    newFileBuffer
  );

  let contentSummary: ContentSummary | undefined;
  let contentSummaryError: string | undefined;

  if (nextVersion > 1) {
    const previousVersion = document.versions.reduce((latest, version) => {
      if (version.versionNumber < nextVersion) {
        return version.versionNumber > (latest?.versionNumber ?? 0)
          ? version
          : latest;
      }
      return latest;
    }, undefined as (typeof document.versions)[number] | undefined);

    try {
      if (!previousVersion) {
        throw new Error("Previous version not found.");
      }
      const previousBuffer = await readFile(
        path.join(process.cwd(), previousVersion.filePath)
      );
      const previousContent = await parseDocxContent(previousBuffer);
      const nextContent = await parseDocxContent(newFileBuffer);
      contentSummary = buildContentSummary(previousContent, nextContent);
    } catch (error) {
      contentSummaryError =
        error instanceof Error ? error.message : "Unable to parse content.";
    }
  }

  await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: nextVersion,
      filePath: fileData.filePath,
      fileHash: fileData.fileHash,
      fileSize: fileData.fileSize,
      changeNote,
      actorName: actorResult.actorName
    }
  });

  await prisma.document.update({
    where: { id: documentId },
    data: {
      lastActivityAt: new Date(),
      stale: false
    }
  });

  await prisma.activityLog.create({
    data: {
      projectId: document.projectId,
      documentId,
      actorName: actorResult.actorName,
      eventType: "DOC_VERSION_UPLOADED",
      message: `${actorResult.actorName} uploaded v${nextVersion} for ${document.title}.`,
      payloadJson: JSON.stringify({
        version: nextVersion,
        ...(contentSummary ? { contentSummary } : {}),
        ...(contentSummaryError ? { contentSummaryError } : {})
      })
    }
  });

  const recipients = await prisma.member.findMany({
    where: { projectId: document.projectId, role: { not: "CLIENT" } }
  });
  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((member) => ({
        projectId: document.projectId,
        documentId,
        actorName: actorResult.actorName,
        type: "New version uploaded",
        message: `${document.title} v${nextVersion} was uploaded for ${member.name}.`
      }))
    });
  }

  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/projects/${document.projectId}`);
  return {};
}

export async function markNotificationsRead(
  _prevState: ActionState,
  formData: FormData
) {
  const actorResult = getActorName(formData);
  if ("error" in actorResult) {
    return { error: actorResult.error };
  }

  const clientMember = await prisma.member.findFirst({
    where: { name: actorResult.actorName, role: "CLIENT" }
  });

  if (clientMember) {
    return { error: "Client role is read-only." };
  }

  await prisma.notification.updateMany({
    data: { isRead: true }
  });

  revalidatePath("/notifications");
  return {};
}
