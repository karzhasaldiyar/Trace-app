import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/format";
import { markNotificationsRead } from "@/lib/actions";
import MarkNotificationsReadForm from "@/components/forms/MarkNotificationsReadForm";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams
}: {
  searchParams?: { unread?: string };
}) {
  const showUnreadOnly = searchParams?.unread === "1";
  const notifications = await prisma.notification.findMany({
    where: showUnreadOnly ? { isRead: false } : undefined,
    orderBy: { ts: "desc" }
  });

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
        <div className="flex items-center gap-3">
          <a
            className={`text-sm font-semibold ${
              showUnreadOnly ? "text-slate-400" : "text-accent"
            }`}
            href="/notifications"
          >
            All
          </a>
          <a
            className={`text-sm font-semibold ${
              showUnreadOnly ? "text-accent" : "text-slate-400"
            }`}
            href="/notifications?unread=1"
          >
            Unread
          </a>
          <MarkNotificationsReadForm action={markNotificationsRead} />
        </div>
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
                  {notification.type}
                </h2>
                {!notification.isRead && <span className="badge">New</span>}
              </div>
              <p className="text-sm text-slate-600">{notification.message}</p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {formatRelativeTime(notification.ts)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
