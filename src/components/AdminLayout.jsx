import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Package, ShoppingCart, Tag, LogOut, Home } from "lucide-react";
import { authService } from "../services/authService";
import { ToastContainer } from "./shared/AdminUI";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Tổng quan" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
    { path: "/admin/products", icon: Package, label: "Sản phẩm" },
    { path: "/admin/users", icon: Users, label: "Khách hàng" },
    { path: "/admin/vouchers", icon: Tag, label: "Khuyến mãi" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="fixed bottom-0 left-0 top-0 w-64 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-20 items-center justify-center border-b border-slate-100">
          <Link to="/admin" className="text-3xl font-black tracking-tighter text-slate-900">
            KICKZ<span className="text-red-500">.</span>ADMIN
          </Link>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) && item.path !== "/admin");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full space-y-2 border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} strokeWidth={2} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout;
