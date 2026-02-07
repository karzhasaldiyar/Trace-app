import { prisma } from "@/lib/prisma";
import {
  formatActivityTypeLabel,
  formatRoleLabel,
  formatShortDate,
  formatStatusLabel,
  formatTimestampLabel
} from "@/lib/format";
import { addMember, runStaleCheck, updateProjectSettings, uploadDocument } from "@/lib/actions";
import AddMemberForm from "@/components/forms/AddMemberForm";
import ProjectDocumentUploadForm from "@/components/forms/ProjectDocumentUploadForm";
import ProjectSettingsForm from "@/components/forms/ProjectSettingsForm";
import RunStaleCheckForm from "@/components/forms/RunStaleCheckForm";

const tabs = ["Documents", "Members", "Activity", "Settings"];

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      members: true,
      documents: {
        include: {
          assignedMember: true,
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" }
      },
      activityLogs: {
        orderBy: { ts: "desc" }
      }
    }
  });

  if (!project) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Project not found
        </h1>
        <p className="text-sm text-slate-600">
          The project could not be located in the database.
        </p>
      </div>
    );
  }

  const addMemberAction = addMember.bind(null, project.id);
  const uploadDocumentAction = uploadDocument.bind(null, project.id);
  const updateProjectSettingsAction = updateProjectSettings.bind(
    null,
    project.id
  );
  const runStaleCheckAction = runStaleCheck.bind(null, project.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          {project.name}
        </h1>
        <p className="text-sm text-slate-600">
          Project overview with shared documents and activity.
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

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-3">Title</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Due date</th>
                <th className="pb-3">Current version</th>
                <th className="pb-3">Assigned</th>
                <th className="pb-3">Stale</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {project.documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="py-3 font-medium text-slate-900">{doc.title}</td>
                  <td className="py-3">{formatStatusLabel(doc.status)}</td>
                  <td className="py-3">{formatShortDate(doc.dueDate)}</td>
                  <td className="py-3">
                    {doc.versions[0]
                      ? `v${doc.versions[0].versionNumber}`
                      : "—"}
                  </td>
                  <td className="py-3">
                    {doc.assignedMember?.name ?? "—"}
                  </td>
                  <td className="py-3">
                    {doc.stale ? <span className="badge">Stale</span> : "—"}
                  </td>
                  <td className="py-3">
                    <a
                      className="text-sm font-semibold text-accent"
                      href={`/documents/${doc.id}`}
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Members</h2>
            <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white">
              Add member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {project.members.map((member) => (
                  <tr key={member.email}>
                    <td className="py-3 font-medium text-slate-900">
                      {member.name}
                    </td>
                    <td className="py-3 text-slate-600">{member.email}</td>
                    <td className="py-3 text-slate-600">
                      {formatRoleLabel(member.role)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AddMemberForm action={addMemberAction} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
          {project.activityLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No activity yet. Project events will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {project.activityLogs.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold">
                      {formatTimestampLabel(item.ts)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                      {formatActivityTypeLabel(item.eventType)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    {item.message}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Actor: {item.actorName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ProjectDocumentUploadForm action={uploadDocumentAction} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ProjectSettingsForm
          action={updateProjectSettingsAction}
          staleDays={project.staleDays}
        />
        <RunStaleCheckForm action={runStaleCheckAction} />
      </section>
    </div>
  );
}
