import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cartService } from "../services/cartService";
import { authService } from "../services/authService";
import { orderService } from "../services/orderService";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    address: "",
    shippingMethod: "standard",
    paymentMethod: "cod",
    voucherCode: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cartData = await cartService.getCart();
        const cartItems = cartData.cart?.items || cartData.items || [];

        if (cartItems.length === 0) {
          alert("Giỏ hàng của bạn đang trống!");
          navigate("/cart");
          return;
        }
        setCart(cartItems);
        const userData = await authService.getMe();
        if (userData.user.address) {
          const { street, district, city, country } = userData.user.address;
          const fullAddress = [street, district, city, country].filter(Boolean).join(", ");
          setCheckoutForm((prev) => ({ ...prev, address: fullAddress }));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu checkout:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const calculateSubTotal = () => {
    return cart ? cart.reduce((total, item) => total + item.productId.price * item.quantity, 0) : 0;
  };

  const getShippingFee = () => {
    return checkoutForm.shippingMethod === "express" ? 20000 : 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutForm.address.trim()) {
      return alert("Vui lòng nhập địa chỉ giao hàng hợp lệ!");
    }

    setIsProcessing(true);
    try {
      const selectedItems = cart.map((item) => ({
        productId: item.productId._id,
        size: item.size,
        color: item.color,
      }));

      const payload = {
        selectedItems,
        address: checkoutForm.address,
        shippingMethod: checkoutForm.shippingMethod,
        paymentMethod: checkoutForm.paymentMethod,
        voucherCode: checkoutForm.voucherCode || undefined,
      };

      const data = await orderService.createOrder(payload);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Đặt hàng thành công!");
        navigate(`/order/${data.order._id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto animate-pulse px-4 py-24 text-center uppercase tracking-widest text-slate-500">
        Đang tải thông tin thanh toán...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[75vh] max-w-7xl px-4 py-16">
      <h1 className="mb-10 text-center text-3xl font-light uppercase tracking-widest text-slate-900">
        Thanh Toán
      </h1>

      <form onSubmit={handleCheckout} className="flex flex-col gap-12 lg:flex-row">
        <div className="w-full space-y-10 lg:w-3/5">
          <section>
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
              Thông tin giao hàng
            </h2>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                required
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                className="w-full rounded-none border-b border-slate-300 bg-transparent py-2 transition-colors focus:border-slate-900 focus:outline-none"
                placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
              Phương thức vận chuyển
            </h2>
            <div className="space-y-4">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.shippingMethod === "standard" ? "border-slate-900 bg-white shadow-sm" : "border-white/50 bg-white/40 hover:border-slate-300"}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={checkoutForm.shippingMethod === "standard"}
                    onChange={() =>
                      setCheckoutForm({ ...checkoutForm, shippingMethod: "standard" })
                    }
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="font-semibold text-slate-900">
                    Giao hàng tiêu chuẩn (3-5 ngày)
                  </span>
                </div>
                <span className="font-bold text-slate-900">Miễn phí</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.shippingMethod === "express" ? "border-slate-900 bg-white shadow-sm" : "border-white/50 bg-white/40 hover:border-slate-300"}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={checkoutForm.shippingMethod === "express"}
                    onChange={() => setCheckoutForm({ ...checkoutForm, shippingMethod: "express" })}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="font-semibold text-slate-900">Giao hàng hỏa tốc (1-2 ngày)</span>
                </div>
                <span className="font-bold text-slate-900">20.000 VNĐ</span>
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.paymentMethod === "cod" ? "border-slate-900 bg-white shadow-sm" : "border-white/50 bg-white/40 hover:border-slate-300"}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={checkoutForm.paymentMethod === "cod"}
                    onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "cod" })}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="font-semibold text-slate-900">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.paymentMethod === "payos" ? "border-slate-900 bg-white shadow-sm" : "border-white/50 bg-white/40 hover:border-slate-300"}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={checkoutForm.paymentMethod === "payos"}
                    onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "payos" })}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="font-semibold text-slate-900">Thanh toán qua mã QR (PayOS)</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div className="w-full lg:w-2/5">
          <div className="sticky top-24 rounded-2xl border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur-xl">
            <h2 className="mb-6 border-b border-white/60 pb-4 text-lg font-bold uppercase tracking-widest text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mb-6 max-h-60 space-y-4 overflow-y-auto pr-2">
              {cart?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productId.img}
                      alt={item.productId.name}
                      className="h-12 w-12 rounded bg-white object-cover shadow-sm"
                    />
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                        {item.productId.name}
                      </p>
                      <p className="text-xs uppercase text-slate-500">
                        Size: {item.size} | {item.color}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">x{item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="mb-6 space-y-3 border-y border-white/60 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tạm tính</span>
                <span className="font-semibold text-slate-900">
                  {calculateSubTotal().toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Phí vận chuyển</span>
                <span className="font-semibold text-slate-900">
                  {getShippingFee().toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-bold uppercase text-slate-900">Tổng cộng</span>
              <span className="text-3xl font-bold text-slate-900">
                {(calculateSubTotal() + getShippingFee()).toLocaleString("vi-VN")} VNĐ
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl disabled:opacity-50"
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>

            <Link
              to="/cart"
              className="mt-4 block text-center text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
