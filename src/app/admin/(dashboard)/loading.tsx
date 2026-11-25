export default function Loading() {
  return (
    <div role="status" className="mx-auto max-w-6xl">
      <span className="sr-only">Loading admin page</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-5 h-8 w-44 rounded-lg bg-rule" />
        <div className="panel space-y-4 p-5">
          <div className="h-4 w-2/5 rounded bg-rule" />
          <div className="h-10 rounded bg-tint" />
          <div className="h-10 rounded bg-tint" />
          <div className="h-10 rounded bg-tint" />
        </div>
      </div>
    </div>
  );
}
