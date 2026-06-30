"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Generation {
  id: string;
  status: string;
  result_urls: string[] | null;
  error_message: string | null;
  created_at: string;
  photo_count: number;
}

export default function ResultsClient({
  generation: initialGeneration,
}: {
  generation: Generation;
}) {
  const [generation, setGeneration] = useState(initialGeneration);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const poll = useCallback(async () => {
    const res = await fetch(`/api/generation-status?id=${initialGeneration.id}`);
    if (res.ok) {
      const data = await res.json();
      setGeneration(data);
      return data.status;
    }
    return null;
  }, [initialGeneration.id]);

  useEffect(() => {
    if (generation.status === "complete" || generation.status === "failed") return;

    const interval = setInterval(async () => {
      const status = await poll();
      if (status === "complete" || status === "failed") {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [generation.status, poll]);

  async function handleDownloadAll() {
    if (!generation.result_urls || generation.result_urls.length === 0) return;
    setDownloading(true);

    try {
      const { default: JSZip } = await import("jszip");
      const { saveAs } = await import("file-saver");

      const zip = new JSZip();
      const folder = zip.folder("headsnap-headshots");

      await Promise.all(
        generation.result_urls.map(async (url, i) => {
          const response = await fetch(url);
          const blob = await response.blob();
          folder!.file(`headshot-${i + 1}.jpg`, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "headsnap-headshots.zip");
      toast.success("Download started!");
    } catch {
      toast.error("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadSingle(url: string, index: number) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const { saveAs } = await import("file-saver");
      saveAs(blob, `headshot-${index + 1}.jpg`);
    } catch {
      toast.error("Download failed.");
    }
  }

  const isProcessing = generation.status === "processing" || generation.status === "paid";
  const isComplete = generation.status === "complete";
  const isFailed = generation.status === "failed";

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Your headshots</h1>
          <p className="text-white/60 mt-1">
            {new Date(generation.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {isComplete && generation.result_urls && (
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">
              {generation.result_urls.length} photos
            </span>
            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="btn-primary disabled:opacity-50"
            >
              {downloading ? "Preparing ZIP..." : "Download all (ZIP)"}
            </button>
          </div>
        )}
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Generating your headshots...</h2>
          <p className="text-white/60 max-w-md mx-auto">
            Our AI is creating your professional headshots. This takes about 10–20 minutes.
            This page refreshes automatically — you can also close it and check your email.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-white/50 text-sm">Live updates every 5 seconds</span>
          </div>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Generation failed</h2>
          <p className="text-white/60 mb-2">
            {generation.error_message || "Something went wrong during generation."}
          </p>
          <p className="text-white/40 text-sm mb-6">
            Please contact <a href="mailto:support@headsnap.ai" className="text-purple-400 hover:text-purple-300">support@headsnap.ai</a> for a full refund.
          </p>
        </div>
      )}

      {/* Results grid */}
      {isComplete && generation.result_urls && generation.result_urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {generation.result_urls.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => setSelectedImage(url)}
            >
              <Image
                src={url}
                alt={`Headshot ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(url, i);
                    }}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Full size headshot"
              fill
              className="object-contain rounded-2xl"
              sizes="(max-width: 768px) 100vw, 700px"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => {
                const idx = generation.result_urls!.indexOf(selectedImage);
                handleDownloadSingle(selectedImage, idx);
              }}
              className="absolute bottom-4 right-4 btn-primary text-sm py-2 px-4"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </>
  );
}
