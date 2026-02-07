import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/format";
import { createProject } from "@/lib/actions";
import CreateProjectForm from "@/components/forms/CreateProjectForm";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      members: true,
      documents: true,
      activityLogs: {
        orderBy: { ts: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-600">
            Track active initiatives and document progress.
          </p>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Create Project
        </button>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => {
          const owner =
            project.members.find((member) => member.role === "OWNER")?.name ??
            "—";
          const latestActivity = project.activityLogs[0]?.ts;
          const latestDocument = project.documents.reduce<Date | null>(
            (latest, doc) => {
              if (!latest || doc.updatedAt > latest) {
                return doc.updatedAt;
              }
              return latest;
            },
            null
          );
          const updatedAt = latestActivity ?? latestDocument ?? project.createdAt;
          const status = project.documents.some(
            (doc) => doc.status === "IN_REVIEW"
          )
            ? "Review"
            : project.documents.some((doc) => doc.status === "DRAFT")
              ? "Planning"
              : "Active";

          return (
            <div key={project.id} className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {project.name}
                </h2>
                <span className="badge">{status}</span>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <div>Owner: {owner}</div>
                <div>Updated: {formatRelativeTime(updatedAt)}</div>
              </div>
              <div>
                <a
                  className="text-sm font-semibold text-accent"
                  href={`/projects/${project.id}`}
                >
                  View project →
                </a>
              </div>
            </div>
          );
        })}
      </section>

      <CreateProjectForm action={createProject} />
    </div>
  );
}
