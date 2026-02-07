import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome to Trace</h1>
      <p className="text-sm text-slate-600">
        Use the navigation to explore projects, documents, and notifications.
      </p>
      <Link
        href="/projects"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm"
      >
        Go to Projects
      </Link>
    </div>
  );
}
