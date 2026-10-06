import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { orderService } from "../services/orderService";

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

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderDetail(id);
      setOrder(data.order);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await orderService.cancelOrder(order._id);
      alert("Hủy đơn hàng thành công!");
      fetchOrder();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể hủy đơn hàng.");
    }
  };

  if (loading)
    return (
      <div className="animate-pulse py-24 text-center uppercase tracking-widest">Đang tải...</div>
    );
  if (!order) return <div className="py-24 text-center">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="mx-auto min-h-[75vh] max-w-3xl px-4 py-16">
      <Link
        to="/order"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <div className="rounded-2xl border border-white/60 bg-white/50 p-8 shadow-sm backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
              Đơn hàng #{order.orderCode}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${formatStatus(order.status).style}`}
          >
            {formatStatus(order.status).text}
          </span>
        </div>

        <div className="mb-8 space-y-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-6">
              <img
                src={item.productId?.img}
                alt={item.productId?.name}
                className="h-20 w-20 rounded-xl bg-gray-100 object-cover shadow-sm"
              />
              <div className="flex-grow">
                <p className="text-base font-bold text-slate-900">
                  {item.productId?.name || "Sản phẩm không tồn tại"}
                </p>
                <p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {item.price.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-white bg-white/80 p-6 text-sm shadow-sm">
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Thanh toán:</span>
            <span className="font-bold uppercase tracking-wider">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Vận chuyển:</span>
            <span className="font-bold capitalize">
              {order.shippingMethod === "express"
                ? `Hỏa tốc (+ ${order.shippingFee.toLocaleString("vi-VN")} VNĐ)`
                : "Tiêu chuẩn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-600">Giao tới:</span>
            <span className="max-w-[60%] text-right font-bold">{order.address}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span className="font-bold">-{order.discount.toLocaleString("vi-VN")} VNĐ</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-bold uppercase tracking-widest text-slate-900">Tổng tiền:</span>
            <span className="text-2xl font-black text-slate-900">
              {order.totalPrice.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>

        {["pending", "paid"].includes(order.status) && (
          <button
            onClick={handleCancelOrder}
            className="mt-8 w-full rounded-xl border-2 border-red-100 bg-red-50 py-4 text-sm font-bold uppercase tracking-widest text-red-600 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
          >
            Hủy đơn hàng
          </button>
        )}
        {order.status === "pending" && order.paymentMethod === "payos" && (
          <p className="mt-4 text-center text-xs text-slate-500">
            * Đơn hàng đang chờ thanh toán qua PayOS.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
