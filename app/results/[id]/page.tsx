import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import ResultsClient from "./ResultsClient";

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: generation, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !generation) {
    notFound();
  }

  return (
    <>
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <ResultsClient generation={generation} />
      </main>
    </>
  );
}
