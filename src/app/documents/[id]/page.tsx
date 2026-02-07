const tabs = ["Metadata", "Versions", "History"];

const versions = [
  { id: "v3", date: "Mar 8, 2025", note: "Updated SLA section", author: "Jordan Lee" },
  { id: "v2", date: "Feb 27, 2025", note: "Client feedback incorporated", author: "Riley Kim" },
  { id: "v1", date: "Feb 14, 2025", note: "Initial draft", author: "Priya Patel" }
];

const history = [
  {
    time: "Today · 9:45 AM",
    message: "Document moved to In Review by Jordan Lee."
  },
  {
    time: "Yesterday · 2:11 PM",
    message: "New version v3 uploaded with updated SLA section."
  },
  {
    time: "Feb 27 · 4:08 PM",
    message: "Assigned to Riley Kim for technical review."
  }
];

export default function DocumentDetailPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Vendor Agreement
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
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Edit metadata</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Due date
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                type="date"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Status
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                <option>Draft</option>
                <option>In Review</option>
                <option>Final</option>
                <option>Sent</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Assigned
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                placeholder="Assignee name"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Tags
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                placeholder="security, compliance"
              />
            </label>
          </div>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
            Save metadata
          </button>
        </div>

        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-slate-900">
            Upload new version
          </h3>
          <p className="text-sm text-slate-600">
            Add a .docx and provide a mandatory change note.
          </p>
          <div className="space-y-3">
            <button className="w-full rounded-lg border border-dashed border-accent bg-white px-4 py-6 text-sm font-semibold text-accent">
              Upload .docx
            </button>
            <label className="block text-sm font-medium text-slate-700">
              Change note (required)
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                rows={4}
                placeholder="Describe what changed in this version"
              />
            </label>
            <button className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              Submit version
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Versions</h2>
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    {version.id}
                  </div>
                  <div className="text-xs text-slate-500">{version.date}</div>
                </div>
                <div className="mt-2 text-sm text-slate-700">{version.note}</div>
                <div className="mt-2 text-xs text-slate-500">
                  Uploaded by {version.author}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">History</h2>
          <div className="space-y-3">
            {history.map((item) => (
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
      </section>
    </div>
  );
}
