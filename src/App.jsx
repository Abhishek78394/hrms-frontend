import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";

export default function App() { 
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        className: 'font-bold text-sm rounded-2xl shadow-2xl',
        success: { iconTheme: { primary: '#f97316', secondary: '#fff' } }
      }} />
      <AppRoutes />
    </>
  ); 
}
