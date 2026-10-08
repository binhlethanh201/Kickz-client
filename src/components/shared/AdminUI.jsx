import { useState, useEffect } from "react";
import { Search, X, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  disabled,
  className = "",
}) => {
  const baseStyle =
    "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    danger: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = "success" }) => {
  const variants = {
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    default: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 text-slate-500">
    <Search size={20} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
    />
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl duration-200">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const toast = {
  success: (msg) =>
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { msg, type: "success" } })),
  error: (msg) =>
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { msg, type: "error" } })),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener("show-toast", handler);
    return () => window.removeEventListener("show-toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-in slide-in-from-right-8 fade-in pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl transition-all duration-300 ${
            t.type === "success" ? "bg-slate-900 text-white" : "bg-red-500 text-white"
          }`}
        >
          {t.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="text-xs font-bold uppercase tracking-widest">{t.msg}</span>
        </div>
      ))}
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Trang {currentPage} / {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
