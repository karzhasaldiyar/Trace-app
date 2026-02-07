const projects = [
  {
    id: "alpha",
    name: "Alpha Expansion",
    owner: "Jordan Lee",
    updated: "2 hours ago",
    status: "Active"
  },
  {
    id: "delta",
    name: "Delta Migration",
    owner: "Priya Patel",
    updated: "Yesterday",
    status: "Planning"
  },
  {
    id: "northstar",
    name: "Northstar Rollout",
    owner: "Diego Ortiz",
    updated: "3 days ago",
    status: "Review"
  }
];

export default function ProjectsPage() {
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
        {projects.map((project) => (
          <div key={project.id} className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {project.name}
              </h2>
              <span className="badge">{project.status}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <div>Owner: {project.owner}</div>
              <div>Updated: {project.updated}</div>
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
        ))}
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Create project</h2>
        <p className="text-sm text-slate-600">
          Use this modal-style form to add a new project.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Project name
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. Q4 Compliance Review"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Stale days (default 7)
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              defaultValue="7"
            />
          </label>
        </div>
        <div>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
            Save project
          </button>
        </div>
      </section>
    </div>
  );
}
