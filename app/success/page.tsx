"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [generationId, setGenerationId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    async function verifyAndStart() {
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setGenerationId(data.generationId);
        setStatus("success");
        // Redirect to results after 3s
        setTimeout(() => {
          router.push(`/results/${data.generationId}`);
        }, 3000);
      } else {
        setStatus("error");
      }
    }

    verifyAndStart();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {status === "verifying" && (
          <>
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Confirming your payment...</h1>
            <p className="text-white/60">Please wait while we verify your purchase.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Payment confirmed!</h1>
            <p className="text-white/60 mb-6">
              Your AI headshots are being generated. This usually takes 10–20 minutes.
              We&apos;ll email you when they&apos;re ready.
            </p>
            <div className="card p-5 mb-6">
              <p className="text-white/60 text-sm">
                Redirecting to your results page in a moment...
              </p>
            </div>
            {generationId && (
              <Link href={`/results/${generationId}`} className="btn-primary inline-block">
                View progress
              </Link>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-white/60 mb-6">
              We couldn&apos;t verify your payment. If you were charged, please contact us and we&apos;ll sort it out.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/upload" className="btn-secondary">
                Try again
              </Link>
              <a href="mailto:support@headsnap.ai" className="btn-primary">
                Contact support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
