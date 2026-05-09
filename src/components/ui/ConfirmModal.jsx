import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20 overflow-hidden">
        <div className="p-8">
           <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                 <AlertTriangle size={24} />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                 <X size={20} />
              </button>
           </div>
           
           <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
           <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">{message}</p>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-100 transition-all border border-slate-100"
              >
                {cancelText}
              </button>
              <Button 
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl text-sm font-black shadow-xl transition-all active:scale-95 ${type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'}`}
              >
                {confirmText}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
