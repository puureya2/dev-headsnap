import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "headsnap.ai — AI Professional Headshots in Minutes",
  description:
    "Upload 8-12 selfies and get 50 stunning professional headshots powered by AI. Perfect for LinkedIn, resumes, and professional profiles. Only $15.",
};

const faqs = [
  {
    q: "Are my photos kept private?",
    a: "Yes. Your uploaded photos are stored securely and automatically deleted after 7 days. Generated headshots are also deleted after 7 days unless you download them. We never share your images with third parties.",
  },
  {
    q: "How good is the quality?",
    a: "Our AI uses FLUX, one of the most advanced image generation models available. Results are photorealistic and professional-grade, suitable for LinkedIn, resumes, and professional profiles.",
  },
  {
    q: "How long does it take?",
    a: "Generation typically takes 10–20 minutes. You'll receive an email notification when your headshots are ready. You can also monitor progress on your results page.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "Due to the significant AI compute costs incurred immediately upon generation, all sales are final. We encourage you to review our photo guidelines carefully before uploading. If you experience a technical issue, contact us at support@headsnap.ai.",
  },
  {
    q: "What photos should I upload?",
    a: "Upload 8–12 clear selfies with good lighting showing your face from different angles. Avoid sunglasses, hats, filters, or group photos. The more variety you provide, the better the results.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold gradient-text">headsnap.ai</span>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                Sign in
              </Link>
              <Link href="/upload" className="btn-primary text-sm py-2 px-4">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-sm">50 headshots · $15 one-time · 20 min delivery</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Professional headshots,{" "}
            <span className="gradient-text">powered by AI</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Upload 8–12 selfies and receive 50 stunning professional headshots in minutes.
            Perfect for LinkedIn, resumes, and professional profiles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Get your headshots →
            </Link>
            <p className="text-white/40 text-sm">No subscription · $15 one-time</p>
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">See the transformation</h2>
            <p className="text-white/60">From casual selfies to polished professional headshots</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="card p-6">
              <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-4">Before — Your selfies</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6 border-purple-500/30">
              <p className="text-purple-400 text-sm font-medium uppercase tracking-wider mb-4">After — AI headshots</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
            <p className="text-white/60">Three simple steps to your professional headshots</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Upload selfies",
                description: "Upload 8–12 clear photos of yourself. Different angles and lighting work best.",
              },
              {
                step: "02",
                title: "Pay once",
                description: "Secure $15 one-time payment via Stripe. No subscription, no hidden fees.",
              },
              {
                step: "03",
                title: "Get headshots",
                description: "Receive 50 AI-generated professional headshots in about 10–20 minutes.",
              },
            ].map((item) => (
              <div key={item.step} className="card p-6">
                <span className="text-purple-400 font-mono text-sm font-bold">{item.step}</span>
                <h3 className="text-xl font-semibold text-white mt-2 mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Simple pricing</h2>
          <p className="text-white/60 mb-10">One price, no surprises</p>
          <div className="card p-8 border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="text-5xl font-bold text-white mb-2">$15</div>
            <div className="text-white/60 mb-8">one-time payment</div>
            <ul className="space-y-3 text-left mb-8">
              {[
                "50 professional AI headshots",
                "Multiple styles and backgrounds",
                "High-resolution downloads",
                "ZIP download for all photos",
                "Email delivery",
                "7-day storage included",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-white/80">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/upload" className="btn-primary w-full text-center block text-lg py-4">
              Get your headshots →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready for your perfect headshot?
          </h2>
          <p className="text-white/60 mb-8">
            Join thousands of professionals who upgraded their profiles with AI headshots.
          </p>
          <Link href="/upload" className="btn-primary text-lg px-10 py-4 inline-block">
            Get started — $15
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/40 text-sm font-bold">headsnap.ai</span>
          <div className="flex items-center gap-6 text-white/40 text-sm">
            <Link href="/#faq" className="hover:text-white/70 transition-colors">FAQ</Link>
            <Link href="/#pricing" className="hover:text-white/70 transition-colors">Pricing</Link>
            <a href="mailto:support@headsnap.ai" className="hover:text-white/70 transition-colors">Support</a>
          </div>
          <p className="text-white/20 text-sm">&copy; {new Date().getFullYear()} headsnap.ai</p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="card p-6 group">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="font-semibold text-white">{question}</span>
        <svg
          className="w-5 h-5 text-white/40 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <p className="mt-4 text-white/60 text-sm leading-relaxed">{answer}</p>
    </details>
  );
}
