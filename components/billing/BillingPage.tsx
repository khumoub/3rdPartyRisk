'use client'
import { useState } from 'react'
import { Check, Zap, Shield, Building, Star, ArrowRight, CreditCard } from 'lucide-react'
import { clsx } from 'clsx'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    icon: Zap,
    desc: 'For small compliance teams getting started with TPRM',
    price_monthly: 99,
    price_annual: 79,
    max_suppliers: 25,
    max_users: 3,
    popular: false,
    color: 'border-slate-700',
    features: [
      'Up to 25 suppliers',
      '3 team members',
      'All 7 assessment domains (25 criteria)',
      'Automated risk scoring',
      'PDF report export',
      'Supplier Register view',
      'Email support',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    icon: Shield,
    desc: 'For mid-size organisations managing 100+ vendor relationships',
    price_monthly: 299,
    price_annual: 249,
    max_suppliers: 100,
    max_users: 10,
    popular: true,
    color: 'border-blue-500',
    features: [
      'Up to 100 suppliers',
      '10 team members',
      'Custom question builder (add/remove criteria)',
      'Vendor self-assessment portal',
      'Email notifications to vendors',
      'Configurable risk thresholds',
      'Executive dashboard',
      'Overdue review alerts',
      'Priority support',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    desc: 'For banks, telcos and government — unlimited scale',
    price_monthly: 799,
    price_annual: 699,
    max_suppliers: 999,
    max_users: 999,
    popular: false,
    color: 'border-amber-500',
    features: [
      'Unlimited suppliers',
      'Unlimited team members',
      'White-label branding',
      'SSO / SAML authentication',
      'API access for integrations',
      'Custom regulatory frameworks',
      'Dedicated Customer Success Manager',
      'SLA: 99.9% uptime guarantee',
      'On-premise deployment option',
    ],
  },
]

export default function BillingPage() {
  const [annual, setAnnual]           = useState(true)
  const [loading, setLoading]         = useState<string | null>(null)
  const [currentPlan]                 = useState('trial')

  const handleUpgrade = async (planKey: string) => {
    setLoading(planKey)
    // Call your API route that creates a Stripe Checkout session
    const res = await fetch('/api/billing/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planKey, billing: annual ? 'annual' : 'monthly' }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="text-slate-400 text-sm mt-1">
          You are currently on the <span className="text-purple-400 font-medium">14-day Trial</span>.
          Upgrade to unlock full access.
        </p>
      </div>

      {/* Trial status banner */}
      {currentPlan === 'trial' && (
        <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-xl px-5 py-4 mb-8">
          <Star size={18} className="text-purple-400 flex-shrink-0"/>
          <div className="flex-1">
            <p className="text-sm text-purple-300 font-medium">Trial active — 9 days remaining</p>
            <p className="text-xs text-purple-400/70 mt-0.5">Upgrade before your trial ends to keep all your data and assessments.</p>
          </div>
          <div className="text-xs text-purple-400">Expires 28 Jun 2024</div>
        </div>
      )}

      {/* Annual toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={clsx('text-sm', !annual ? 'text-white font-medium' : 'text-slate-400')}>Monthly</span>
        <button onClick={() => setAnnual(a => !a)}
          className={clsx('relative w-12 h-6 rounded-full transition-colors', annual ? 'bg-blue-600' : 'bg-slate-700')}>
          <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            annual ? 'translate-x-6 left-0.5' : 'left-0.5')}/>
        </button>
        <span className={clsx('text-sm', annual ? 'text-white font-medium' : 'text-slate-400')}>
          Annual <span className="text-emerald-400 text-xs font-semibold ml-1">Save 20%</span>
        </span>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {PLANS.map(plan => {
          const price = annual ? plan.price_annual : plan.price_monthly
          const isCurrent = currentPlan === plan.key
          return (
            <div key={plan.key}
              className={clsx('relative rounded-2xl border-2 p-6 flex flex-col transition-all',
                plan.color,
                plan.popular ? 'bg-blue-500/5 shadow-lg shadow-blue-500/10' : 'bg-slate-800/60')}>

              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center',
                  plan.key === 'starter' ? 'bg-slate-700 text-slate-300' :
                  plan.key === 'professional' ? 'bg-blue-600 text-white' : 'bg-amber-500/20 text-amber-400')}>
                  <plan.icon size={20}/>
                </div>
                {isCurrent && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">{plan.desc}</p>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  <span className="text-slate-400 text-sm mb-1">/month</span>
                </div>
                {annual && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    Billed annually (${price * 12}/year)
                  </div>
                )}
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span>👥 {plan.max_users === 999 ? 'Unlimited' : plan.max_users} users</span>
                  <span>🏢 {plan.max_suppliers === 999 ? 'Unlimited' : plan.max_suppliers} suppliers</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check size={13} className="text-emerald-400 flex-shrink-0 mt-0.5"/>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrent && handleUpgrade(plan.key)}
                disabled={isCurrent || loading === plan.key}
                className={clsx(
                  'w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  isCurrent
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : plan.key === 'enterprise'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                )}>
                {loading === plan.key ? 'Redirecting...' : isCurrent ? 'Current Plan' : (
                  <>{plan.key === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'} <ArrowRight size={14}/></>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Current billing info */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm">Billing Details</h3>
          <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <CreditCard size={12}/> Manage payment method
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-xs text-slate-400 mb-1">Current plan</div>
            <div className="text-white font-medium capitalize">{currentPlan}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Next invoice</div>
            <div className="text-white font-medium">—</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Payment method</div>
            <div className="text-white font-medium">None on file</div>
          </div>
        </div>
      </div>
    </div>
  )
}
