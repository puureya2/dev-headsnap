"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold gradient-text">
            headsnap.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/upload" className="text-white/60 hover:text-white text-sm transition-colors">
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="btn-secondary text-sm py-2 px-4"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
