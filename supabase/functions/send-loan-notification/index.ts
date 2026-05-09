declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { type, loanId, beneficiaryName, beneficiaryEmail, officerEmail, scheme, amount, district, fraudType, fraudDetail, remarks } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emails: Array<{ to: string; subject: string; html: string }> = [];

    if (type === "approved") {
      // Email to beneficiary
      if (beneficiaryEmail) {
        emails.push({
          to: beneficiaryEmail,
          subject: `✅ Loan Approved — ${loanId} | LoanLens AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
              <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                  <div style="width: 40px; height: 40px; background: #dcfce7; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">✅</div>
                  <div>
                    <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">Loan Application Approved</h1>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">LoanLens AI Verification System</p>
                  </div>
                </div>
                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">Dear <strong>${beneficiaryName}</strong>,</p>
                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                  We are pleased to inform you that your loan application has been <strong style="color: #16a34a;">approved</strong> by the verification officer.
                </p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Loan ID</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${loanId}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Scheme</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${scheme}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Amount</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${amount}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">District</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${district}</td></tr>
                    ${remarks ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Officer Remarks</td><td style="padding: 6px 0; font-size: 13px; color: #111827;">${remarks}</td></tr>` : ""}
                  </table>
                </div>
                <p style="color: #6b7280; font-size: 13px;">The disbursement process will be initiated shortly. You will receive further communication from your branch.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">LoanLens AI · Government Rural Lending Verification Platform</p>
              </div>
            </div>
          `,
        });
      }

      // Email to officer
      if (officerEmail) {
        emails.push({
          to: officerEmail,
          subject: `✅ Approval Confirmed — ${loanId} | LoanLens AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
              <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                <h1 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">Approval Confirmation</h1>
                <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">Your approval action has been recorded in the audit log.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Loan ID</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${loanId}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Beneficiary</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${beneficiaryName}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Scheme</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${scheme}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Amount</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${amount}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Status</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #16a34a;">✅ Approved</td></tr>
                  </table>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">LoanLens AI · Officer Notification System</p>
              </div>
            </div>
          `,
        });
      }
    } else if (type === "rejected") {
      // Email to beneficiary
      if (beneficiaryEmail) {
        emails.push({
          to: beneficiaryEmail,
          subject: `❌ Loan Submission Rejected — ${loanId} | LoanLens AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
              <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                  <div style="width: 40px; height: 40px; background: #fee2e2; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">❌</div>
                  <div>
                    <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">Submission Rejected</h1>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">LoanLens AI Verification System</p>
                  </div>
                </div>
                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">Dear <strong>${beneficiaryName}</strong>,</p>
                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                  Your loan submission has been <strong style="color: #dc2626;">rejected</strong> by the verification officer. Please review the remarks below and resubmit with the required corrections.
                </p>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Loan ID</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${loanId}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Scheme</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${scheme}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Amount</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${amount}</td></tr>
                    ${remarks ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; vertical-align: top;">Rejection Reason</td><td style="padding: 6px 0; font-size: 13px; color: #dc2626; font-weight: 500;">${remarks}</td></tr>` : ""}
                  </table>
                </div>
                <p style="color: #6b7280; font-size: 13px;">Please visit your nearest branch or log in to the beneficiary portal to resubmit your application with the required corrections.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">LoanLens AI · Government Rural Lending Verification Platform</p>
              </div>
            </div>
          `,
        });
      }

      // Email to officer
      if (officerEmail) {
        emails.push({
          to: officerEmail,
          subject: `❌ Rejection Recorded — ${loanId} | LoanLens AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
              <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                <h1 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px;">Rejection Confirmation</h1>
                <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">Your rejection action has been recorded in the audit log.</p>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Loan ID</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${loanId}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Beneficiary</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${beneficiaryName}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Scheme</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${scheme}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Status</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #dc2626;">❌ Rejected</td></tr>
                    ${remarks ? `<tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; vertical-align: top;">Remarks</td><td style="padding: 6px 0; font-size: 13px; color: #111827;">${remarks}</td></tr>` : ""}
                  </table>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">LoanLens AI · Officer Notification System</p>
              </div>
            </div>
          `,
        });
      }
    } else if (type === "fraud_warning") {
      // Fraud warning to officer
      if (officerEmail) {
        emails.push({
          to: officerEmail,
          subject: `🚨 Fraud Alert — ${loanId} | LoanLens AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
              <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                  <div style="width: 40px; height: 40px; background: #fee2e2; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🚨</div>
                  <div>
                    <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #dc2626;">Fraud Warning Detected</h1>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">LoanLens AI Fraud Detection System</p>
                  </div>
                </div>
                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                  The AI verification system has flagged a <strong style="color: #dc2626;">potential fraud</strong> on the following submission. Immediate review is required.
                </p>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Loan ID</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${loanId}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Beneficiary</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${beneficiaryName}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Fraud Type</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #dc2626;">${fraudType}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Detail</td><td style="padding: 6px 0; font-size: 13px; color: #111827;">${fraudDetail}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">District</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${district}</td></tr>
                  </table>
                </div>
                <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">⚠️ Action Required</p>
                  <p style="margin: 6px 0 0; font-size: 13px; color: #78350f;">Please log in to the Officer Dashboard to review and take action on this submission immediately.</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">LoanLens AI · Fraud Detection & Prevention System</p>
              </div>
            </div>
          `,
        });
      }
    } else if (type === "verification_alert") {
      // Verification pending alert to officer
      if (officerEmail) {
        emails.push({
          to: officerEmail,
          subject: `🔔 New Verification Pending — ${loanId} | LoanLens AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
              <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                  <div style="width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🔔</div>
                  <div>
                    <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">New Verification Pending</h1>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">LoanLens AI Verification System</p>
                  </div>
                </div>
                <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                  A new loan submission is awaiting your verification and approval.
                </p>
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Loan ID</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${loanId}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Beneficiary</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${beneficiaryName}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Scheme</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${scheme}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Amount</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${amount}</td></tr>
                    <tr><td style="padding: 6px 0; font-size: 13px; color: #6b7280;">District</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #111827;">${district}</td></tr>
                  </table>
                </div>
                <p style="color: #6b7280; font-size: 13px;">Please log in to the Officer Dashboard to review and process this submission.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">LoanLens AI · Officer Notification System</p>
              </div>
            </div>
          `,
        });
      }
    }

    // Send all emails via Resend API
    const results = await Promise.all(
      emails.map(async (email) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: email.to,
            subject: email.subject,
            html: email.html,
          }),
        });
        return response.json();
      })
    );

    return new Response(
      JSON.stringify({ success: true, sent: results.length, results }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
