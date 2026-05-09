import Input from "../ui/Input";
export default function FormField({ label, register, name, error, required, ...props }) {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Input error={error?.message} {...register(name)} {...props} />
    </div>
  );
}
