import { prisma } from "@/lib/prisma";
import {
  formatShortDate,
  formatStatusLabel,
  formatTimestampLabel
} from "@/lib/format";
import { addDocumentVersion, updateDocumentMetadata } from "@/lib/actions";
import DocumentMetadataForm from "@/components/forms/DocumentMetadataForm";
import DocumentVersionForm from "@/components/forms/DocumentVersionForm";
import DocumentVersionDownloadButton from "@/components/DocumentVersionDownloadButton";

type MetadataDiff = {
  field: string;
  before: string;
  after: string;
};

type ContentTextChange =
  | { type: "changed"; before: string; after: string }
  | { type: "added"; before: ""; after: string };

type ContentSummary = {
  textChanges: ContentTextChange[];
  tableRowAdds: { rowsAdded: number; samples: string[] }[];
};

const parseMetadataDiffs = (payloadJson: string) => {
  try {
    const parsed = JSON.parse(payloadJson) as { diffs?: MetadataDiff[] };
    return parsed.diffs ?? [];
  } catch {
    return [];
  }
};

const parseContentSummary = (payloadJson: string) => {
  try {
    const parsed = JSON.parse(payloadJson) as {
      contentSummary?: ContentSummary;
      contentSummaryError?: string;
    };
    return {
      summary: parsed.contentSummary,
      error: parsed.contentSummaryError
    };
  } catch {
    return { summary: undefined, error: "Unable to read content summary." };
  }
};

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
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Uploaded by {version.actorName}</span>
                  <DocumentVersionDownloadButton
                    href={`/documents/${document.id}/versions/${version.id}/download`}
                  />
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
                {item.eventType === "DOC_METADATA_CHANGED" && (
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {parseMetadataDiffs(item.payloadJson).map((diff) => (
                      <div key={diff.field} className="space-y-1">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {diff.field}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="text-[10px] uppercase text-slate-400">
                              Before
                            </div>
                            <div className="text-xs text-slate-700">
                              {diff.before || "—"}
                            </div>
                          </div>
                          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="text-[10px] uppercase text-slate-400">
                              After
                            </div>
                            <div className="text-xs text-slate-700">
                              {diff.after || "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {item.eventType === "DOC_VERSION_UPLOADED" && (
                  <div className="mt-3 space-y-3 text-xs text-slate-600">
                    {(() => {
                      const { summary, error } = parseContentSummary(
                        item.payloadJson
                      );
                      if (!summary && !error) {
                        return null;
                      }
                      return (
                        <div className="space-y-3">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Content changes
                          </div>
                          {error ? (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                              {error}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {summary?.textChanges?.length ? (
                                <div className="space-y-2">
                                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    Text changes
                                  </div>
                                  <div className="space-y-2">
                                    {summary.textChanges.map(
                                      (change, index) => (
                                        <div
                                          key={`${change.type}-${index}`}
                                          className={`grid gap-2 ${
                                            change.type === "changed"
                                              ? "sm:grid-cols-2"
                                              : ""
                                          }`}
                                        >
                                          {change.type === "changed" ? (
                                            <>
                                              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                                <div className="text-[10px] uppercase text-slate-400">
                                                  Before
                                                </div>
                                                <div className="text-xs text-slate-700">
                                                  {change.before || "—"}
                                                </div>
                                              </div>
                                              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                                <div className="text-[10px] uppercase text-slate-400">
                                                  After
                                                </div>
                                                <div className="text-xs text-slate-700">
                                                  {change.after || "—"}
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                              <div className="text-[10px] uppercase text-slate-400">
                                                Added
                                              </div>
                                              <div className="text-xs text-slate-700">
                                                {change.after || "—"}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : null}
                              {summary?.tableRowAdds?.length ? (
                                <div className="space-y-2">
                                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    Table changes
                                  </div>
                                  {summary.tableRowAdds.map((entry, index) => (
                                    <div key={index} className="space-y-1">
                                      <div className="text-xs text-slate-700">
                                        Added {entry.rowsAdded} row
                                        {entry.rowsAdded === 1 ? "" : "s"}
                                      </div>
                                      {entry.samples.length ? (
                                        <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
                                          {entry.samples.map((sample) => (
                                            <li key={sample}>{sample}</li>
                                          ))}
                                        </ul>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
