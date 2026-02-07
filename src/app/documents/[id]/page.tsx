import { prisma } from "@/lib/prisma";
import {
  formatShortDate,
  formatStatusLabel,
  formatTimestampLabel
} from "@/lib/format";
import { addDocumentVersion, updateDocumentMetadata } from "@/lib/actions";
import DocumentMetadataForm from "@/components/forms/DocumentMetadataForm";
import DocumentVersionForm from "@/components/forms/DocumentVersionForm";

const tabs = ["Metadata", "Versions", "History"];

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({
  params
}: {
  params: { id: string };
}) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      assignedMember: true,
      versions: {
        orderBy: { versionNumber: "desc" }
      },
      activityLogs: {
        orderBy: { ts: "desc" }
      }
    }
  });

  if (!document) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Document not found
        </h1>
        <p className="text-sm text-slate-600">
          The document could not be located in the database.
        </p>
      </div>
    );
  }

  const metadataAction = updateDocumentMetadata.bind(null, document.id);
  const versionAction = addDocumentVersion.bind(null, document.id);
  const tags = JSON.parse(document.tagsJson || "[]") as string[];
  const dueDateValue = document.dueDate
    ? document.dueDate.toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          {document.title}
        </h1>
        <p className="text-sm text-slate-600">
          Review metadata, versions, and document history.
        </p>
      </header>

      <div className="flex gap-4 border-b border-slate-200">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`border-b-2 px-2 pb-3 text-sm font-semibold ${
              index === 0
                ? "border-accent text-accent"
                : "border-transparent text-slate-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <DocumentMetadataForm
          action={metadataAction}
          defaultDueDate={dueDateValue}
          defaultStatus={formatStatusLabel(document.status)}
          defaultAssigned={document.assignedMember?.name ?? ""}
          defaultTags={tags.join(", ")}
        />

        <DocumentVersionForm action={versionAction} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Versions</h2>
          <div className="space-y-3">
            {document.versions.map((version) => (
              <div
                key={version.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    v{version.versionNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatShortDate(version.createdAt)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {version.changeNote}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Uploaded by {version.actorName}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">History</h2>
          <div className="space-y-3">
            {document.activityLogs.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {formatTimestampLabel(item.ts)}
                </div>
                <div className="mt-2 text-sm text-slate-700">{item.message}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
