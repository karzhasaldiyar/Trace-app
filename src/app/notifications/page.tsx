const notifications = [
  {
    id: "note-1",
    title: "Vendor Agreement v3 uploaded",
    detail: "Jordan Lee added a new version with SLA updates.",
    time: "2 hours ago",
    unread: true
  },
  {
    id: "note-2",
    title: "New member added",
    detail: "Kim Nguyen joined Alpha Expansion as Viewer.",
    time: "Yesterday",
    unread: false
  },
  {
    id: "note-3",
    title: "Document nearing due date",
    detail: "Security Appendix is due in 5 days.",
    time: "2 days ago",
    unread: true
  }
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Notifications
          </h1>
          <p className="text-sm text-slate-600">
            Recent activity across all projects.
          </p>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Mark read
        </button>
      </header>

      <section className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="card flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">
                  {notification.title}
                </h2>
                {notification.unread && <span className="badge">New</span>}
              </div>
              <p className="text-sm text-slate-600">{notification.detail}</p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {notification.time}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
