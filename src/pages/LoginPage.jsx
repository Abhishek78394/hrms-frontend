import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import FormField from "../components/forms/FormField";
import { login } from "../features/auth/authSlice";

const schema = z.object({ 
  email: z.string().email("Invalid email address"), 
  password: z.string().min(8, "Password must be at least 8 characters") 
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.loading);
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({ 
    resolver: zodResolver(schema) 
  });

  const onSubmit = async (values) => {
    const result = await dispatch(login(values));
    if (!result.error) {
      toast.success(`Welcome back, ${result.payload.user.fullName || 'User'}!`);
      navigate("/");
    } else {
      toast.error(result.payload?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-8 text-center">
         <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
         <p className="text-sm text-slate-500 mt-1">Please enter your credentials to continue</p>
      </div>
      <div className="space-y-4">
        <FormField 
          label="Email Address" 
          name="email" 
          register={register} 
          error={errors.email} 
          type="email" 
          placeholder="name@company.com"
        />
        <div className="relative">
          <FormField 
            label="Password" 
            name="password" 
            register={register} 
            error={errors.password} 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-9 text-slate-400 hover:text-orange-500 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Remember me</label>
        </div>
        <Link to="/forgot-password" title="Forgot Password" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button 
        className="w-full flex items-center justify-center gap-2 py-3 shadow-lg shadow-brand-100" 
        disabled={loading}
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : (
          <>
            <span>Sign in</span>
            <LogIn size={18} />
          </>
        )}
      </Button>

      <p className="text-center text-sm font-medium text-slate-500">
        Don't have an account? <span className="text-brand-600 font-bold cursor-pointer hover:underline">Contact HR</span>
      </p>
    </form>
  );
}
