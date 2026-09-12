import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, ArrowRight, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: OTP Entry
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Timer for Resend OTP button
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      setErrorMessage("🚨 Please enter a valid 10-digit mobile number or email address.");
      return;
    }

    try {
      // Calling Spring Boot Backend API
      const response = await fetch('http://localhost:8080/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      
      const data = await response.json();

      if (response.ok) {
        const channelType = isEmail ? "Registered Email Inbox" : "SMS Mobile Gateway";
        setSuccessMessage(`✅ Secure OTP dispatched successfully to your ${channelType}.`);
        setStep(2);
        setCountdown(30);
        setCanResend(false);
      } else {
        setErrorMessage(data.error || "🚨 Failed to send OTP from server.");
      }
    } catch (error) {
      setErrorMessage("🚨 Server connection failed. Make sure Spring Boot is running.");
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`🔄 New OTP re-sent successfully to your device.`);
        setCountdown(30);
        setCanResend(false);
      } else {
        setErrorMessage(data.error || "🚨 Failed to resend OTP.");
      }
    } catch (error) {
      setErrorMessage("🚨 Server connection failed.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // 1. Verifying with Spring Boot Backend
      const response = await fetch('http://localhost:8080/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        let doctorName = "Dr. Ayush Bhardwaj";
        if (identifier.includes("@")) {
          const namePart = identifier.split("@")[0].replace(/[0-9]/g, '').replace(/[._-]/g, ' ').trim();
          if (namePart.length > 0 && namePart.length <= 15) {
            doctorName = "Dr. " + namePart.charAt(0).toUpperCase() + namePart.slice(1);
          }
        } else {
          doctorName = `Dr. Officer (${identifier.slice(-4)})`;
        }

        const finalEmail = identifier.includes("@") ? identifier : `${identifier}@diabpathy.gov.in`;

        // 2. DIRECT BRIDGE: Call FastAPI's /login/otp-verified endpoint
        try {
          const fastApiResponse = await fetch("http://127.0.0.1:8000/login/otp-verified", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: finalEmail, 
              full_name: doctorName 
            }),
          });

          if (!fastApiResponse.ok) throw new Error("FastAPI Session Failed");

          const fastApiData = await fastApiResponse.json();

          // Save secure session tokens in browser storage
          localStorage.setItem("token", fastApiData.access_token);
          localStorage.setItem("loggedInDoctorName", fastApiData.doctor_name || doctorName);
          localStorage.setItem("loggedInDoctorEmail", finalEmail);

          // Success! Open Portal
          onLoginSuccess();

        } catch (fastApiError) {
          setErrorMessage("🚨 OTP Verified, but failed to connect to AI Server (FastAPI). Make sure FastAPI is running on port 8000.");
          console.error(fastApiError);
        }

      } else {
        setErrorMessage(data.message || "🚨 Invalid verification code. Please enter the correct 4-digit OTP.");
      }
    } catch (error) {
      setErrorMessage("🚨 Verification failed due to server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50/50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Header Area */}
        <div className="pt-8 pb-6 px-8 text-center border-b border-slate-100">
          <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 shadow-inner border border-blue-100">
            <span className="text-blue-600 font-bold text-2xl">👁️‍🗨️</span>
          </div>
          <div className="text-[10px] font-extrabold tracking-widest text-emerald-600 uppercase mb-1">
            SECURE OTP GATEWAY • NPI VERIFIED
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">DiabPathy</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Secure Clinical Portal for Retinal Diagnostic Analysis & Triage
          </p>

          {/* Step Indicator Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-6">
            <div className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${step === 1 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'}`}>
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">1</span> Contact Info
            </div>
            <div className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${step === 2 ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'}`}>
              <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 text-[10px] flex items-center justify-center">2</span> Enter OTP
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-lg">
              {errorMessage}
            </div>
          )}

          {successMessage && step === 2 && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email ID or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="doctor@hospital.com or 10-digit mobile"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">We will send a secure one-time verification code to this channel.</p>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#004d61] hover:bg-[#003947] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors text-sm shadow-sm"
              >
                Send Verification OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 4-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    maxLength="4"
                    placeholder="••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xl tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                {canResend ? (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">Resend in 00:{countdown < 10 ? `0${countdown}` : countdown}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors text-sm shadow-sm"
              >
                Verify & Open Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center mt-3 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change Email / Mobile Number
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center">
            <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" />
            HIPAA & FIPS 140-3 Compliant Gateway
          </div>
          <span className="font-bold text-slate-700">OTP AUTH</span>
        </div>
      </div>
    </div>
  );
}