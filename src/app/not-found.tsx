import Link from "next/link";
export default function NotFound() {
  return (
    <main className="wrap grid min-h-[65vh] content-center justify-items-start py-16">
      <p className="eyebrow">404</p>
      <h1 className="title">Page unavailable</h1>
      <p className="copy my-5">The page you requested could not be found.</p>
      <Link href="/" className="button">
        Back to home
      </Link>
    </main>
  );
}
