import { useState, useEffect } from "react";
import { Users, Package, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { adminService } from "../../services/adminService";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, topProductsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getProductReport(5),
        ]);
        setStats(statsData);
        setTopProducts(topProductsData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse p-10 text-center font-bold uppercase tracking-widest text-slate-400">
        Đang tải dữ liệu hệ thống...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Tổng quan hệ thống
        </h1>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Doanh thu"
          value={`${stats?.totalRevenue.toLocaleString("vi-VN")} đ`}
          icon={DollarSign}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard
          title="Đơn hàng"
          value={stats?.totalOrders}
          icon={ShoppingCart}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Đơn chờ xử lý"
          value={stats?.pendingOrders}
          icon={Clock}
          colorClass="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Sản phẩm"
          value={stats?.totalProducts}
          icon={Package}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Khách hàng"
          value={stats?.totalUsers}
          icon={Users}
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-lg font-black uppercase tracking-widest text-slate-900">
          Top Sản Phẩm Bán Chạy
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="rounded-tl-xl p-4 font-bold">Sản phẩm</th>
                <th className="p-4 font-bold">Giá bán</th>
                <th className="p-4 font-bold">Đã bán</th>
                <th className="rounded-tr-xl p-4 font-bold">Doanh thu mang lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((item, index) => (
                <tr key={item._id} className="transition-colors hover:bg-slate-50">
                  <td className="flex items-center gap-4 p-4">
                    <span className="font-black text-slate-300">#{index + 1}</span>
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg bg-slate-100 object-cover"
                    />
                    <span className="font-bold text-slate-900">{item.name}</span>
                  </td>
                  <td className="p-4 font-medium">{item.price.toLocaleString("vi-VN")} đ</td>
                  <td className="p-4 font-bold text-blue-600">{item.totalSold}</td>
                  <td className="p-4 font-black text-green-600">
                    {item.totalRevenue.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
