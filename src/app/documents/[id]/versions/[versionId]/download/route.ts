import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  const { id: documentId, versionId } = params;
  const requestUrl = new URL(_request.url);
  const actorName = requestUrl.searchParams.get("actorName")?.trim() ?? "";

  if (!actorName) {
    return NextResponse.json(
      { error: "Actor name is required to download files." },
      { status: 400 }
    );
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { project: true }
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const member = await prisma.member.findFirst({
    where: { projectId: document.projectId, name: actorName }
  });

  if (member?.role === "CLIENT") {
    return NextResponse.json(
      { error: "Client role is read-only." },
      { status: 403 }
    );
  }

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId }
  });

  if (!version || version.documentId !== documentId) {
    return NextResponse.json(
      { error: "Document version not found." },
      { status: 404 }
    );
  }

  const filePath = path.join(process.cwd(), version.filePath);
  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(filePath);
  } catch {
    return NextResponse.json(
      { error: "File not found on disk." },
      { status: 404 }
    );
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { lastActivityAt: new Date(), stale: false }
  });

  await prisma.activityLog.create({
    data: {
      projectId: document.projectId,
      documentId,
      actorName,
      eventType: "DOC_DOWNLOADED",
      message: `${actorName} downloaded v${version.versionNumber} of ${document.title}.`,
      payloadJson: JSON.stringify({ version: version.versionNumber })
    }
  });

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${document.title.replace(
        /"/g,
        ""
      )}-v${version.versionNumber}.docx"`
    }
  });
}
