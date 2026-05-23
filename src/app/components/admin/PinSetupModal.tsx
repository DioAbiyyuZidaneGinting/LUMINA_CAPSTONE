"use client";

import { useState } from "react";
import { X, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settingsStore";

export function PinSetupModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { setTwoFactorPin, setTwoFactorEnabled } = useSettingsStore();
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1); // 1: Setup, 2: Confirm
  const [tempPin, setTempPin] = useState("");

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 5) {
      document.getElementById(`setup-pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`setup-pin-${index - 1}`)?.focus();
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setTempPin(pin.join(""));
      setPin(["", "", "", "", "", ""]);
      setStep(2);
      setTimeout(() => document.getElementById("setup-pin-0")?.focus(), 100);
    } else {
      if (pin.join("") === tempPin) {
        setTwoFactorPin(tempPin);
        setTwoFactorEnabled(true);
        toast.success("2FA Berhasil Diaktifkan", {
          description: "PIN keamanan Anda telah berhasil dikonfigurasi."
        });
        onClose();
      } else {
        toast.error("PIN Tidak Cocok", {
          description: "Konfirmasi PIN harus sama dengan PIN pertama."
        });
        setPin(["", "", "", "", "", ""]);
        document.getElementById("setup-pin-0")?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col items-center text-center border dark:border-slate-800">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {step === 1 ? "Atur PIN Keamanan" : "Konfirmasi PIN"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          {step === 1 
            ? "Buat 6-digit PIN untuk mengaktifkan autentikasi dua faktor." 
            : "Masukkan kembali PIN yang telah Anda buat untuk konfirmasi."}
        </p>

        <div className="flex gap-2 mb-10">
          {pin.map((digit, i) => (
            <input
              key={i}
              id={`setup-pin-${i}`}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-16 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-center text-2xl font-black focus:outline-none focus:border-blue-600 transition-all text-slate-900 dark:text-white"
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={pin.join("").length !== 6}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 group shadow-xl shadow-blue-600/20 active:scale-95"
        >
          {step === 1 ? "Lanjut" : "Aktifkan 2FA"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
