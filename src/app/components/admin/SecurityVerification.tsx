"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { ShieldCheck, Lock, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";

export function SecurityVerification({ children }: { children: React.ReactNode }) {
  const { 
    twoFactorEnabled, 
    twoFactorPin, 
    lastPinVerification, 
    setLastPinVerification 
  } = useSettingsStore();

  const [showPopup, setShowPopup] = useState(false);
  const [pinInput, setPinInput] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (twoFactorEnabled && twoFactorPin) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      // If never verified or last verification was more than 24 hours ago
      if (!lastPinVerification || (now - lastPinVerification > oneDay)) {
        setShowPopup(true);
      }
    }
  }, [twoFactorEnabled, twoFactorPin, lastPinVerification]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pinInput];
    newPin[index] = value.slice(-1);
    setPinInput(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pinInput[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyPin = () => {
    const enteredPin = pinInput.join("");
    if (enteredPin === twoFactorPin) {
      setLastPinVerification(Date.now());
      setShowPopup(false);
      toast.success("Verifikasi Berhasil", {
        description: "Selamat datang kembali di dashboard admin."
      });
    } else {
      setError(true);
      setPinInput(["", "", "", "", "", ""]);
      document.getElementById("pin-0")?.focus();
      toast.error("PIN Salah", {
        description: "Silakan masukkan PIN keamanan yang benar."
      });
    }
  };

  if (showPopup) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-slate-900/20">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Verifikasi Keamanan</h2>
            <p className="text-slate-500 font-medium mb-8">
              Masukkan {twoFactorPin?.length}-digit PIN keamanan Anda untuk mengakses dashboard hari ini.
            </p>

            <div className="flex gap-3 mb-8">
              {pinInput.slice(0, twoFactorPin?.length || 6).map((digit, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-16 bg-slate-50 border-2 rounded-2xl text-center text-2xl font-black focus:outline-none transition-all ${
                    error ? "border-rose-500 text-rose-600 animate-shake" : "border-slate-100 focus:border-slate-900 text-slate-900"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={verifyPin}
              disabled={pinInput.join("").length !== (twoFactorPin?.length || 6)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-slate-900/20"
            >
              Verifikasi Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
