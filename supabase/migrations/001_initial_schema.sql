-- ============================================================
-- TPRM PRO — Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ORGANISATIONS (one per paying company) ─────────────────
CREATE TABLE organisations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  logo_url      TEXT,
  industry      TEXT,
  country       TEXT DEFAULT 'Botswana',
  plan          TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','professional','enterprise')),
  plan_status   TEXT NOT NULL DEFAULT 'active' CHECK (plan_status IN ('active','past_due','cancelled','trialing')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  max_suppliers INT DEFAULT 10,
  max_users     INT DEFAULT 3,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── USERS / PROFILES ───────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id          UUID REFERENCES organisations(id) ON DELETE CASCADE,
  full_name       TEXT,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'assessor' CHECK (role IN ('owner','admin','assessor','viewer')),
  avatar_url      TEXT,
  job_title       TEXT,
  department      TEXT,
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── RISK APPETITE CONFIG (per org) ─────────────────────────
CREATE TABLE risk_config (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID UNIQUE REFERENCES organisations(id) ON DELETE CASCADE,
  low_threshold     INT DEFAULT 75,   -- score % >= this = LOW
  medium_threshold  INT DEFAULT 50,
  high_threshold    INT DEFAULT 25,
  -- CRITICAL = below high_threshold
  assessment_validity_months INT DEFAULT 12,
  tier1_review_months INT DEFAULT 12,
  tier2_review_months INT DEFAULT 24,
  tier3_review_months INT DEFAULT 36,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── SECTIONS (grouped criteria) ────────────────────────────
CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID REFERENCES organisations(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,           -- '1', '2', '3'...
  title       TEXT NOT NULL,
  label       TEXT NOT NULL,           -- 'GOVERN', 'PROTECT'...
  nist_ref    TEXT,
  iso_ref     TEXT,
  weight_pct  INT NOT NULL DEFAULT 10, -- section weight %
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- ── CRITERIA (assessment questions) ────────────────────────
CREATE TABLE criteria (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID REFERENCES organisations(id) ON DELETE CASCADE,
  section_id    UUID REFERENCES sections(id) ON DELETE CASCADE,
  ref           TEXT NOT NULL,          -- '1.1', '1.2'...
  question      TEXT NOT NULL,
  guidance_0    TEXT,                   -- score 0 description
  guidance_1    TEXT,
  guidance_2    TEXT,
  guidance_3    TEXT,
  weight_pts    NUMERIC(5,2) NOT NULL,  -- weight points (section_weight / n_criteria)
  sort_order    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  is_custom     BOOLEAN DEFAULT FALSE,  -- user-added vs default
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, ref)
);

-- ── SUPPLIERS ───────────────────────────────────────────────
CREATE TABLE suppliers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  contact_name      TEXT,
  contact_email     TEXT,
  service_category  TEXT,
  data_access_level TEXT CHECK (data_access_level IN ('None','Restricted','Confidential','Highly Confidential')),
  tier              INT CHECK (tier IN (1,2,3)),
  country           TEXT,
  website           TEXT,
  notes             TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','under_review')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── ASSESSMENTS ─────────────────────────────────────────────
CREATE TABLE assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES organisations(id) ON DELETE CASCADE,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  assessed_by     UUID REFERENCES profiles(id),
  reference_no    TEXT UNIQUE,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','archived')),
  assessment_date DATE,
  valid_until     DATE,
  next_review_date DATE,
  composite_score NUMERIC(5,2),        -- 0-100, calculated
  risk_rating     TEXT CHECK (risk_rating IN ('LOW RISK','MEDIUM RISK','HIGH RISK','CRITICAL RISK')),
  general_notes   TEXT,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ASSESSMENT SCORES (one row per criterion per assessment) ─
CREATE TABLE assessment_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id   UUID REFERENCES assessments(id) ON DELETE CASCADE,
  criteria_id     UUID REFERENCES criteria(id) ON DELETE CASCADE,
  score           INT CHECK (score BETWEEN 0 AND 3),
  notes           TEXT,
  evidence_url    TEXT,               -- link to attached doc
  scored_by       UUID REFERENCES profiles(id),
  scored_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, criteria_id)
);

-- ── VENDOR INVITATIONS (self-assessment links) ──────────────
CREATE TABLE vendor_invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES organisations(id) ON DELETE CASCADE,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  assessment_id   UUID REFERENCES assessments(id),
  token           TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  sent_to_email   TEXT NOT NULL,
  sent_by         UUID REFERENCES profiles(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','opened','completed','expired')),
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  opened_at       TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUDIT LOG ───────────────────────────────────────────────
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID REFERENCES organisations(id),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── BILLING EVENTS (Stripe webhook log) ─────────────────────
CREATE TABLE billing_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES organisations(id),
  stripe_event_id TEXT UNIQUE,
  event_type      TEXT,
  payload         JSONB,
  processed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPUTED SCORE FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_assessment_score(p_assessment_id UUID)
RETURNS TABLE(composite_score NUMERIC, risk_rating TEXT) AS $$
DECLARE
  v_score     NUMERIC;
  v_rating    TEXT;
  v_low       INT;
  v_medium    INT;
  v_high      INT;
  v_org_id    UUID;
BEGIN
  SELECT a.org_id INTO v_org_id FROM assessments a WHERE a.id = p_assessment_id;

  SELECT rc.low_threshold, rc.medium_threshold, rc.high_threshold
  INTO v_low, v_medium, v_high
  FROM risk_config rc WHERE rc.org_id = v_org_id;

  -- Weighted score: sum(score/3 * weight_pts) / sum(weight_pts) * 100
  SELECT
    CASE WHEN SUM(c.weight_pts) = 0 THEN 0
    ELSE ROUND(SUM((s.score::NUMERIC / 3) * c.weight_pts) / SUM(c.weight_pts) * 100, 2)
    END
  INTO v_score
  FROM assessment_scores s
  JOIN criteria c ON c.id = s.criteria_id
  WHERE s.assessment_id = p_assessment_id
    AND s.score IS NOT NULL;

  -- Risk rating using org thresholds
  v_rating := CASE
    WHEN v_score >= COALESCE(v_low, 75)    THEN 'LOW RISK'
    WHEN v_score >= COALESCE(v_medium, 50) THEN 'MEDIUM RISK'
    WHEN v_score >= COALESCE(v_high, 25)   THEN 'HIGH RISK'
    ELSE 'CRITICAL RISK'
  END;

  RETURN QUERY SELECT v_score, v_rating;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE organisations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_config        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria           ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log          ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's org_id
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS policies
CREATE POLICY "org_isolation" ON organisations
  FOR ALL USING (id = get_my_org_id());

CREATE POLICY "org_isolation" ON profiles
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON risk_config
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON sections
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON criteria
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON suppliers
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON assessments
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON assessment_scores
  FOR ALL USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE org_id = get_my_org_id()
    )
  );

CREATE POLICY "org_isolation" ON vendor_invitations
  FOR ALL USING (org_id = get_my_org_id());

CREATE POLICY "org_isolation" ON audit_log
  FOR ALL USING (org_id = get_my_org_id());

-- Vendor self-assessment: public access via token
CREATE POLICY "vendor_token_access" ON vendor_invitations
  FOR SELECT USING (token IS NOT NULL);

-- ============================================================
-- TRIGGERS: auto-update timestamps & scores
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organisations_updated
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_assessments_updated
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-recalculate composite score when scores change
CREATE OR REPLACE FUNCTION recalculate_assessment_score()
RETURNS TRIGGER AS $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result FROM calculate_assessment_score(
    COALESCE(NEW.assessment_id, OLD.assessment_id)
  );
  UPDATE assessments
  SET composite_score = v_result.composite_score,
      risk_rating = v_result.risk_rating,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_score
  AFTER INSERT OR UPDATE OR DELETE ON assessment_scores
  FOR EACH ROW EXECUTE FUNCTION recalculate_assessment_score();

-- Auto-generate assessment reference number
CREATE OR REPLACE FUNCTION generate_reference_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_no IS NULL THEN
    NEW.reference_no := 'TPRM-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                        LPAD(NEXTVAL('assessment_ref_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE assessment_ref_seq START 1000;

CREATE TRIGGER trg_assessment_ref
  BEFORE INSERT ON assessments
  FOR EACH ROW EXECUTE FUNCTION generate_reference_no();

-- ============================================================
-- SEED DEFAULT CRITERIA (run after creating an org)
-- Call: SELECT seed_default_criteria('your-org-id');
-- ============================================================
CREATE OR REPLACE FUNCTION seed_default_criteria(p_org_id UUID)
RETURNS VOID AS $$
DECLARE
  v_sec_id UUID;
BEGIN
  -- Section 1: General Security Policies
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'1','General Security Policies','GOVERN','GV.PO','A.5.1',10,1)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'1.1','Formal information security policy exists',
   'No policy exists','Draft or informal policy','Documented and management-approved','Reviewed annually; staff acknowledgement tracked',3.33,1),
  (p_org_id,v_sec_id,'1.2','Security awareness training programme in place',
   'No training','Ad hoc sessions only','Annual training; completion tracked','Quarterly training + phishing simulations',3.33,2),
  (p_org_id,v_sec_id,'1.3','Roles and responsibilities for security defined',
   'Not defined','Informally assigned','Documented in job descriptions','RACI matrix; reviewed annually',3.33,3);

  -- Section 2: Access Control
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'2','Access Control','PROTECT','PR.AA','A.8.2',20,2)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'2.1','Role-based access controls for sensitive data',
   'No controls','Passwords only','RBAC/ABAC implemented','Least-privilege + automated provisioning',5,1),
  (p_org_id,v_sec_id,'2.2','Multi-factor authentication on all sensitive systems',
   'No MFA','MFA on some systems','MFA on all external systems','MFA everywhere including privileged access',5,2),
  (p_org_id,v_sec_id,'2.3','Privileged account management (PAM) controls',
   'No PAM','Manual admin tracking','PAM solution + periodic reviews','PAM + JIT access + quarterly recertification',5,3),
  (p_org_id,v_sec_id,'2.4','Joiners / movers / leavers process enforced',
   'No JML process','Ad hoc deprovisioning','Documented JML; HR-triggered','Automated JML integrated with HR system',5,4);

  -- Section 3: Data Protection
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'3','Data Protection','PROTECT','PR.DS','A.8.10',25,3)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'3.1','Data encrypted at rest and in transit',
   'No encryption','In-transit only','AES-256 + TLS 1.2','AES-256 + TLS 1.3 + key management',4.17,1),
  (p_org_id,v_sec_id,'3.2','Data Loss Prevention strategy and tooling',
   'No DLP','Policy only','DLP on email/endpoint','Comprehensive DLP with real-time alerting',4.17,2),
  (p_org_id,v_sec_id,'3.3','Data backup and tested disaster recovery',
   'No backup','Untested backups','Daily backups; documented RTO/RPO','Automated + quarterly tested + offsite',4.17,3),
  (p_org_id,v_sec_id,'3.4','Cross-border data transfer safeguards',
   'No controls','Uncontrolled transfers','Data residency policy','Contractual safeguards + DPAs signed',4.17,4),
  (p_org_id,v_sec_id,'3.5','Data Protection Act / GDPR compliance programme',
   'No awareness','Partial awareness','Measures documented','DPO + DPIA + breach notification procedures',4.17,5),
  (p_org_id,v_sec_id,'3.6','Data classification framework implemented',
   'No classification','Ad hoc labelling','Formal classification policy','Automated classification tooling',4.17,6);

  -- Section 4: Incident Response
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'4','Incident Response','RESPOND','RS.MA','A.5.24',20,4)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'4.1','Formal incident response plan documented',
   'No IRP','Informal procedures','IRP documented; owner assigned','IRP tested annually; playbooks available',5,1),
  (p_org_id,v_sec_id,'4.2','Detection, containment and notification SLAs defined',
   'No SLAs','Informal escalation','Process documented','Automated detection + 72h regulator SLA',5,2),
  (p_org_id,v_sec_id,'4.3','Security incident log and post-incident review',
   'No logging','Informal logging','Incident register + root cause','Formal PIR; lessons fed back into controls',5,3),
  (p_org_id,v_sec_id,'4.4','No undisclosed breaches in past 24 months',
   'Undisclosed breach','Breach; remediation unclear','Breach disclosed and remediated','No breaches or proactive disclosure',5,4);

  -- Section 5: Network Security
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'5','Network Security','DETECT','DE.CM','A.8.20',15,5)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'5.1','Perimeter and endpoint security controls',
   'No controls','Basic firewall only','NGFW + IDS/IPS','NGFW + IDS/IPS + EDR + zero-trust',3.75,1),
  (p_org_id,v_sec_id,'5.2','Security monitoring and threat detection',
   'No monitoring','Reactive/manual','SIEM + basic alerting','24/7 SOC + SIEM + threat intel',3.75,2),
  (p_org_id,v_sec_id,'5.3','Vulnerability management and penetration testing',
   'None performed','Ad hoc only','Annual VA/PT; findings tracked','Quarterly VA + annual PT + bug bounty',3.75,3),
  (p_org_id,v_sec_id,'5.4','Patch management policy and cadence',
   'No patch management','Ad hoc patching','Critical patches within 30 days','Automated; critical <7 days',3.75,4);

  -- Section 6: Third-Party & Supply Chain
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'6','Third-Party & Supply Chain','GOVERN','GV.SC','A.5.19',10,6)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'6.1','Vendor risk assessment programme',
   'No programme','Informal reviews','Documented; key vendors assessed','Annual tiered assessments',5,1),
  (p_org_id,v_sec_id,'6.2','Contractual security clauses in supplier agreements',
   'No security clauses','Basic confidentiality','Security + audit rights + breach notification','Full security schedule + sub-processor controls',5,2);

  -- Section 7: Business Continuity & DR
  INSERT INTO sections (org_id,code,title,label,nist_ref,iso_ref,weight_pct,sort_order)
  VALUES (p_org_id,'7','Business Continuity & DR','RECOVER','RC.RP','A.5.29',10,7)
  RETURNING id INTO v_sec_id;
  INSERT INTO criteria (org_id,section_id,ref,question,guidance_0,guidance_1,guidance_2,guidance_3,weight_pts,sort_order) VALUES
  (p_org_id,v_sec_id,'7.1','BCP and DR plans documented and approved',
   'No BCP/DR','Informal plans','Documented; RTO/RPO defined','ISO 22301 aligned; board-approved',5,1),
  (p_org_id,v_sec_id,'7.2','BCP/DR tested with documented results',
   'Never tested','Tabletop only','Annual test; results documented','Bi-annual test + board reporting',5,2);

END;
$$ LANGUAGE plpgsql;
