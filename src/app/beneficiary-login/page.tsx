'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function BeneficiaryLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState<string>('');
  const [showOtp, setShowOtp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setDemoOtp(String(Math.floor(100000 + Math.random() * 900000)));
  }, []);

  const isValidMobile = /^[6-9]\d{9}$/?.test(mobile);

  const handleLogin = async () => {
    if (!isValidMobile) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (otp?.length < 6) {
      setError('Enter the 6-digit OTP shown above.');
      return;
    }
    if (otp !== demoOtp) {
      setError('Incorrect OTP. Use the OTP shown in the box above.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    router?.push('/beneficiary-portal');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <AppLogo className="h-10 w-auto mb-3" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Beneficiary Login
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Enter your mobile number and use the OTP below
          </p>
        </div>

        {/* OTP Display Box */}
        <div
          className="rounded-2xl border-2 p-5 text-center"
          style={{
            background: 'rgba(37,99,235,0.06)',
            borderColor: 'var(--primary)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
            Your Demo OTP
          </p>
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-4xl font-black tracking-[0.25em]"
              style={{ color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}
            >
              {showOtp ? demoOtp : '••••••'}
            </span>
            <button
              onClick={() => setShowOtp((v) => !v)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              title={showOtp ? 'Hide OTP' : 'Show OTP'}
            >
              {showOtp ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Use this OTP in the field below to login
          </p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-2xl border p-6 shadow-sm space-y-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
              Mobile Number
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center px-3 h-11 rounded-xl border text-sm font-semibold shrink-0"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                +91
              </div>
              <div className="relative flex-1">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => { setMobile(e?.target?.value?.replace(/\D/g, '')?.slice(0, 10)); setError(''); }}
                  onKeyDown={(e) => e?.key === 'Enter' && handleLogin()}
                  placeholder="9876543210"
                  className="input-base w-full pl-9 text-base tracking-widest"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
              Enter OTP
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e?.target?.value?.replace(/\D/g, '')?.slice(0, 6)); setError(''); }}
              onKeyDown={(e) => e?.key === 'Enter' && handleLogin()}
              placeholder="Enter 6-digit OTP"
              className="input-base w-full text-xl font-bold tracking-[0.3em] text-center"
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--destructive)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full py-3 text-sm gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? 'Logging in...' : 'Login to Portal'}
          </button>
        </div>

        <p className="text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Demo mode — OTP is shown directly for easy access
        </p>
      </div>
    </div>
  );
}
