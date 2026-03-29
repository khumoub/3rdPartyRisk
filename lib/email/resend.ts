// lib/email/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = 'TPRM Pro <noreply@tprmpro.com>'

// ── Vendor self-assessment invitation ─────────────────────
export async function sendVendorInvitation({
  to, vendorName, orgName, assessorName,
  invitationUrl, dueDate, token,
}: {
  to: string; vendorName: string; orgName: string
  assessorName: string; invitationUrl: string
  dueDate: string; token: string
}) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Third-Party Cybersecurity Risk Assessment — Action Required | ${orgName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a2f5a 0%, #1e40af 100%); padding: 40px 40px 32px; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .logo-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-text { color: white; font-size: 18px; font-weight: 700; }
    .header h1 { color: white; font-size: 22px; font-weight: 700; margin: 0 0 8px; }
    .header p { color: rgba(255,255,255,0.75); font-size: 14px; margin: 0; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 16px; color: #1e293b; margin-bottom: 20px; }
    .intro { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
    .domains { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .domains h3 { font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 12px; }
    .domain-item { display: flex; align-items: center; gap-8px; font-size: 13px; color: #4b5563; margin-bottom: 6px; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; }
    .due-date { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-bottom: 24px; text-align: center; }
    .footer { background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 0 0 4px; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">🛡️</div>
        <div class="logo-text">TPRM Pro</div>
      </div>
      <h1>Cybersecurity Risk Assessment</h1>
      <p>Requested by ${orgName}</p>
    </div>
    <div class="body">
      <p class="greeting">Dear ${vendorName},</p>
      <p class="intro">
        As part of our Third-Party Risk Management (TPRM) programme, <strong>${orgName}</strong> is required
        to conduct periodic cybersecurity risk assessments of all strategic suppliers and service providers.
        <br><br>
        <strong>${assessorName}</strong> has requested that you complete the attached cybersecurity assessment.
        This covers 7 key security domains aligned to <strong>NIST CSF 2.0</strong> and <strong>ISO 27001:2022</strong>.
      </p>
      <div class="due-date">
        ⏰ &nbsp;Assessment due by: <strong>${dueDate}</strong>
      </div>
      <div class="domains">
        <h3>Assessment covers:</h3>
        <p style="font-size:13px;color:#4b5563;margin:0;line-height:1.8">
          ✓ General Security Policies &amp; Governance<br>
          ✓ Access Control &amp; Identity Management<br>
          ✓ Data Protection &amp; Privacy Compliance<br>
          ✓ Incident Response &amp; Business Continuity<br>
          ✓ Network Security &amp; Vulnerability Management<br>
          ✓ Third-Party &amp; Supply Chain Risk<br>
          ✓ Business Continuity &amp; Disaster Recovery
        </p>
      </div>
      <div class="cta">
        <a href="${invitationUrl}">Start Assessment →</a>
      </div>
      <p style="font-size:13px;color:#64748b;text-align:center">
        ISO 27001 or SOC 2 Type II certificates are accepted in lieu of full responses for applicable sections.
        <br>If you have questions, reply to this email or contact ${assessorName} directly.
      </p>
    </div>
    <div class="footer">
      <p>This assessment request was sent by ${orgName} via TPRM Pro.</p>
      <p>Assessment token: <code>${token}</code></p>
      <p>If you believe you received this in error, please <a href="mailto:support@tprmpro.com">contact us</a>.</p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── Assessment complete notification ──────────────────────
export async function sendAssessmentComplete({
  to, supplierName, score, rating, referenceNo, reportUrl
}: {
  to: string; supplierName: string; score: number
  rating: string; referenceNo: string; reportUrl: string
}) {
  const ratingColors: Record<string, string> = {
    'LOW RISK':      '#10b981',
    'MEDIUM RISK':   '#f59e0b',
    'HIGH RISK':     '#f97316',
    'CRITICAL RISK': '#ef4444',
  }
  const color = ratingColors[rating] || '#64748b'

  return resend.emails.send({
    from: FROM, to,
    subject: `Assessment Complete — ${supplierName} | ${rating}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #1a2f5a; padding: 32px 40px; }
    .score-card { margin: 32px 40px; background: #f8fafc; border-radius: 16px; padding: 32px; text-align: center; border: 2px solid ${color}20; }
    .score-number { font-size: 64px; font-weight: 800; color: ${color}; line-height: 1; }
    .rating-badge { display: inline-block; background: ${color}20; color: ${color}; font-size: 14px; font-weight: 700; padding: 8px 24px; border-radius: 100px; margin-top: 12px; }
    .body { padding: 0 40px 36px; }
    .cta a { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color:white;margin:0;font-size:20px">Assessment Completed</h1>
      <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">${supplierName} · Ref: ${referenceNo}</p>
    </div>
    <div class="score-card">
      <div style="font-size:13px;color:#64748b;margin-bottom:8px">Composite Risk Score</div>
      <div class="score-number">${score}%</div>
      <div class="rating-badge">${rating}</div>
    </div>
    <div class="body">
      <p style="font-size:14px;color:#475569;line-height:1.7">
        The cybersecurity risk assessment for <strong>${supplierName}</strong> has been completed and scored.
        Download the full PDF report for detailed findings and recommended actions.
      </p>
      <div class="cta" style="margin:24px 0">
        <a href="${reportUrl}">View Full Report →</a>
      </div>
      <p style="font-size:12px;color:#94a3b8">Ref: ${referenceNo}</p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── Overdue review reminder ────────────────────────────────
export async function sendOverdueReviewReminder({
  to, userName, suppliers
}: {
  to: string; userName: string
  suppliers: Array<{ name: string; next_review: string; rating: string }>
}) {
  const rows = suppliers.map(s => `
    <tr>
      <td style="padding:10px 0;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9">${s.name}</td>
      <td style="padding:10px 16px;font-size:13px;color:#ef4444;border-bottom:1px solid #f1f5f9">${s.next_review}</td>
      <td style="padding:10px 0;font-size:13px;border-bottom:1px solid #f1f5f9">${s.rating}</td>
    </tr>`).join('')

  return resend.emails.send({
    from: FROM, to,
    subject: `⚠️ ${suppliers.length} supplier assessments are overdue for review`,
    html: `
<div style="max-width:600px;margin:40px auto;font-family:-apple-system,sans-serif">
  <div style="background:#1a2f5a;padding:32px;border-radius:16px 16px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">⚠️ Overdue Reviews</h1>
    <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Action required — ${suppliers.length} suppliers</p>
  </div>
  <div style="background:white;padding:32px;border-radius:0 0 16px 16px">
    <p style="font-size:14px;color:#475569">Hi ${userName}, the following supplier assessments are overdue:</p>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="font-size:12px;color:#94a3b8;text-align:left">
          <th style="padding-bottom:8px">Supplier</th>
          <th style="padding-bottom:8px;padding-left:16px">Due Date</th>
          <th style="padding-bottom:8px">Last Rating</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:24px;text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/suppliers?filter=overdue"
        style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600">
        View Overdue Suppliers →
      </a>
    </div>
  </div>
</div>`,
  })
}
