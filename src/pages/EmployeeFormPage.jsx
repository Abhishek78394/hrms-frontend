import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { 
  X, 
  Upload as UploadIcon, 
  Eye, 
  EyeOff, 
  ChevronDown,
  Trash2,
  UserCircle
} from "lucide-react";
import Button from "../components/ui/Button";
import FormField from "../components/forms/FormField";
import { createEmployee, fetchEmployeeById, updateEmployee } from "../features/employees/employeeSlice";
import { employeeApi } from "../api/employee.api";

// --- Constants for Dropdowns ---
const STATUS_OPTIONS = [
  "Active", "Inactive", "On Leave", "Notice Period", "Resignation", 
  "Termination", "Layoff", "Retirement", "Contract End", "Absconded", 
  "Suspended", "Archived"
];

const DEPARTMENTS = [
  "Human Resources", "Information Technology", "Software Development", "Sales", "Marketing", 
  "Finance", "Accounts", "Operations", "Customer Support", "Administration", "Legal", 
  "Procurement", "Logistics", "Research & Development", "Quality Assurance", 
  "Product Management", "Design", "Security", "DevOps", "Cloud Infrastructure", 
  "Data Analytics", "Business Development", "Public Relations", "Training & Development", 
  "Technical Support", "Call Center", "Manufacturing", "Warehouse", "Field Operations"
];

const DESIGNATIONS = {
  Admin: [
    "Administrator", "System Administrator", "Office Administrator", 
    "Operations Manager", "General Manager", "Director"
  ],
  HR: [
    "HR Manager", "HR Executive", "HR Recruiter", 
    "Talent Acquisition Specialist", "HR Coordinator", "Payroll Executive"
  ],
  Employee: [
    "Software Engineer", "Senior Software Engineer", "Frontend Developer", 
    "Backend Developer", "Full Stack Developer", "React Developer", 
    "Node.js Developer", "Mobile App Developer", "QA Engineer", 
    "DevOps Engineer", "UI/UX Designer", "Graphic Designer", 
    "Sales Executive", "Marketing Executive", "Accountant", 
    "Finance Executive", "Customer Support Executive", 
    "Technical Support Engineer", "Operations Executive", 
    "Data Analyst", "Content Writer", "SEO Specialist", 
    "Project Coordinator", "Team Lead", "Supervisor", 
    "Intern", "Trainee", "Junior Executive", "Associate"
  ]
};

const employeeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  employeeId: z.string().min(1, "Employee ID is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  department: z.string().min(1, "Please select a department"),
  designation: z.string().min(1, "Please select a designation"),
  status: z.string().min(1, "Status is required"),
  role: z.string().min(1, "Role is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
  about: z.string().min(10, "Bio must be at least 10 characters"),
  profileImage: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function EmployeeFormPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const { rows } = useSelector((s) => s.employees);
  const employee = rows.find((r) => r._id === id);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [nextId, setNextId] = useState("Loading...");
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm({ 
    resolver: zodResolver(employeeSchema),
    defaultValues: { role: "Employee", status: "Active" } 
  });

  const selectedRole = watch("role");

  useEffect(() => {
    const getNextId = async () => {
      if (!id) {
        try {
          const res = await employeeApi.getNextId();
          if (res.data?.nextId) {
            setNextId(res.data.nextId);
            setValue("employeeId", res.data.nextId);
          }
        } catch (err) {
          console.error("Failed to fetch next ID", err);
        }
      }
    };
    getNextId();
  }, [id, setValue]);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
    } else {
      reset({ role: "Employee", status: "Active", firstName: "", lastName: "", email: "", phone: "", about: "", salary: 0 });
      setPreviewImage(null);
    }
  }, [id, dispatch, reset]);

  useEffect(() => {
    if (id && employee) {
      const data = { ...employee };
      if (data.joiningDate) {
        data.joiningDate = new Date(data.joiningDate).toISOString().split("T")[0];
      }
      reset(data);
      if (data.profileImage) setPreviewImage(data.profileImage);
    }
  }, [employee, reset, id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setValue("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values) => {
    const { confirmPassword, ...payload } = values;
    const finalPayload = { ...payload, salary: Number(payload.salary || 0) };
    
    const res = await dispatch(id ? updateEmployee({ id, payload: finalPayload }) : createEmployee(finalPayload));
    
    if (!res.error) {
      toast.success(id ? "Profile updated successfully!" : "Employee registered successfully!");
      navigate("/employees");
    } else {
      const errorData = res.payload;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        const [field, val] = Object.entries(firstError)[0];
        toast.error(`${errorData.message}: ${field} (${val}) already exists.`);
      } else {
        toast.error(errorData?.message || "Operation failed. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        
        <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-20">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-200">
               <UserCircle size={26} />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-900 leading-none">
                 {id ? "Edit Employee" : "Register Employee"}
               </h1>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  System ID <span className="w-1 h-1 rounded-full bg-orange-500"></span> <span className="text-orange-600">{id ? (employee?.employeeId || "") : nextId}</span>
               </p>
            </div>
          </div>
          <button onClick={() => navigate("/employees")} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all shadow-inner">
            <X size={24} />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto p-10 custom-scrollbar" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-gradient-to-br from-slate-50 to-white rounded-[2rem] border border-slate-100 relative group overflow-hidden shadow-sm">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                 <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-white shadow-2xl overflow-hidden ring-8 ring-slate-50 relative group flex items-center justify-center">
                       {previewImage ? (
                         <img src={previewImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       ) : (
                         <div className="flex flex-col items-center justify-center text-slate-300">
                            <UserCircle size={64} className="opacity-20" />
                         </div>
                       )}
                       {previewImage && (
                          <button type="button" onClick={() => { setPreviewImage(null); setValue("profileImage", ""); }} className="absolute inset-0 bg-rose-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                             <Trash2 size={28} />
                          </button>
                       )}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-orange-600 hover:scale-110 transition-all cursor-pointer">
                       <UploadIcon size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                 </div>
                 <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-black text-slate-900">Personal Avatar</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">JPG, PNG or GIF • Max 5MB</p>
                 </div>
              </div>

              <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                 <FormField label="First Name" name="firstName" register={register} error={errors.firstName} required placeholder="e.g. John" />
                 <FormField label="Last Name" name="lastName" register={register} error={errors.lastName} required placeholder="e.g. Doe" />
                 
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                    <div className="relative">
                       <select {...register("role")} className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all cursor-pointer">
                          <option value="Employee">Employee</option>
                          <option value="HR">HR Manager</option>
                          <option value="Admin">Administrator</option>
                       </select>
                       <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.role && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.role.message}</p>}
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                    <div className="relative">
                       <select {...register("status")} className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all cursor-pointer">
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                       </select>
                       <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.status && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.status.message}</p>}
                 </div>

                 <FormField label="Joining Date" name="joiningDate" register={register} error={errors.joiningDate} required type="date" />
                 <FormField label="Email" name="email" register={register} error={errors.email} required type="email" placeholder="john@company.com" />
                 
                 {!id && (
                   <>
                     <div className="relative">
                        <FormField label="Password" name="password" register={register} error={errors.password} required={!id} type={showPassword ? "text" : "password"} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400 hover:text-orange-600">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                     </div>

                     <div className="relative">
                        <FormField label="Confirm Password" name="confirmPassword" register={register} error={errors.confirmPassword} required={!id} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-10 text-slate-400 hover:text-orange-600">
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                     </div>
                   </>
                 )}

                 <FormField 
                    label="Phone Number" 
                    name="phone" 
                    register={register} 
                    error={errors.phone} 
                    required 
                    placeholder="e.g. 9876543210"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      e.target.value = val;
                      register("phone").onChange(e);
                    }}
                 />
                 
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <div className="relative">
                       <select {...register("department")} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all cursor-pointer overflow-y-auto">
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                       </select>
                       <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.department && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.department.message}</p>}
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                    <div className="relative">
                       <select {...register("designation")} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all cursor-pointer">
                          <option value="">Select Designation</option>
                          {DESIGNATIONS[selectedRole || "Employee"]?.map(desig => (
                             <option key={desig} value={desig}>{desig}</option>
                          ))}
                       </select>
                       <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.designation && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.designation.message}</p>}
                 </div>

                 <FormField label="Base Salary (₹)" name="salary" register={register} error={errors.salary} required type="number" placeholder="50000" />

                 <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                       Professional Bio <span className="text-rose-500 font-black">*</span>
                    </label>
                    <textarea {...register("about")} className="w-full bg-white border border-slate-200 rounded-3xl py-4 px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 min-h-[160px] resize-none transition-all shadow-inner" placeholder="Enter a brief summary..." />
                    {errors.about && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{errors.about.message}</p>}
                 </div>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 flex items-center justify-end gap-5 sticky bottom-0 bg-white pb-2">
              <button type="button" onClick={() => navigate("/employees")} className="px-12 py-4 bg-slate-50 text-slate-600 rounded-2xl text-sm font-black border border-slate-200">Discard</button>
              <Button disabled={isSubmitting} className="px-16 py-4 font-black shadow-2xl shadow-orange-200 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 transform hover:scale-[1.02] active:scale-95">
                {isSubmitting ? "Processing..." : id ? "Apply Changes" : "Complete Registration"}
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
