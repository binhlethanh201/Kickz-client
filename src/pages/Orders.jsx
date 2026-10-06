import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Eye } from "lucide-react";
import { orderService } from "../services/orderService";
import { authService } from "../services/authService";

const formatStatus = (status) => {
  const statusMap = {
    pending: { text: "Chờ thanh toán", style: "bg-yellow-100 text-yellow-700" },
    paid: { text: "Đã thanh toán", style: "bg-blue-100 text-blue-700" },
    processing: { text: "Đang xử lý", style: "bg-indigo-100 text-indigo-700" },
    shipped: { text: "Đang giao", style: "bg-purple-100 text-purple-700" },
    completed: { text: "Hoàn thành", style: "bg-green-100 text-green-700" },
    cancelled: { text: "Đã hủy", style: "bg-red-100 text-red-700" },
  };
  return statusMap[status] || { text: status, style: "bg-gray-100 text-gray-700" };
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userRes = await authService.getMe();
        const data = await orderService.getUserOrders(userRes.user._id);
        setOrders(data.orders);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="animate-pulse py-24 text-center uppercase tracking-widest">Đang tải...</div>
    );

  return (
    <div className="mx-auto min-h-[75vh] max-w-5xl px-4 py-16">
      <h1 className="mb-10 text-center text-3xl font-light uppercase tracking-widest text-slate-900">
        Đơn hàng của bạn
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/50 py-12 text-center">
          <Package size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="mb-4 text-slate-500">Bạn chưa có đơn hàng nào.</p>
          <Link
            to="/"
            className="text-sm font-bold uppercase tracking-widest text-slate-900 underline"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md md:flex-row"
            >
              <div className="flex-grow text-center md:text-left">
                <p className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-900">
                  Mã: #{order.orderCode}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")} •{" "}
                  {order.items?.length || 0} sản phẩm
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {order.totalPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${formatStatus(order.status).style}`}
                  >
                    {formatStatus(order.status).text}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="rounded-xl bg-slate-100 p-3 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
