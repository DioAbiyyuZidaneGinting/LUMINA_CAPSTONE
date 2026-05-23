"use client";

import { useState } from "react";
import { X, Mail, Key, ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState(1); // 1: Info, 2: Verification Code, 3: New Password
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendCode = async () => {
    if (!isLoaded || !user) return;
    setIsVerifying(true);
    try {
      // Clerk's real email verification flow
      // Note: In a real scenario with Clerk, password change usually requires current password.
      // But we can trigger an email verification for added security as requested.
      await (user as any).prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(2);
      toast.success("Kode Verifikasi Dikirim", {
        description: `Silakan cek Gmail Anda (${user.primaryEmailAddress?.emailAddress}).`
      });
    } catch (err: any) {
      toast.error("Gagal mengirim kode", { description: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded || !user) return;
    setIsVerifying(true);
    try {
      await (user as any).attemptEmailAddressVerification({ code });
      setStep(3);
      toast.success("Verifikasi Berhasil", {
        description: "Email terverifikasi. Silakan masukkan password baru."
      });
    } catch (err: any) {
      toast.error("Kode Salah", { description: "Kode verifikasi yang Anda masukkan tidak valid." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!isLoaded || !user) return;
    if (newPassword !== confirmPassword) return toast.error("Password tidak cocok");
    
    setIsVerifying(true);
    try {
      await (user as any).update({
        password: newPassword,
      } as any);
      toast.success("Kata Sandi Diperbarui", {
        description: "Password admin Lumina berhasil diubah."
      });
      onClose();
    } catch (err: any) {
      toast.error("Gagal memperbarui password", { description: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative border dark:border-slate-800">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors z-10">
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-10">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-blue-600" : "bg-slate-100 dark:bg-slate-800"}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto text-blue-600 mb-4">
                  <Mail className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Verifikasi Email</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Kami akan mengirimkan kode verifikasi nyata ke Gmail terdaftar Anda.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-lg font-black text-blue-600">G</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              <button 
                onClick={handleSendCode}
                disabled={isVerifying}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20"
              >
                {isVerifying ? "Mengirim..." : "Kirim Kode Verifikasi"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 mb-4">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Masukkan Kode</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Masukkan 6 digit kode yang baru saja dikirim ke email Anda.
                </p>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-5 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all dark:text-white"
                />
                <button 
                  onClick={handleVerifyCode}
                  disabled={isVerifying || code.length !== 6}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isVerifying ? "Memverifikasi..." : "Verifikasi Kode"} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Atur Password Baru</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Email terverifikasi. Anda sekarang dapat mengubah password.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <div className="relative group">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="password" 
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                  <div className="relative group">
                    <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="password" 
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all dark:text-white"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpdatePassword}
                  disabled={isVerifying || !newPassword}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 mt-4 shadow-xl shadow-emerald-500/20"
                >
                  {isVerifying ? "Memproses..." : "Perbarui Password"} <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
