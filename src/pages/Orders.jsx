import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Package, RefreshCcw, ShoppingBag, ChevronRight, ChevronLeft } from "lucide-react";
import { orderService } from "../services/orderService";
import { authService } from "../services/authService";

const formatStatus = (status) => {
  const statusMap = {
    pending: { text: "Chờ thanh toán", style: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    paid: { text: "Đã thanh toán", style: "bg-blue-100 text-blue-700 border-blue-200" },
    processing: { text: "Đang xử lý", style: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    shipped: { text: "Đang giao", style: "bg-purple-100 text-purple-700 border-purple-200" },
    completed: { text: "Hoàn thành", style: "bg-green-100 text-green-700 border-green-200" },
    cancelled: { text: "Đã hủy", style: "bg-red-100 text-red-700 border-red-200" },
  };
  return (
    statusMap[status] || { text: status, style: "bg-slate-100 text-slate-700 border-slate-200" }
  );
};

const Orders = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentData = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    navigate(`/order/page/${newPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-slate-400">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in mx-auto min-h-[75vh] max-w-5xl px-4 py-12 duration-500 md:py-20">
      <div className="mb-10 flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
            Đơn hàng của bạn
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý và theo dõi trạng thái các đơn hàng đã đặt
          </p>
        </div>
        <Link
          to="/refunds"
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-900 hover:text-white hover:ring-slate-900 md:w-auto"
        >
          <RefreshCcw
            size={16}
            strokeWidth={2.5}
            className="transition-transform group-hover:rotate-180"
          />
          Yêu cầu hoàn tiền
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white py-24 text-center shadow-sm">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
            <Package size={40} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Chưa có đơn hàng nào</h3>
          <p className="mb-8 text-sm text-slate-500">
            Có vẻ như bạn chưa đặt mua sản phẩm nào từ Kickz.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20"
          >
            Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {currentData.map((order) => {
              const statusData = formatStatus(order.status);
              return (
                <div
                  key={order._id}
                  className="group flex flex-col justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-xl md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors duration-300 group-hover:bg-slate-900 group-hover:text-white">
                      <ShoppingBag size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="mb-1.5 text-sm font-black uppercase tracking-widest text-slate-900">
                        #{order.orderCode}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")} •{" "}
                        <span className="text-slate-900">{order.items?.length || 0}</span> sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-6 border-t border-slate-50 pt-5 md:w-auto md:border-none md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-lg font-black text-slate-900">
                        {order.totalPrice.toLocaleString("vi-VN")}{" "}
                        <span className="text-sm">₫</span>
                      </p>
                      <span
                        className={`mt-1.5 inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusData.style}`}
                      >
                        {statusData.text}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition-all duration-300 hover:bg-slate-900 hover:text-white md:h-auto md:w-auto md:px-5 md:py-3"
                    >
                      <span className="hidden text-xs font-bold uppercase tracking-widest md:block">
                        Chi tiết
                      </span>
                      <ChevronRight size={18} className="md:ml-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>

              <div className="flex items-center gap-2 max-md:hidden">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <div className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 font-bold text-slate-900 md:hidden">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
              >
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
