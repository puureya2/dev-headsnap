import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-purple-400 font-mono text-sm font-bold mb-4">404</p>
        <h1 className="text-4xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-white/60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
