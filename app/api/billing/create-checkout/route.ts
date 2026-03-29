// app/api/billing/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    annual:  process.env.STRIPE_STARTER_ANNUAL_PRICE_ID!,
  },
  professional: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    annual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  enterprise: {
    monthly: process.env.STRIPE_ENT_MONTHLY_PRICE_ID!,
    annual:  process.env.STRIPE_ENT_ANNUAL_PRICE_ID!,
  },
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { plan, billing } = await req.json()
  const priceId = PRICE_IDS[plan]?.[billing]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Get org & existing stripe customer
  const { data: profile } = await supabase
    .from('profiles').select('org_id, email, full_name').eq('id', user.id).single()
  const { data: org } = await supabase
    .from('organisations').select('*').eq('id', profile?.org_id).single()

  let customerId = org?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email!,
      name:  profile?.full_name || org?.name,
      metadata: { org_id: org?.id, user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('organisations')
      .update({ stripe_customer_id: customerId })
      .eq('id', org?.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/billing?cancelled=true`,
    metadata: { org_id: org?.id, plan, billing },
    subscription_data: {
      metadata: { org_id: org?.id, plan },
      trial_period_days: org?.plan === 'trial' ? 0 : undefined,
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}

// ── Stripe Webhook Handler ────────────────────────────────
// app/api/billing/webhook/route.ts
export async function webhookHandler(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const orgId  = sub.metadata.org_id
      const plan   = sub.metadata.plan
      const status = sub.status
      const PLAN_LIMITS: Record<string, { max_suppliers: number; max_users: number }> = {
        starter:      { max_suppliers: 25,  max_users: 3   },
        professional: { max_suppliers: 100, max_users: 10  },
        enterprise:   { max_suppliers: 999, max_users: 999 },
      }
      await supabase.from('organisations').update({
        plan, plan_status: status as any,
        stripe_subscription_id: sub.id,
        ...(PLAN_LIMITS[plan] || {}),
      }).eq('id', orgId)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('organisations').update({
        plan: 'trial', plan_status: 'cancelled',
        max_suppliers: 10, max_users: 3,
      }).eq('id', sub.metadata.org_id)
      break
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      const customer = await stripe.customers.retrieve(inv.customer as string) as Stripe.Customer
      await supabase.from('organisations')
        .update({ plan_status: 'past_due' })
        .eq('stripe_customer_id', customer.id)
      break
    }
  }

  // Log all events
  await supabase.from('billing_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as any,
  })

  return NextResponse.json({ received: true })
}
