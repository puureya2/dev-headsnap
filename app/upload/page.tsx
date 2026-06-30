import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadClient from "./UploadClient";
import NavBar from "@/components/NavBar";

export default async function UploadPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: generations } = await supabase
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Upload your photos</h1>
          <p className="text-white/60 mt-2">
            Upload 8-12 clear selfies to generate your professional headshots
          </p>
        </div>

        {generations && generations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Your previous sessions</h2>
            <div className="space-y-3">
              {generations.map((gen) => (
                <div key={gen.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {new Date(gen.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-white/40 text-xs mt-1 capitalize">{gen.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={gen.status} />
                    {gen.status === "complete" && (
                      <a
                        href={`/results/${gen.id}`}
                        className="btn-secondary text-sm py-1.5 px-4"
                      >
                        View results
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <UploadClient userId={user.id} userEmail={user.email!} />
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    uploading: "bg-yellow-500/20 text-yellow-400",
    paid: "bg-blue-500/20 text-blue-400",
    processing: "bg-purple-500/20 text-purple-400",
    complete: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${styles[status] ?? "bg-white/10 text-white/60"}`}>
      {status}
    </span>
  );
}
