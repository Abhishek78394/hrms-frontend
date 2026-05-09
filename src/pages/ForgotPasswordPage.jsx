import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, Lock, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import FormField from "../components/forms/FormField";
import { authApi } from "../api/auth.api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  // Step 1: Send OTP
  const onSendOtp = async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setUserEmail(values.email);
      setStep(2);
      toast.success("6-digit OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Account not found or system error.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const onResetPassword = async (values) => {
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ 
        email: userEmail, 
        otp: values.otp, 
        password: values.password 
      });
      toast.success("Security credentials updated! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {step === 1 ? (
        <form className="space-y-6" onSubmit={handleSubmit(onSendOtp)}>
          <div className="mb-10 text-center">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Mail size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h2>
             <p className="text-sm text-slate-500 mt-2 font-medium">No worries, we'll send you reset instructions.</p>
          </div>

          <FormField 
            label="Registered Email" 
            name="email" 
            register={register} 
            error={errors.email} 
            type="email" 
            placeholder="e.g. john@company.com"
            required
          />

          <Button 
            className="w-full py-4 text-xs font-black uppercase tracking-widest" 
            disabled={loading}
          >
            {loading ? "Identifying..." : "Send Reset OTP"}
          </Button>

          <button 
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors mt-4"
          >
            Back to Sign In
          </button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit(onResetPassword)}>
          <div className="mb-8 text-center">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <ShieldCheck size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Check</h2>
             <p className="text-sm text-slate-500 mt-2 font-medium">Enter the code sent to <span className="text-slate-900 font-bold">{userEmail}</span></p>
          </div>

          <div className="space-y-4">
             <FormField 
               label="6-Digit OTP Code" 
               name="otp" 
               register={register} 
               error={errors.otp} 
               type="text" 
               placeholder="000000"
               maxLength={6}
               required
             />

             <div className="grid grid-cols-1 gap-4">
                <FormField 
                  label="New Password" 
                  name="password" 
                  register={register} 
                  error={errors.password} 
                  type="password" 
                  placeholder="Min 8 characters"
                  required
                />
                <FormField 
                  label="Confirm New Password" 
                  name="confirmPassword" 
                  register={register} 
                  error={errors.confirmPassword} 
                  type="password" 
                  placeholder="Repeat password"
                  required
                />
             </div>
          </div>

          <div className="pt-4">
             <Button 
               className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-100" 
               disabled={loading}
             >
               {loading ? "Authenticating..." : "Update Credentials"}
             </Button>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
             Didn't receive a code? <button type="button" onClick={() => setStep(1)} className="text-slate-900 hover:underline">Resend Email</button>
          </p>
        </form>
      )}
    </div>
  );
}
