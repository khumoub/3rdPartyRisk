'use client'
import { useState, useCallback } from 'react'
import {
  ChevronDown, ChevronUp, Save, CheckCircle,
  AlertCircle, Info, ArrowLeft, Send, FileText
} from 'lucide-react'
import { clsx } from 'clsx'
import { RiskBadge, RISK_COLORS } from '@/components/dashboard/DashboardPage'
import type { RiskRating } from '@/types'

// ── Score button component ─────────────────────────────────
const SCORE_CONFIG = [
  { value: 0, label: '0', desc: 'Not implemented', color: 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20' },
  { value: 1, label: '1', desc: 'Partial / ad hoc', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' },
  { value: 2, label: '2', desc: 'Defined & documented', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
  { value: 3, label: '3', desc: 'Optimised & tested', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' },
]

function ScoreButton({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) {
  const cfg = SCORE_CONFIG[value]
  return (
    <button onClick={onClick}
      className={clsx(
        'flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all text-center min-w-[80px]',
        selected ? `${cfg.color} ring-2 ring-offset-2 ring-offset-slate-800 scale-105 shadow-lg` : `border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500`,
        selected && cfg.color
      )}>
      <span className={clsx('text-2xl font-bold', selected ? '' : 'text-slate-300')}>{cfg.label}</span>
      <span className="text-xs leading-tight">{cfg.desc}</span>
    </button>
  )
}

// ── Guidance tooltip ───────────────────────────────────────
function GuidanceText({ score, guidances }: { score: number | null; guidances: string[] }) {
  if (score === null) return (
    <p className="text-xs text-slate-500 italic">Select a score to see guidance for this criterion.</p>
  )
  const guidance = guidances[score]
  const colors = ['text-red-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400']
  return (
    <div className={clsx('flex items-start gap-2 text-xs', colors[score])}>
      <Info size={14} className="flex-shrink-0 mt-0.5"/>
      <span>{guidance || 'No guidance available for this score.'}</span>
    </div>
  )
}

// ── Mock data ─────────────────────────────────────────────
const MOCK_SECTIONS = [
  {
    id: 's1', code: '1', title: 'General Security Policies', label: 'GOVERN',
    nist_ref: 'GV.PO', iso_ref: 'A.5.1', weight_pct: 10,
    color: 'from-purple-900/30 to-slate-800/60',
    criteria: [
      { id: 'c1', ref: '1.1', question: 'Formal information security policy exists', weight_pts: 3.33,
        guidances: ['No policy exists', 'Draft or informal policy in place', 'Documented and management-approved', 'Annual review cycle; staff acknowledgement tracked'] },
      { id: 'c2', ref: '1.2', question: 'Security awareness training programme in place', weight_pts: 3.33,
        guidances: ['No training programme', 'Ad hoc or one-off sessions only', 'Annual training with tracked completion', 'Quarterly training + phishing simulations running'] },
      { id: 'c3', ref: '1.3', question: 'Roles and responsibilities for information security defined', weight_pts: 3.33,
        guidances: ['Not defined anywhere', 'Informally assigned', 'Documented in job descriptions or policy', 'RACI matrix in place; reviewed annually'] },
    ]
  },
  {
    id: 's2', code: '2', title: 'Access Control', label: 'PROTECT',
    nist_ref: 'PR.AA', iso_ref: 'A.8.2', weight_pct: 20,
    color: 'from-blue-900/30 to-slate-800/60',
    criteria: [
      { id: 'c4', ref: '2.1', question: 'Role-based access controls for client and sensitive data', weight_pts: 5,
        guidances: ['No access controls documented', 'Shared credentials or passwords only', 'RBAC/ABAC implemented with documented procedures', 'Least-privilege enforced; automated provisioning and deprovisioning'] },
      { id: 'c5', ref: '2.2', question: 'Multi-factor authentication (MFA) on all sensitive systems', weight_pts: 5,
        guidances: ['No MFA deployed', 'MFA on some systems only', 'MFA on all external-facing systems', 'MFA everywhere including privileged access'] },
      { id: 'c6', ref: '2.3', question: 'Privileged account management (PAM) controls', weight_pts: 5,
        guidances: ['No PAM controls', 'Manual tracking of admin accounts', 'PAM solution in use with periodic access reviews', 'PAM + JIT access + quarterly recertification'] },
      { id: 'c7', ref: '2.4', question: 'Joiners / movers / leavers (JML) process enforced', weight_pts: 5,
        guidances: ['No JML process defined', 'Ad hoc deprovisioning only', 'Documented JML process; HR-triggered deprovisioning', 'Automated JML integrated with HR system; SLA tracked'] },
    ]
  },
  {
    id: 's3', code: '3', title: 'Data Protection', label: 'PROTECT',
    nist_ref: 'PR.DS', iso_ref: 'A.8.10', weight_pct: 25,
    color: 'from-emerald-900/30 to-slate-800/60',
    criteria: [
      { id: 'c8', ref: '3.1', question: 'Data encrypted at rest and in transit', weight_pts: 4.17,
        guidances: ['No encryption used', 'In-transit only (basic TLS)', 'AES-256 at rest + TLS 1.2 in transit', 'AES-256 + TLS 1.3 + key management policy'] },
      { id: 'c9', ref: '3.2', question: 'Data Loss Prevention (DLP) strategy and tooling', weight_pts: 4.17,
        guidances: ['No DLP in place', 'Policy only; no tooling deployed', 'DLP deployed on email and endpoint', 'Comprehensive DLP with real-time alerting'] },
      { id: 'c10', ref: '3.3', question: 'Data backup and tested disaster recovery', weight_pts: 4.17,
        guidances: ['No formal backup', 'Backups taken but untested', 'Daily backups; documented RTO/RPO', 'Automated daily; tested quarterly; geographically separate copy'] },
      { id: 'c11', ref: '3.4', question: 'Cross-border data transfer safeguards', weight_pts: 4.17,
        guidances: ['No controls on transfers', 'Transfers occur uncontrolled', 'Data residency policy exists', 'Contractual safeguards + signed DPAs'] },
      { id: 'c12', ref: '3.5', question: 'Data Protection Act / GDPR compliance programme', weight_pts: 4.17,
        guidances: ['No awareness', 'Partial awareness; no formal programme', 'Measures documented; not verified', 'DPO appointed; DPIA conducted; breach notification procedures'] },
    ]
  },
]

// ── Score computation ──────────────────────────────────────
function computeScore(scores: Record<string, number | null>) {
  let weightedSum = 0; let totalWeight = 0
  MOCK_SECTIONS.forEach(sec => {
    sec.criteria.forEach(cr => {
      const s = scores[cr.id]
      if (s !== null && s !== undefined) {
        weightedSum += (s / 3) * cr.weight_pts
        totalWeight += cr.weight_pts
      }
    })
  })
  if (totalWeight === 0) return null
  return Math.round((weightedSum / totalWeight) * 100 * 10) / 10
}

function getRating(score: number | null, thresholds = { low: 75, medium: 50, high: 25 }): RiskRating | null {
  if (score === null) return null
  if (score >= thresholds.low)    return 'LOW RISK'
  if (score >= thresholds.medium) return 'MEDIUM RISK'
  if (score >= thresholds.high)   return 'HIGH RISK'
  return 'CRITICAL RISK'
}

// ── Main Assessment Page ────────────────────────────────────
export default function AssessmentPage() {
  const [scores, setScores]     = useState<Record<string, number | null>>({})
  const [notes, setNotes]       = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ s1: true })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  const totalCriteria  = MOCK_SECTIONS.reduce((a,s) => a + s.criteria.length, 0)
  const answeredCount  = Object.values(scores).filter(s => s !== null && s !== undefined).length
  const progress       = Math.round((answeredCount / totalCriteria) * 100)
  const compositeScore = computeScore(scores)
  const riskRating     = getRating(compositeScore)

  const setScore = useCallback((criteriaId: string, value: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: prev[criteriaId] === value ? null : value }))
    setSaved(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false); setSaved(true)
  }

  const scoreColor = compositeScore === null ? '#64748b' :
    compositeScore >= 75 ? '#10b981' : compositeScore >= 50 ? '#f59e0b' :
    compositeScore >= 25 ? '#f97316' : '#ef4444'

  return (
    <div className="flex h-full">
      {/* Left: assessment form */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16}/> Back to suppliers
          </button>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Cisco Systems Ltd</h1>
            <p className="text-slate-400 text-sm mt-1">Assessment Ref: TPRM-2024-1041 · Tier 1 · Network Infrastructure</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                saved ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40' :
                'bg-blue-600 hover:bg-blue-700 text-white')}>
              {saving ? 'Saving...' : saved ? <><CheckCircle size={15}/> Saved</> : <><Save size={15}/> Save Progress</>}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Send size={15}/> Submit Assessment
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {MOCK_SECTIONS.map(section => {
            const isOpen = expanded[section.id]
            const sectionScores = section.criteria.map(c => scores[c.id]).filter(s => s !== null && s !== undefined)
            const sectionAnswered = sectionScores.length
            const sectionPct = sectionAnswered > 0
              ? Math.round(sectionScores.reduce((a,s) => a! + s!, 0)! / (sectionAnswered * 3) * 100)
              : null

            return (
              <div key={section.id} className="rounded-xl border border-slate-700/50 overflow-hidden">
                {/* Section header */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [section.id]: !isOpen }))}
                  className={clsx('w-full flex items-center gap-4 px-5 py-4 bg-gradient-to-r text-left transition-colors hover:opacity-90', section.color)}>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white/80">
                      {section.label}
                    </span>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        Section {section.code}: {section.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Weight: {section.weight_pct}% · NIST: {section.nist_ref} · ISO: {section.iso_ref}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-xs text-slate-400">
                      {sectionAnswered}/{section.criteria.length} answered
                    </div>
                    {sectionPct !== null && (
                      <div className={clsx('text-sm font-bold',
                        sectionPct >= 75 ? 'text-emerald-400' : sectionPct >= 50 ? 'text-amber-400' : 'text-red-400')}>
                        {sectionPct}%
                      </div>
                    )}
                    {isOpen ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                  </div>
                </button>

                {/* Criteria */}
                {isOpen && (
                  <div className="divide-y divide-slate-700/30">
                    {section.criteria.map((cr, idx) => {
                      const currentScore = scores[cr.id] ?? null
                      return (
                        <div key={cr.id} className="p-5 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="text-xs font-bold text-slate-500 mt-0.5 min-w-[32px]">{cr.ref}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{cr.question}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Weight: {cr.weight_pts.toFixed(2)} pts
                              </p>
                            </div>
                          </div>
                          {/* Score buttons */}
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {[0,1,2,3].map(v => (
                              <ScoreButton key={v} value={v} selected={currentScore === v}
                                onClick={() => setScore(cr.id, v)}/>
                            ))}
                          </div>
                          {/* Guidance */}
                          <div className="mb-3">
                            <GuidanceText score={currentScore} guidances={cr.guidances}/>
                          </div>
                          {/* Notes */}
                          <textarea
                            value={notes[cr.id] || ''}
                            onChange={e => setNotes(p => ({ ...p, [cr.id]: e.target.value }))}
                            placeholder="Add notes or evidence reference (optional)..."
                            rows={2}
                            className="w-full text-xs bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: sticky score panel */}
      <div className="w-72 flex-shrink-0 bg-slate-900/80 border-l border-slate-700/50 p-5 overflow-y-auto">
        <h3 className="font-semibold text-white mb-4 text-sm">Live Score</h3>

        {/* Big score */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-4 text-center border border-slate-700/50">
          <div className="text-5xl font-bold mb-1" style={{ color: scoreColor }}>
            {compositeScore !== null ? `${compositeScore}%` : '—'}
          </div>
          <div className="mt-2">
            {riskRating ? <RiskBadge rating={riskRating} size="md"/> : (
              <span className="text-xs text-slate-500">Score criteria to see rating</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Completion</span>
            <span>{answeredCount} / {totalCriteria}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }}/>
          </div>
          <div className="text-xs text-slate-500 mt-1">{progress}% complete</div>
        </div>

        {/* Section breakdown */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-medium text-slate-400 mb-2">Section Progress</div>
          {MOCK_SECTIONS.map(sec => {
            const answered = sec.criteria.filter(c => scores[c.id] !== null && scores[c.id] !== undefined).length
            const total = sec.criteria.length
            const pct = total > 0 ? Math.round(answered/total*100) : 0
            return (
              <div key={sec.id}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span className="truncate">{sec.title}</span>
                  <span>{answered}/{total}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full">
                  <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${pct}%` }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-700/50">
          <button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save size={15}/> Save Progress
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
            <FileText size={15}/> Export PDF
          </button>
        </div>

        {/* Thresholds legend */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-1.5">
          <div className="text-xs font-medium text-slate-400 mb-2">Rating Thresholds</div>
          {[
            { label: 'Low Risk', range: '≥ 75%', color: '#10b981' },
            { label: 'Medium',   range: '≥ 50%', color: '#f59e0b' },
            { label: 'High',     range: '≥ 25%', color: '#f97316' },
            { label: 'Critical', range: '< 25%', color: '#ef4444' },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: t.color }}/>
                <span className="text-slate-400">{t.label}</span>
              </div>
              <span className="text-slate-500">{t.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
