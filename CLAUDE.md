# headsnap.ai — AI Headshot Generator

## Product
- Upload 8-12 selfies → AI generates 50 professional headshots
- $15 one-time payment via Stripe
- Target: job seekers, freelancers, remote workers, LinkedIn users

## Architecture
- Next.js 14 (App Router) on Vercel (free tier)
- Supabase: Auth (magic link), Database, Storage
- Payments: Stripe Checkout Sessions (one-time, no subscriptions)
- AI: Replicate API (FLUX.1-dev) for headshot generation
- Email: Resend for magic links + result delivery
- Analytics: Umami (self-hosted)

## Tech Rules
- TypeScript strict mode
- Tailwind CSS for styling (dark theme, modern, clean)
- Server Components by default; 'use client' only when needed
- Environment variables in .env.local (never committed)
- All API routes under app/api/
- Supabase client: createClient() from @supabase/ssr for server, @supabase/supabase-js for client

## Database Schema (Supabase)
- `generations` table: id, user_id, status (uploading|paid|processing|complete|failed), stripe_session_id, photo_count, created_at
- Supabase Storage buckets: `uploads` (user photos, auto-delete 7 days), `results` (generated headshots, auto-delete 7 days)

## Key API Routes
- POST /api/create-checkout — create Stripe Checkout Session ($15)
- GET /api/verify-session?session_id=xxx — verify payment, trigger generation
- POST /api/generate — Replicate API call to generate headshots
- GET /api/generation-status?id=xxx — poll for status

## User Flow
1. Landing page (hero, before/after, pricing, FAQ)
2. Upload 8-12 selfies (drag-and-drop, show good/bad photo examples)
3. Stripe Checkout → $15 payment
4. Processing page (status, progress, "email me when ready")
5. Results gallery (grid of 50 images, individual view, download all as ZIP)
6. Email delivery via Resend

## Stripe
- Product: "AI Headshot Generation" — $15 one-time
- Mode: payment (not subscription)
- Collect: email (for delivery)
- Success URL: /success?session_id={CHECKOUT_SESSION_ID}
- Cancel URL: /upload

## Replicate
- Model: use a FLUX-based face fine-tuning model
- Process: upload photos → train/fine-tune → generate variations
- Batch: 50 images per generation
- Handle failures gracefully — retry failed images

## Design
- Dark theme (#0a0a0a background, white text)
- Gradient accent (purple to blue or similar modern gradient)
- Clean, minimal, modern
- Mobile-first responsive
- Before/after comparison on landing page (static demo images)