'use client'
import { useState } from 'react'
import {
  Plus, Search, Filter, Building2, ChevronRight,
  Mail, Globe, AlertTriangle, CheckCircle, Clock,
  MoreHorizontal, ArrowUpDown, Shield
} from 'lucide-react'
import { clsx } from 'clsx'
import { RiskBadge } from '@/components/dashboard/DashboardPage'
import type { RiskRating, DataAccessLevel } from '@/types'

// Mock supplier data
const MOCK_SUPPLIERS = [
  { id:'1', name:'Cisco Systems Ltd',    tier:1, service:'Network Infrastructure', access:'Highly Confidential', score:84, rating:'LOW RISK' as RiskRating,    status:'active', last_assessed:'2024-06-10', next_review:'2025-06-10', country:'USA' },
  { id:'2', name:'Oracle Africa (Pty)', tier:1, service:'Database & Cloud',        access:'Confidential',        score:48, rating:'HIGH RISK' as RiskRating,   status:'active', last_assessed:'2024-06-08', next_review:'2025-06-08', country:'South Africa' },
  { id:'3', name:'MTN Business',         tier:2, service:'Telecommunications',     access:'Restricted',          score:61, rating:'MEDIUM RISK' as RiskRating, status:'active', last_assessed:'2024-06-05', next_review:'2026-06-05', country:'Botswana' },
  { id:'4', name:'FNB Systems',          tier:1, service:'Core Banking Integration',access:'Highly Confidential', score:21, rating:'CRITICAL RISK' as RiskRating,status:'active', last_assessed:'2024-06-03', next_review:'2025-06-03', country:'South Africa' },
  { id:'5', name:'SAP SE',               tier:2, service:'ERP Software',           access:'Confidential',        score:78, rating:'LOW RISK' as RiskRating,    status:'active', last_assessed:'2024-06-01', next_review:'2026-06-01', country:'Germany' },
  { id:'6', name:'Microsoft Azure',      tier:1, service:'Cloud Infrastructure',   access:'Confidential',        score:91, rating:'LOW RISK' as RiskRating,    status:'active', last_assessed:'2024-05-28', next_review:'2025-05-28', country:'USA' },
  { id:'7', name:'Nedbank IT Services',  tier:2, service:'Payment Processing',     access:'Highly Confidential', score:55, rating:'MEDIUM RISK' as RiskRating, status:'active', last_assessed:'2024-05-20', next_review:'2026-05-20', country:'South Africa' },
  { id:'8', name:'Liquid Intelligent',   tier:3, service:'Internet Connectivity',  access:'Restricted',          score:null as any, rating:null as any,         status:'active', last_assessed: null as any,  next_review:'2024-07-01', country:'Botswana' },
  { id:'9', name:'Dimension Data',       tier:2, service:'IT Support Services',    access:'Restricted',          score:null as any, rating:null as any,         status:'active', last_assessed: null as any,  next_review:'2024-07-15', country:'South Africa' },
  { id:'10',name:'Temenos AG',           tier:1, service:'Core Banking Software',  access:'Highly Confidential', score:33, rating:'HIGH RISK' as RiskRating,   status:'under_review', last_assessed:'2024-04-10', next_review:'2025-04-10', country:'Switzerland' },
]

type FilterRating = 'all' | 'CRITICAL RISK' | 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' | 'pending'
type FilterTier   = 'all' | '1' | '2' | '3'

const ACCESS_COLORS: Record<DataAccessLevel, string> = {
  'Highly Confidential': 'text-red-400 bg-red-500/10',
  'Confidential':        'text-amber-400 bg-amber-500/10',
  'Restricted':          'text-blue-400 bg-blue-500/10',
  'None':                'text-slate-400 bg-slate-700',
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-red-500/20 text-red-300 ring-red-500/30',
  2: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  3: 'bg-slate-700 text-slate-300 ring-slate-600',
}

function AddSupplierModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', contact_name: '', contact_email: '', service_category: '',
    data_access_level: 'Restricted', tier: '2', country: 'Botswana', website: '', notes: ''
  })
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}/>
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Add New Supplier</h2>
          <p className="text-sm text-slate-400 mt-0.5">Enter supplier details to begin tracking</p>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {[
            { label:'Supplier Name *', key:'name', type:'text', placeholder:'e.g. Cisco Systems Ltd' },
            { label:'Contact Person',  key:'contact_name', type:'text', placeholder:'Full name' },
            { label:'Contact Email',   key:'contact_email', type:'email', placeholder:'vendor@company.com' },
            { label:'Service Category',key:'service_category', type:'text', placeholder:'e.g. Cloud Infrastructure' },
            { label:'Country',         key:'country', type:'text', placeholder:'Botswana' },
            { label:'Website',         key:'website', type:'url', placeholder:'https://...' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Risk Tier</label>
              <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="1">Tier 1 — Critical</option>
                <option value="2">Tier 2 — Important</option>
                <option value="3">Tier 3 — Low risk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Data Access Level</label>
              <select value={form.data_access_level} onChange={e => setForm(p => ({ ...p, data_access_level: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option>None</option><option>Restricted</option>
                <option>Confidential</option><option>Highly Confidential</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2} placeholder="Any additional context..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"/>
          </div>
        </div>
        <div className="p-6 border-t border-slate-700 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Add Supplier
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuppliersPage() {
  const [search, setSearch]       = useState('')
  const [ratingFilter, setRating] = useState<FilterRating>('all')
  const [tierFilter, setTier]     = useState<FilterTier>('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = MOCK_SUPPLIERS.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (ratingFilter !== 'all') {
      if (ratingFilter === 'pending' && s.rating) return false
      if (ratingFilter !== 'pending' && s.rating !== ratingFilter) return false
    }
    if (tierFilter !== 'all' && s.tier?.toString() !== tierFilter) return false
    return true
  })

  const counts = {
    critical: MOCK_SUPPLIERS.filter(s => s.rating === 'CRITICAL RISK').length,
    high:     MOCK_SUPPLIERS.filter(s => s.rating === 'HIGH RISK').length,
    medium:   MOCK_SUPPLIERS.filter(s => s.rating === 'MEDIUM RISK').length,
    low:      MOCK_SUPPLIERS.filter(s => s.rating === 'LOW RISK').length,
    pending:  MOCK_SUPPLIERS.filter(s => !s.rating).length,
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-slate-400 text-sm mt-0.5">{MOCK_SUPPLIERS.length} vendors tracked across all tiers</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16}/> Add Supplier
        </button>
      </div>

      {/* Quick filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key:'all',           label:`All (${MOCK_SUPPLIERS.length})`, color:'bg-slate-700 text-slate-300 hover:bg-slate-600' },
          { key:'CRITICAL RISK', label:`Critical (${counts.critical})`,  color:'bg-red-500/20 text-red-400 hover:bg-red-500/30' },
          { key:'HIGH RISK',     label:`High (${counts.high})`,          color:'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' },
          { key:'MEDIUM RISK',   label:`Medium (${counts.medium})`,      color:'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' },
          { key:'LOW RISK',      label:`Low (${counts.low})`,            color:'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' },
          { key:'pending',       label:`Pending (${counts.pending})`,    color:'bg-slate-700 text-slate-400 hover:bg-slate-600' },
        ].map(f => (
          <button key={f.key} onClick={() => setRating(f.key as FilterRating)}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-all ring-1 ring-transparent',
              f.color, ratingFilter === f.key ? 'ring-white/30 scale-105' : '')}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {(['all','1','2','3'] as FilterTier[]).map(t => (
            <button key={t} onClick={() => setTier(t)}
              className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                tierFilter === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white')}>
              {t === 'all' ? 'All Tiers' : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search suppliers by name, service or country..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
      </div>

      {/* Supplier table */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Supplier','Tier','Service','Data Access','Last Assessed','Score','Rating','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-slate-400"/>
                      </div>
                      <div>
                        <div className="font-medium text-white">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={clsx('inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ring-1', TIER_COLORS[s.tier])}>
                      T{s.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 text-xs max-w-[160px] truncate">{s.service}</td>
                  <td className="px-4 py-3.5">
                    <span className={clsx('text-xs px-2 py-0.5 rounded', ACCESS_COLORS[s.access as DataAccessLevel] || 'text-slate-400 bg-slate-700')}>
                      {s.access}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                    {s.last_assessed || <span className="text-slate-600 italic">Not assessed</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {s.score != null ? (
                      <span className={clsx('font-bold text-sm',
                        s.score >= 75 ? 'text-emerald-400' : s.score >= 50 ? 'text-amber-400' :
                        s.score >= 25 ? 'text-orange-400' : 'text-red-400')}>
                        {s.score}%
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs italic">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5"><RiskBadge rating={s.rating}/></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Assess</button>
                      <button className="text-xs text-slate-400 hover:text-slate-300">View</button>
                      <button className="text-slate-600 hover:text-slate-400"><MoreHorizontal size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield size={32} className="text-slate-600 mb-3"/>
            <p className="text-slate-400 font-medium">No suppliers found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {MOCK_SUPPLIERS.length} suppliers</span>
          <span>Next overdue review: <span className="text-amber-400">Liquid Intelligent — 2024-07-01</span></span>
        </div>
      </div>

      <AddSupplierModal open={showModal} onClose={() => setShowModal(false)}/>
    </div>
  )
}
