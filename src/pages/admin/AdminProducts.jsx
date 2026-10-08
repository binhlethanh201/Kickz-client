import { NavLink, Outlet } from "react-router-dom";

const AdminProducts = () => {
  const tabs = [
    { path: "/admin/products", label: "Quản lý Sản phẩm", end: true },
    { path: "/admin/products/brands", label: "Thương hiệu", end: false },
    { path: "/admin/products/categories", label: "Danh mục", end: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Danh mục & Sản phẩm
        </h1>
      </div>

      <div className="mb-8 flex gap-8 border-b border-slate-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `border-b-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-900"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminProducts;
