import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-surface-raised p-4 ring-1 ring-border-subtle mb-4">
        <span className="text-3xl font-bold text-brand-400">404</span>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-fg-primary mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-fg-muted max-w-md mb-6">
        The requested resource or dashboard view could not be located on the SENTRIX control plane.
      </p>
      <Link
        href="/overview"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        Return to Overview
      </Link>
    </div>
  );
}

