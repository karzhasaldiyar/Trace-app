import Link from "next/link";

const navItems = [
  { label: "Projects", href: "/projects" },
  { label: "Notifications", href: "/notifications" }
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Navigation
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
