import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

const footerLinks = {
  Platform: ['Officer Dashboard', 'Beneficiary Portal', 'Analytics', 'Fraud Alerts', 'Geo Heatmap'],
  Solutions: ['KCC Scheme', 'PMAY Verification', 'MUDRA Loans', 'PM Kisan', 'NABARD Schemes'],
  Resources: ['Documentation', 'API Reference', 'Compliance Guide', 'Release Notes', 'Status Page'],
  Company: ['About', 'Blog', 'Careers', 'Contact', 'Privacy Policy'],
};

export default function LandingFooter() {
  return (
    <footer className="border-t py-12 sm:py-16" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo size={32} />
              <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>LoanLens AI</span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)', maxWidth: '220px' }}>
              AI-powered loan utilization verification for India&apos;s government lending ecosystem.
            </p>
            <div className="flex flex-wrap gap-2">
              {['NABARD', 'RBI', 'SIDBI']?.map((org) => (
                <span
                  key={`footer-org-${org}`}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg border"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                >
                  {org}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks)?.map(([category, links]) => (
            <div key={`footer-cat-${category}`}>
              <p className="text-xs font-semibold tracking-widest mb-3 sm:mb-4" style={{ color: 'var(--muted-foreground)' }}>
                {category?.toUpperCase()}
              </p>
              <ul className="space-y-2">
                {links?.map((link) => (
                  <li key={`footer-link-${link}`}>
                    <Link href="#" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--secondary-foreground)' }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            © 2026 LoanLens AI Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Made in India 🇮🇳 · CIN: U72900MH2024PTC123456
          </p>
        </div>
      </div>
    </footer>
  );
}