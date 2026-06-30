"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

const MIN_PHOTOS = 8;
const MAX_PHOTOS = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadClientProps {
  userId: string;
  userEmail: string;
}

interface FilePreview {
  file: File;
  preview: string;
  id: string;
}

const GOOD_EXAMPLES = [
  "Clear, well-lit face",
  "Looking directly at camera",
  "Neutral or natural background",
  "Multiple angles and expressions",
];

const BAD_EXAMPLES = [
  "Sunglasses or hats",
  "Group photos with multiple people",
  "Heavy filters or editing",
  "Blurry or dark photos",
];

export default function UploadClient({ userId, userEmail }: UploadClientProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File; errors: { code: string; message: string }[] }[]) => {
      if (rejectedFiles.length > 0) {
        toast.error("Some files were rejected. Only JPEG, PNG, WebP images under 10MB are accepted.");
      }

      const newFiles = acceptedFiles
        .slice(0, MAX_PHOTOS - files.length)
        .map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).slice(2),
        }));

      if (files.length + acceptedFiles.length > MAX_PHOTOS) {
        toast.error(`Maximum ${MAX_PHOTOS} photos allowed.`);
      }

      setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_PHOTOS));
    },
    [files.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
    },
    maxSize: MAX_FILE_SIZE,
    disabled: files.length >= MAX_PHOTOS || uploading,
  });

  function removeFile(id: string) {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function handleUpload() {
    if (files.length < MIN_PHOTOS) {
      toast.error(`Please upload at least ${MIN_PHOTOS} photos.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const supabase = createClient();

    try {
      // Create generation record
      const { data: generation, error: genError } = await supabase
        .from("generations")
        .insert({
          user_id: userId,
          status: "uploading",
          photo_count: files.length,
        })
        .select()
        .single();

      if (genError || !generation) {
        throw new Error("Failed to create generation record");
      }

      const generationId = generation.id;

      // Upload files
      const uploadedPaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i];
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${generationId}/${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          throw new Error(`Failed to upload photo ${i + 1}: ${uploadError.message}`);
        }

        uploadedPaths.push(path);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Proceed to checkout
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId,
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const canUpload = files.length >= MIN_PHOTOS && files.length <= MAX_PHOTOS;

  return (
    <div className="space-y-8">
      {/* Photo examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-400">✓</span> Good photos
          </h3>
          <ul className="space-y-2">
            {GOOD_EXAMPLES.map((tip) => (
              <li key={tip} className="text-white/60 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-400">✕</span> Avoid these
          </h3>
          <ul className="space-y-2">
            {BAD_EXAMPLES.map((tip) => (
              <li key={tip} className="text-white/60 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : files.length >= MAX_PHOTOS
            ? "border-white/10 bg-white/5 cursor-not-allowed opacity-50"
            : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {isDragActive ? (
            <p className="text-purple-400 font-medium">Drop your photos here</p>
          ) : (
            <>
              <p className="text-white font-medium">
                Drag & drop photos here, or{" "}
                <span className="text-purple-400">browse</span>
              </p>
              <p className="text-white/40 text-sm">
                {MIN_PHOTOS}–{MAX_PHOTOS} photos · JPEG, PNG, WebP · Max 10MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {files.length} / {MAX_PHOTOS} photos
              {files.length < MIN_PHOTOS && (
                <span className="text-yellow-400 text-sm font-normal ml-2">
                  ({MIN_PHOTOS - files.length} more needed)
                </span>
              )}
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {files.map((f) => (
              <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image
                  src={f.preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="card p-5">
          <p className="text-white/80 text-sm mb-3">
            Uploading photos... {uploadProgress}%
          </p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={!canUpload || uploading}
          className={`btn-primary px-10 py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {uploading ? "Processing..." : "Continue to payment — $15"}
        </button>
        <p className="text-white/40 text-sm">
          Secure checkout via Stripe · One-time payment
        </p>
      </div>
    </div>
  );
}
