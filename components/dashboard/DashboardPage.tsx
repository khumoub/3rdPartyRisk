'use client'
import { useState } from 'react'
import {
  Building2, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Shield, ArrowUpRight, ArrowRight,
  MoreHorizontal, Filter, Download, Plus
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend
} from 'recharts'
import Link from 'next/link'
import { clsx } from 'clsx'
import type { RiskRating } from '@/types'

// ── Risk colour helpers ────────────────────────────────────
export const RISK_COLORS: Record<RiskRating, string> = {
  'LOW RISK':      '#10b981',
  'MEDIUM RISK':   '#f59e0b',
  'HIGH RISK':     '#f97316',
  'CRITICAL RISK': '#ef4444',
}
export const RISK_BG: Record<RiskRating, string> = {
  'LOW RISK':      'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  'MEDIUM RISK':   'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  'HIGH RISK':     'bg-orange-500/10 text-orange-400 ring-orange-500/20',
  'CRITICAL RISK': 'bg-red-500/10 text-red-400 ring-red-500/20',
}

export function RiskBadge({ rating, size = 'sm' }: { rating?: RiskRating | string | null; size?: 'sm' | 'md' }) {
  if (!rating) return <span className="text-xs text-slate-500">Pending</span>
  const r = rating as RiskRating
  return (
    <span className={clsx(
      'inline-flex items-center font-semibold rounded-full ring-1',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      RISK_BG[r] || 'bg-slate-700 text-slate-300 ring-slate-600'
    )}>
      {rating}
    </span>
  )
}

// ── Mock data (replace with Supabase queries) ─────────────
const PORTFOLIO_STATS = {
  total: 87, assessed: 64, pending: 23, overdue: 8,
  avg_score: 61.4,
  by_rating: { critical: 6, high: 14, medium: 28, low: 16, pending: 23 },
}

const SECTION_SCORES = [
  { name: 'Security Policies', score: 72 },
  { name: 'Access Control',    score: 58 },
  { name: 'Data Protection',   score: 65 },
  { name: 'Incident Response', score: 71 },
  { name: 'Network Security',  score: 49 },
  { name: 'Supply Chain',      score: 55 },
  { name: 'BCP / DR',          score: 68 },
]

const TREND_DATA = [
  { month: 'Jan', avg: 54 }, { month: 'Feb', avg: 57 },
  { month: 'Mar', avg: 59 }, { month: 'Apr', avg: 61 },
  { month: 'May', avg: 60 }, { month: 'Jun', avg: 63 },
]

const RECENT_ASSESSMENTS = [
  { id: '1', supplier: 'Cisco Systems', score: 84, rating: 'LOW RISK' as RiskRating, date: '2024-06-10', assessor: 'K. Morupule' },
  { id: '2', supplier: 'Oracle Africa', score: 48, rating: 'HIGH RISK' as RiskRating, date: '2024-06-08', assessor: 'T. Kgosi' },
  { id: '3', supplier: 'MTN Business', score: 61, rating: 'MEDIUM RISK' as RiskRating, date: '2024-06-05', assessor: 'K. Morupule' },
  { id: '4', supplier: 'FNB Systems', score: 21, rating: 'CRITICAL RISK' as RiskRating, date: '2024-06-03', assessor: 'S. Dube' },
  { id: '5', supplier: 'SAP SE', score: 78, rating: 'LOW RISK' as RiskRating, date: '2024-06-01', assessor: 'K. Morupule' },
]

const PIE_DATA = [
  { name: 'Critical', value: 6,  color: '#ef4444' },
  { name: 'High',     value: 14, color: '#f97316' },
  { name: 'Medium',   value: 28, color: '#f59e0b' },
  { name: 'Low',      value: 16, color: '#10b981' },
  { name: 'Pending',  value: 23, color: '#475569' },
]

// ── KPI Card ──────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, trend, color = 'blue' }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; trend?: string; color?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    red:  'bg-red-500/10 text-red-400',
    amber:'bg-amber-500/10 text-amber-400',
    green:'bg-emerald-500/10 text-emerald-400',
  }
  return (
    <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors[color])}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp size={12} /> {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState<'30d' | '90d' | '1y'>('90d')

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Third-party cybersecurity risk portfolio overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            {(['30d','90d','1y'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={clsx('px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  period===p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Suppliers" value={PORTFOLIO_STATS.total}
          icon={Building2} sub="Across all tiers" color="blue" />
        <KpiCard label="Critical / High Risk" value={PORTFOLIO_STATS.by_rating.critical + PORTFOLIO_STATS.by_rating.high}
          icon={AlertTriangle} sub="Require immediate action" color="red" />
        <KpiCard label="Pending Assessment" value={PORTFOLIO_STATS.pending}
          icon={Clock} sub="Not yet assessed" color="amber" />
        <KpiCard label="Avg Portfolio Score" value={`${PORTFOLIO_STATS.avg_score}%`}
          icon={Shield} trend="+3.2% vs last period" color="green" />
      </div>

      {/* Alert bar for critical suppliers */}
      {PORTFOLIO_STATS.by_rating.critical > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3.5">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">
            <strong>{PORTFOLIO_STATS.by_rating.critical} suppliers</strong> are rated CRITICAL RISK and require immediate escalation to your Risk Committee.
          </span>
          <Link href="/suppliers?filter=critical" className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium flex-shrink-0">
            View all <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk distribution donut */}
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={2} dataKey="value">
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} suppliers`]} contentStyle={{
                background:'#1e293b', border:'1px solid #334155', borderRadius:'8px', fontSize:'12px'
              }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}/>
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-medium text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Domain scores bar chart */}
        <div className="lg:col-span-2 bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Average Score by Domain</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SECTION_SCORES} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:11}} tickLine={false}
                angle={-20} textAnchor="end" height={45}/>
              <YAxis tick={{fill:'#94a3b8',fontSize:11}} tickLine={false} axisLine={false} domain={[0,100]}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:'8px',fontSize:'12px'}}
                formatter={(v)=>[`${v}%`]}/>
              <Bar dataKey="score" radius={[4,4,0,0]}>
                {SECTION_SCORES.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 75 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend + Recent assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score trend */}
        <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Portfolio Score Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
              <XAxis dataKey="month" tick={{fill:'#94a3b8',fontSize:11}} tickLine={false}/>
              <YAxis tick={{fill:'#94a3b8',fontSize:11}} tickLine={false} axisLine={false} domain={[40,80]}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:'8px',fontSize:'12px'}}
                formatter={(v)=>[`${v}%`,'Avg score']}/>
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2}
                dot={{fill:'#3b82f6',r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent assessments */}
        <div className="lg:col-span-2 bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">Recent Assessments</h3>
            <Link href="/assessments" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight size={12}/>
            </Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {RECENT_ASSESSMENTS.map(a => (
              <Link key={a.id} href={`/assessments/${a.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-700/30 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-slate-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{a.supplier}</div>
                  <div className="text-xs text-slate-500">{a.date} · {a.assessor}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-white">{a.score}%</span>
                  <RiskBadge rating={a.rating}/>
                  <ArrowUpRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors"/>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Assessment', icon: ClipboardList, href: '/assessments/new', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'Add Supplier', icon: Plus, href: '/suppliers/new', color: 'bg-slate-700 hover:bg-slate-600' },
          { label: 'Send Vendor Invite', icon: Mail, href: '/assessments/invite', color: 'bg-slate-700 hover:bg-slate-600' },
          { label: 'Export Report', icon: Download, href: '/reports', color: 'bg-slate-700 hover:bg-slate-600' },
        ].map(({ label, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className={clsx('flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-colors', color)}>
            <Icon size={16}/> {label}
          </Link>
        ))}
      </div>

    </div>
  )
}

// Named exports for use in other pages
export { DashboardPage }
const ClipboardList = ({ size, ...props }: { size: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
    <path d="M9 12h6M9 16h4"/>
  </svg>
)
const Mail = ({ size, ...props }: { size: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
