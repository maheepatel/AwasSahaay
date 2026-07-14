'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { MockDb } from '@/lib/mockDb';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quick regex validation for Indian phone numbers (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    // Simulate API roundtrip for OTP generation
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setResendTimer(30);
    }, 800);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next field
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleOtpVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate OTP verification
    setTimeout(() => {
      // In development sandbox, any OTP works or we can matches usr-me phone number
      const mockUsers = MockDb.users;
      // We look up if this user exists, otherwise create/fallback to standard user
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = `+91${cleanPhone}`;
      let user = mockUsers.find(u => u.phone === formattedPhone);

      if (!user) {
        // Create new user on the fly (Auto signup!)
        const list = MockDb.users;
        const newId = 'usr-' + Math.random().toString(36).substr(2, 9);
        user = {
          id: newId,
          phone: formattedPhone,
          name: `Resident Flat ${Math.floor(Math.random() * 1200 + 100)}`,
          avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9000000)}?auto=format&fit=crop&w=150&h=150&q=80`,
          created_at: new Date().toISOString()
        };
        list.push(user);
        MockDb.users = list;

        // Add a default membership for this new user in the demo society
        const mems = MockDb.memberships;
        mems.push({
          id: 'mem-' + Math.random().toString(36).substr(2, 9),
          user_id: user.id,
          society_id: 'soc-orchid-heights',
          role: 'resident',
          flat_number: `B-${Math.floor(Math.random() * 12 + 1)}0${Math.floor(Math.random() * 8 + 1)}`,
          is_verified: true,
          presence_status: 'online',
          last_seen: new Date().toISOString()
        });
        MockDb.memberships = mems;
      }

      // Log the user in
      MockDb.setActiveUser(user.id);
      setLoading(false);
      router.push('/');
    }, 1200);
  };

  // Trigger verify automatically when last digit is entered
  useEffect(() => {
    if (otp.join('').length === 6) {
      handleOtpVerify();
    }
  }, [otp]);

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-linear-to-b from-indigo-50/50 to-white">
      <div className="mx-auto w-full max-w-sm flex flex-col items-center">
        {/* Brand Icon & Title */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 animate-pulse-slow">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md animate-status-pulse">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 text-center">
          AwasSahaay
        </h2>
        <p className="mt-2 text-sm text-zinc-500 text-center max-w-xs">
          Verify your residency and access tracking & alerts in seconds.
        </p>

        {/* Card Body */}
        <div className="mt-8 w-full bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold border border-rose-100">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <span className="text-sm font-bold border-r border-zinc-200 pr-2">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="block w-full pl-14 pr-3 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium tracking-wide text-zinc-800"
                    disabled={loading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 btn-transition shadow-md shadow-indigo-100"
                disabled={loading || phone.length < 10}
              >
                {loading ? 'Sending OTP...' : 'Get OTP Code'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 text-center">
                <span className="text-[10px] text-zinc-400 font-medium">
                  By signing in, you agree to our Terms & Safety Protocols.
                </span>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-xs text-zinc-400 font-medium">
                  We have sent a 6-digit OTP to
                </p>
                <p className="text-sm font-bold text-zinc-800 mt-0.5">
                  +91 {phone.substring(0, 5)}-{phone.substring(5)}
                </p>
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                  }}
                  className="text-xs text-indigo-600 hover:underline mt-1 font-bold"
                >
                  Change Number
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-3 text-center">
                  Verification Code
                </label>
                <div className="flex justify-between gap-2 max-w-xs mx-auto">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="tel"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-bold border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-800 bg-zinc-50 focus:bg-white"
                      disabled={loading}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-md py-1 max-w-xs mx-auto">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sandbox mode: enter any 6 digits (e.g. 123456)</span>
                </div>
              </div>

              <button
                onClick={handleOtpVerify}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 btn-transition shadow-md shadow-indigo-100"
                disabled={loading || otp.join('').length < 6}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="text-zinc-500 font-bold">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={() => {
                      setResendTimer(30);
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
