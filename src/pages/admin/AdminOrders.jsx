import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Trash2, X, Package } from "lucide-react";
import { adminService } from "../../services/adminService";
import { SearchInput, toast, Pagination } from "../../components/shared/AdminUI";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-700" },
  { value: "paid", label: "Đã thanh toán", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "Đang xử lý", color: "bg-indigo-100 text-indigo-700" },
  { value: "shipped", label: "Đang giao", color: "bg-purple-100 text-purple-700" },
  { value: "completed", label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-700" },
];

const AdminOrders = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchTerm) navigate(`/admin/orders`);
  }, [searchTerm, navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      fetchOrders();
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác!")
    ) {
      try {
        await adminService.deleteOrder(orderId);
        toast.success("Đã xóa đơn hàng thành công!");
        fetchOrders();
      } catch (error) {
        toast.error("Lỗi xóa đơn hàng.");
      }
    }
  };

  const handleViewDetails = async (orderId) => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    try {
      const data = await adminService.getOrderById(orderId);
      setSelectedOrder(data);
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng.");
      setIsModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (statusValue) => {
    const status = STATUS_OPTIONS.find((s) => s.value === statusValue);
    return status ? status.color : "bg-slate-100 text-slate-700";
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderCode?.toString().includes(searchTerm) ||
      o.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentData = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    navigate(`/admin/orders/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Đơn hàng
        </h1>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo mã đơn hoặc email khách hàng..."
        />
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4">Mã Đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Ngày đặt</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="animate-pulse p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                currentData.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4 font-black uppercase text-slate-900">
                      #{order.orderCode || order._id.slice(-6)}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">
                        {order.userId?.firstName} {order.userId?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{order.userId?.email}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 font-black">{order.totalPrice.toLocaleString("vi-VN")} đ</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`cursor-pointer appearance-none rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none ${getStatusColor(order.status)}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-white text-slate-900"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetails(order._id)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          title="Xóa đơn hàng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 p-6 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
                  Chi tiết đơn hàng
                </h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">
                  Mã đơn: #{selectedOrder?.orderCode || selectedOrder?._id?.slice(-6)}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-6">
              {isLoadingDetail || !selectedOrder ? (
                <div className="py-20 text-center">
                  <p className="animate-pulse font-bold uppercase tracking-widest text-slate-400">
                    Đang tải chi tiết...
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Thông tin khách hàng
                      </h3>
                      <p className="mb-1 font-bold text-slate-900">
                        {selectedOrder.userId?.firstName} {selectedOrder.userId?.lastName}
                      </p>
                      <p className="mb-1 text-sm text-slate-600">{selectedOrder.userId?.email}</p>
                      <p className="mt-4 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Địa chỉ giao:</span>{" "}
                        {selectedOrder.address}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Thông tin thanh toán
                      </h3>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex justify-between">
                          <span className="font-semibold text-slate-900">Hình thức:</span>{" "}
                          <span className="uppercase">{selectedOrder.paymentMethod}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-semibold text-slate-900">Vận chuyển:</span>{" "}
                          <span className="uppercase">{selectedOrder.shippingMethod}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">Trạng thái:</span>
                          <span
                            className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}
                          >
                            {STATUS_OPTIONS.find((s) => s.value === selectedOrder.status)?.label}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                      Danh sách sản phẩm
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                        >
                          {item.productId?.img ? (
                            <img
                              src={item.productId.img}
                              alt={item.productId.name}
                              className="h-16 w-16 rounded-lg bg-slate-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                              <Package size={24} />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="line-clamp-1 text-sm font-bold text-slate-900">
                              {item.productId?.name || "Sản phẩm không xác định"}
                            </p>
                            <p className="mt-1 text-xs uppercase text-slate-500">
                              SL: {item.quantity}
                            </p>
                          </div>
                          <p className="font-black text-slate-900">
                            {item.price.toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-6 text-white">
                    <div className="mb-4 space-y-2 border-b border-slate-700 pb-4 text-sm">
                      <p className="flex justify-between">
                        <span className="text-slate-400">Tạm tính (Sản phẩm)</span>{" "}
                        <span>
                          {(
                            selectedOrder.totalPrice -
                            selectedOrder.shippingFee +
                            selectedOrder.discount
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Phí vận chuyển</span>{" "}
                        <span>{selectedOrder.shippingFee.toLocaleString("vi-VN")} đ</span>
                      </p>
                      {selectedOrder.discount > 0 && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Giảm giá voucher</span>{" "}
                          <span className="text-red-400">
                            -{selectedOrder.discount.toLocaleString("vi-VN")} đ
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-bold uppercase tracking-widest">Tổng cộng</span>
                      <span className="text-2xl font-black">
                        {selectedOrder.totalPrice.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
