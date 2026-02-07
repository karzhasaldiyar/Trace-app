const documents = [
  {
    id: "doc-1",
    title: "Vendor Agreement",
    status: "In Review",
    dueDate: "Mar 12, 2025",
    version: "v3",
    assigned: "Riley Kim",
    stale: true
  },
  {
    id: "doc-2",
    title: "Security Appendix",
    status: "Draft",
    dueDate: "Mar 20, 2025",
    version: "v1",
    assigned: "Taylor Brooks",
    stale: false
  }
];

const members = [
  { name: "Jordan Lee", email: "jordan@trace.dev", role: "Owner" },
  { name: "Priya Patel", email: "priya@trace.dev", role: "Admin" },
  { name: "Diego Ortiz", email: "diego@trace.dev", role: "Member" },
  { name: "Kim Nguyen", email: "kim@trace.dev", role: "Viewer" }
];

const activity = [
  {
    time: "Today · 9:12 AM",
    message: "Jordan Lee uploaded Vendor Agreement v3 with updated SLA terms."
  },
  {
    time: "Yesterday · 4:40 PM",
    message: "Priya Patel added Kim Nguyen as a Viewer on the project."
  },
  {
    time: "Mon · 11:05 AM",
    message: "Riley Kim marked Security Appendix as Draft for review."
  }
];

const tabs = ["Documents", "Members", "Activity", "Settings"];

export default function ProjectDetailPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Alpha Expansion
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
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="py-3 font-medium text-slate-900">{doc.title}</td>
                  <td className="py-3">{doc.status}</td>
                  <td className="py-3">{doc.dueDate}</td>
                  <td className="py-3">{doc.version}</td>
                  <td className="py-3">{doc.assigned}</td>
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
                {members.map((member) => (
                  <tr key={member.email}>
                    <td className="py-3 font-medium text-slate-900">
                      {member.name}
                    </td>
                    <td className="py-3 text-slate-600">{member.email}</td>
                    <td className="py-3 text-slate-600">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Add member</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <label className="block">
              Name
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                placeholder="Full name"
              />
            </label>
            <label className="block">
              Email
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                placeholder="name@company.com"
              />
            </label>
            <label className="block">
              Role
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                <option>Owner</option>
                <option>Admin</option>
                <option>Member</option>
                <option>Viewer</option>
                <option>Client</option>
              </select>
            </label>
            <button className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              Invite member
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
          <div className="space-y-3">
            {activity.map((item) => (
              <div
                key={item.time}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {item.time}
                </div>
                <div className="mt-2 text-sm text-slate-700">{item.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Upload .docx</h3>
          <p className="text-sm text-slate-600">
            Placeholder uploader for project documents.
          </p>
          <button className="rounded-lg border border-dashed border-accent bg-white px-4 py-6 text-sm font-semibold text-accent">
            Drag .docx here or browse
          </button>
        </div>
      </section>
    </div>
  );
}
