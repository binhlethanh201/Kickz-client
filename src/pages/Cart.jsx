import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../services/cartService";
import { Trash2, Plus, Minus } from "lucide-react";

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
      setCart({ items: [] });
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
      fetchCart();
    } catch (error) {
      alert("Xóa sản phẩm thất bại");
    }
  };

  const handleUpdateQuantity = async (productId, currentQty, change, size, color) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      await cartService.updateQuantity(productId, newQty, size, color);
      fetchCart();
    } catch (error) {
      alert("Cập nhật số lượng thất bại");
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
    <div className="mx-auto min-h-[75vh] max-w-7xl px-4 py-16">
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
          <div className="w-full rounded-2xl border border-white/60 bg-white/50 p-6 shadow-sm backdrop-blur-xl lg:w-2/3">
            {cart.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border-b border-white/50 py-6 last:border-0 sm:gap-6"
              >
                <img
                  src={item.productId.img}
                  alt={item.productId.name}
                  className="h-24 w-24 rounded-xl bg-gray-100 object-cover shadow-sm"
                />
                <div className="flex-grow">
                  <Link
                    to={`/product/${item.productId._id}`}
                    className="text-lg font-medium text-slate-900 transition-colors hover:text-gray-600"
                  >
                    {item.productId.name}
                  </Link>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Size: {item.size || "Freesize"} | Color:{" "}
                    <span className="capitalize">{item.color || "Mặc định"}</span>
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {item.productId.price.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => handleRemoveItem(item.productId._id, item.size, item.color)}
                    className="text-slate-300 transition-colors hover:text-red-500"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>

                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId._id,
                          item.quantity,
                          -1,
                          item.size,
                          item.color,
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="text-slate-400 transition-colors hover:text-slate-900 disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId._id,
                          item.quantity,
                          1,
                          item.size,
                          item.color,
                        )
                      }
                      className="text-slate-400 transition-colors hover:text-slate-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 rounded-2xl border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="mb-6 border-b border-white/60 pb-4 text-lg font-bold uppercase tracking-widest text-slate-900">
                Tổng đơn hàng
              </h2>
              <div className="mb-8 flex items-center justify-between">
                <span className="font-medium text-slate-600">Thành tiền</span>
                <span className="text-3xl font-bold text-slate-900">
                  {calculateTotal().toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl"
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
