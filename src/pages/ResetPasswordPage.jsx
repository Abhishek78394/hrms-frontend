import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import FormField from "../components/forms/FormField";
import { authApi } from "../api/auth.api";

export default function ResetPasswordPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const token = search.get("token") || "";
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: values.password });
      toast.success("Password reset successfully! Please login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField 
        label="New Password" 
        name="password" 
        register={register} 
        error={errors.password} 
        type="password" 
        placeholder="••••••••"
      />
      <Button 
        className="w-full py-3" 
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
