import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 'testimonial-001',
    name: 'Sanjay Mehrotra',
    role: 'District Loan Officer, NABARD Maharashtra',
    quote:
      'LoanLens AI reduced our field verification time from 3 weeks to under 48 hours. The AI fraud scores have caught 6 duplicate-image fraud cases in our district that would have gone undetected.',
    rating: 5,
    avatar: 'SM',
    scheme: 'KCC Scheme',
  },
  {
    id: 'testimonial-002',
    name: 'Anitha Krishnamurthy',
    role: 'Regional Manager, Canara Bank Agri Division',
    quote:
      'The GPS validation feature alone has saved us from approving 4 fraudulent land improvement loans. The dashboard is clean and the AI evidence packet makes approval decisions straightforward.',
    rating: 5,
    avatar: 'AK',
    scheme: 'PMAY-G',
  },
  {
    id: 'testimonial-003',
    name: 'Devendra Pratap Singh',
    role: 'Joint Director, UP Rural Development',
    quote:
      'We deployed LoanLens AI across 14 districts for the PM Kisan scheme. The offline upload capability was critical — most of our beneficiaries are in areas with poor connectivity.',
    rating: 5,
    avatar: 'DS',
    scheme: 'PM Kisan',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <span
            className="badge-base text-xs px-3 py-1 mb-4 inline-flex"
            style={{ background: 'rgba(37,99,235,0.06)', color: 'var(--primary)', borderColor: 'rgba(37,99,235,0.15)' }}
          >
            Trusted by Officers Nationwide
          </span>
          <h2 className="text-hero-md font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
            What loan officers{' '}
            <span className="text-gradient-primary">are saying</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials?.map((t) => (
            <div key={t?.id} className="card-base p-6 hover:shadow-card-hover transition-all duration-200">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t?.rating })?.map((_, i) => (
                  <Star key={`star-${t?.id}-${i}`} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--secondary-foreground)' }}>
                &ldquo;{t?.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  {t?.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{t?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t?.role}</p>
                </div>
                <span
                  className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--accent)' }}
                >
                  {t?.scheme}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}