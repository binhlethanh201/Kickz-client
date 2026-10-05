import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../services/cartService";
import { Trash2 } from "lucide-react";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data.cart || data);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (productId, size, color) => {
    try {
      await cartService.removeFromCart(productId, size, color);
      fetchCart(); // Gọi lại hàm để cập nhật UI
    } catch (error) {
      alert("Xóa sản phẩm thất bại");
    }
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.productId.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-24 text-center uppercase tracking-widest text-gray-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-16">
      <h1 className="mb-10 text-center text-3xl font-light uppercase tracking-widest text-slate-900">
        Giỏ hàng của bạn
      </h1>

      {!cart?.items || cart.items.length === 0 ? (
        <div className="rounded-2xl border border-white/50 bg-white/40 py-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <p className="mb-6 text-gray-500">Giỏ hàng đang trống.</p>
          <Link
            to="/"
            className="inline-block bg-slate-900 px-8 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-slate-800"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Cột trái: Danh sách sản phẩm */}
          <div className="w-full rounded-2xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl lg:w-2/3">
            {cart.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-6 border-b border-white/50 py-6 last:border-0"
              >
                <img
                  src={item.productId.img}
                  alt={item.productId.name}
                  className="h-24 w-24 rounded-md bg-gray-100 object-cover"
                />
                <div className="flex-grow">
                  <Link
                    to={`/product/${item.productId._id}`}
                    className="text-lg font-medium text-slate-900 transition-colors hover:text-gray-600"
                  >
                    {item.productId.name}
                  </Link>
                  <p className="mt-1 text-sm uppercase tracking-wider text-gray-500">
                    Size: {item.size || "Freesize"}
                  </p>
                  <p className="mt-2 text-sm font-semibold">${item.productId.price}</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <span className="text-sm">SL: {item.quantity}</span>
                  <button
                    onClick={() => handleRemoveItem(item.productId._id, item.size, item.color)}
                    className="text-red-400 transition-colors hover:text-red-600"
                  >
                    <Trash2 size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cột phải: Tổng tiền & Thanh toán */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 rounded-2xl border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="mb-6 border-b border-white/60 pb-4 text-lg font-medium uppercase tracking-widest">
                Tổng đơn hàng
              </h2>
              <div className="mb-8 flex items-center justify-between">
                <span className="text-gray-600">Thành tiền</span>
                <span className="text-2xl font-semibold text-slate-900">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-slate-900 py-4 text-sm uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-slate-800"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
