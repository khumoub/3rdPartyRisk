// ============================================================
// TPRM Pro — TypeScript Types
// ============================================================

export type Plan = 'trial' | 'starter' | 'professional' | 'enterprise'
export type PlanStatus = 'active' | 'past_due' | 'cancelled' | 'trialing'
export type UserRole = 'owner' | 'admin' | 'assessor' | 'viewer'
export type AssessmentStatus = 'draft' | 'in_progress' | 'completed' | 'archived'
export type RiskRating = 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'CRITICAL RISK'
export type DataAccessLevel = 'None' | 'Restricted' | 'Confidential' | 'Highly Confidential'
export type SupplierStatus = 'active' | 'inactive' | 'under_review'
export type InvitationStatus = 'pending' | 'opened' | 'completed' | 'expired'

export interface Organisation {
  id: string
  name: string
  slug: string
  logo_url?: string
  industry?: string
  country: string
  plan: Plan
  plan_status: PlanStatus
  stripe_customer_id?: string
  stripe_subscription_id?: string
  trial_ends_at?: string
  max_suppliers: number
  max_users: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  org_id: string
  full_name?: string
  email: string
  role: UserRole
  avatar_url?: string
  job_title?: string
  department?: string
  last_active_at?: string
  created_at: string
  updated_at: string
}

export interface RiskConfig {
  id: string
  org_id: string
  low_threshold: number
  medium_threshold: number
  high_threshold: number
  assessment_validity_months: number
  tier1_review_months: number
  tier2_review_months: number
  tier3_review_months: number
}

export interface Section {
  id: string
  org_id: string
  code: string
  title: string
  label: string
  nist_ref?: string
  iso_ref?: string
  weight_pct: number
  sort_order: number
  is_active: boolean
  criteria?: Criteria[]
}

export interface Criteria {
  id: string
  org_id: string
  section_id: string
  ref: string
  question: string
  guidance_0?: string
  guidance_1?: string
  guidance_2?: string
  guidance_3?: string
  weight_pts: number
  sort_order: number
  is_active: boolean
  is_custom: boolean
  section?: Section
}

export interface Supplier {
  id: string
  org_id: string
  name: string
  contact_name?: string
  contact_email?: string
  service_category?: string
  data_access_level?: DataAccessLevel
  tier?: 1 | 2 | 3
  country?: string
  website?: string
  notes?: string
  status: SupplierStatus
  created_at: string
  updated_at: string
  // Joined
  latest_assessment?: Assessment
  assessments_count?: number
}

export interface Assessment {
  id: string
  org_id: string
  supplier_id: string
  assessed_by?: string
  reference_no?: string
  status: AssessmentStatus
  assessment_date?: string
  valid_until?: string
  next_review_date?: string
  composite_score?: number
  risk_rating?: RiskRating
  general_notes?: string
  submitted_at?: string
  created_at: string
  updated_at: string
  // Joined
  supplier?: Supplier
  assessor?: Profile
  scores?: AssessmentScore[]
}

export interface AssessmentScore {
  id: string
  assessment_id: string
  criteria_id: string
  score?: number
  notes?: string
  evidence_url?: string
  scored_by?: string
  scored_at: string
  // Joined
  criteria?: Criteria
}

export interface VendorInvitation {
  id: string
  org_id: string
  supplier_id: string
  assessment_id?: string
  token: string
  sent_to_email: string
  sent_by?: string
  status: InvitationStatus
  expires_at: string
  opened_at?: string
  completed_at?: string
  created_at: string
}

// ── Dashboard / Analytics Types ──────────────────────────────

export interface PortfolioStats {
  total_suppliers: number
  assessed: number
  pending: number
  overdue: number
  avg_score: number
  by_rating: {
    critical: number
    high: number
    medium: number
    low: number
    pending: number
  }
  by_tier: {
    tier1: number
    tier2: number
    tier3: number
  }
}

export interface SectionScore {
  section_id: string
  section_title: string
  section_label: string
  weight_pct: number
  score_achieved: number
  max_score: number
  percentage: number
}

// ── Stripe / Billing ─────────────────────────────────────────

export const PLANS = {
  starter: {
    name: 'Starter',
    price_monthly: 99,
    price_annual: 79,
    max_suppliers: 25,
    max_users: 3,
    features: ['Up to 25 suppliers', '3 users', 'All assessment features', 'PDF reports', 'Email support'],
    stripe_price_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    stripe_price_annual:  process.env.STRIPE_STARTER_ANNUAL_PRICE_ID!,
  },
  professional: {
    name: 'Professional',
    price_monthly: 299,
    price_annual: 249,
    max_suppliers: 100,
    max_users: 10,
    features: ['Up to 100 suppliers', '10 users', 'Custom question builder', 'Vendor self-assessment portal', 'Priority support', 'API access'],
    stripe_price_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    stripe_price_annual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  enterprise: {
    name: 'Enterprise',
    price_monthly: 799,
    price_annual: 699,
    max_suppliers: 999,
    max_users: 999,
    features: ['Unlimited suppliers', 'Unlimited users', 'White-label branding', 'SSO / SAML', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee'],
    stripe_price_monthly: process.env.STRIPE_ENT_MONTHLY_PRICE_ID!,
    stripe_price_annual:  process.env.STRIPE_ENT_ANNUAL_PRICE_ID!,
  },
} as const

export type PlanKey = keyof typeof PLANS

// ── API Response Types ────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ── Form Types ────────────────────────────────────────────────

export interface SupplierFormData {
  name: string
  contact_name?: string
  contact_email?: string
  service_category?: string
  data_access_level?: DataAccessLevel
  tier?: 1 | 2 | 3
  country?: string
  website?: string
  notes?: string
}

export interface CriteriaFormData {
  ref: string
  question: string
  guidance_0: string
  guidance_1: string
  guidance_2: string
  guidance_3: string
  weight_pts: number
  section_id: string
  is_active: boolean
}

export interface AssessmentScoreInput {
  criteria_id: string
  score: number
  notes?: string
}
