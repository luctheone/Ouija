import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, tooMany } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 20;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' });
}

export async function POST(req: NextRequest) {
  // Pre-session demo helper that creates a REAL Stripe Express account — must stay anonymous
  // (the demo page calls it before any token exists) but is hard rate-limited by IP so it
  // can't be used to mass-create accounts on our Stripe.
  if (!rateLimit(`stripe-link:${clientIp(req)}`, 5)) return tooMany();
  try {
    const stripe = getStripe();
    const account = await stripe.accounts.create({ type: 'express' });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_URL || 'https://ouijaboard.vercel.app'}/demo/stripe-connect?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_URL || 'https://ouijaboard.vercel.app'}/demo/stripe-connect?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('[/api/demo/stripe-connect-link]', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect link', detail: error?.message },
      { status: 500 }
    );
  }
}
