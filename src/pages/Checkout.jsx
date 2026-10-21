import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { cartService } from "../services/cartService";
import { authService } from "../services/authService";
import { orderService } from "../services/orderService";
import { cardService } from "../services/cardService";
import VoucherInput from "../components/VoucherInput";
import { voucherService } from "../services/voucherService";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isUseWallet, setIsUseWallet] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    phone: "",
    address: "",
    shippingMethod: "standard",
    paymentMethod: "cod",
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
        const [userData, cardData] = await Promise.all([
          authService.getMe(),
          cardService.getMyBalance().catch(() => ({ balance: 0 })),
        ]);

        if (
          !userData.user.phone ||
          !userData.user.address ||
          !userData.user.address.street ||
          !userData.user.address.city
        ) {
          alert(
            "Bạn cần cập nhật Số điện thoại và Địa chỉ giao hàng trong trang cá nhân trước khi thanh toán!",
          );
          navigate("/profile");
          return;
        }
        let fullAddress = "";
        if (userData.user.address) {
          const { street, district, city, country } = userData.user.address;
          fullAddress = [street, district, city, country].filter(Boolean).join(", ");
        }

        setCheckoutForm((prev) => ({
          ...prev,
          phone: userData.user.phone || "",
          address: fullAddress,
        }));

        setWalletBalance(cardData.balance || 0);
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

  const handleApplyVoucher = (voucher, discount, newTotal) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };
  const subtotal = calculateSubTotal();
  const shippingFee = getShippingFee();
  const totalBeforeDiscount = subtotal + shippingFee;
  const totalAfterVoucher = Math.max(0, totalBeforeDiscount - discountAmount);
  const walletDeduction = isUseWallet ? Math.min(walletBalance, totalAfterVoucher) : 0;
  const finalTotal = totalAfterVoucher - walletDeduction;

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
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        shippingMethod: checkoutForm.shippingMethod,
        paymentMethod: isUseWallet && finalTotal === 0 ? "wallet" : checkoutForm.paymentMethod,
        voucherCode: appliedVoucher?.code || null,
        isUseWallet: isUseWallet,
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
    <div className="animate-in fade-in mx-auto min-h-[75vh] max-w-7xl px-4 py-16">
      <h1 className="mb-10 text-center text-3xl font-light uppercase tracking-widest text-slate-900">
        Thanh Toán
      </h1>

      <form onSubmit={handleCheckout} className="flex flex-col gap-12 lg:flex-row">
        <div className="w-full space-y-10 lg:w-3/5">
          <section>
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
              Thông tin giao hàng
            </h2>
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                required
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                className="w-full rounded-none border-b border-slate-300 bg-transparent py-2 font-medium transition-colors focus:border-slate-900 focus:outline-none"
                placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Số điện thoại
              </label>
              <input
                type="text"
                required
                value={checkoutForm.phone}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                className="w-full rounded-none border-b border-slate-300 bg-transparent py-2 font-medium transition-colors focus:border-slate-900 focus:outline-none"
                placeholder="Số điện thoại"
              />
            </div>
          </section>
          <section>
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
              Phương thức vận chuyển
            </h2>
            <div className="space-y-4">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.shippingMethod === "standard" ? "border-slate-900 bg-white shadow-sm" : "border-slate-100 bg-slate-50 hover:border-slate-300"}`}
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
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.shippingMethod === "express" ? "border-slate-900 bg-white shadow-sm" : "border-slate-100 bg-slate-50 hover:border-slate-300"}`}
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
          <VoucherInput
            orderTotal={totalBeforeDiscount}
            onApply={handleApplyVoucher}
            appliedVoucher={appliedVoucher}
            onRemove={handleRemoveVoucher}
          />
          <section>
            <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
              Sử dụng số dư ví
            </h2>
            <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="text-slate-700" size={24} />
                  <div>
                    <p className="text-sm font-bold uppercase text-slate-900">Số dư khả dụng</p>
                    <p className="text-xs font-medium text-slate-500">
                      {walletBalance.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>

                {walletBalance > 0 ? (
                  <label className="relative flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isUseWallet}
                      onChange={() => setIsUseWallet(!isUseWallet)}
                    />
                    <div
                      className={`h-6 w-11 rounded-full transition-colors ${isUseWallet ? "bg-slate-900" : "bg-slate-300"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${isUseWallet ? "translate-x-5" : ""}`}
                    ></div>
                  </label>
                ) : (
                  <span className="text-xs font-bold uppercase text-slate-400">Không khả dụng</span>
                )}
              </div>

              {isUseWallet && walletDeduction > 0 && (
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xs font-bold text-green-600">
                  <span>Dùng ví thanh toán:</span>
                  <span>-{walletDeduction.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
            </div>
          </section>
          {finalTotal > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="mb-6 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">
                Phương thức thanh toán phần còn lại
              </h2>
              <div className="space-y-4">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.paymentMethod === "cod" ? "border-slate-900 bg-white shadow-sm" : "border-slate-100 bg-slate-50 hover:border-slate-300"}`}
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
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${checkoutForm.paymentMethod === "payos" ? "border-slate-900 bg-white shadow-sm" : "border-slate-100 bg-slate-50 hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={checkoutForm.paymentMethod === "payos"}
                      onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "payos" })}
                      className="h-4 w-4 accent-slate-900"
                    />
                    <span className="font-semibold text-slate-900">
                      Thanh toán qua mã QR (PayOS)
                    </span>
                  </div>
                </label>
              </div>
            </section>
          )}
        </div>

        <div className="w-full lg:w-2/5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="mb-6 border-b border-slate-100 pb-4 text-lg font-bold uppercase tracking-widest text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mb-6 max-h-60 space-y-4 overflow-y-auto pr-2">
              {cart?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productId.img}
                      alt={item.productId.name}
                      className="h-12 w-12 rounded border border-slate-100 bg-slate-50 object-cover"
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

            <div className="mb-6 space-y-3 border-y border-slate-100 py-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600">Tạm tính</span>
                <span className="font-bold text-slate-900">
                  {subtotal.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600">Phí vận chuyển</span>
                <span className="font-bold text-slate-900">
                  {shippingFee > 0 ? `${shippingFee.toLocaleString("vi-VN")} đ` : "Miễn phí"}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-bold">Giảm giá Voucher</span>
                  <span className="font-black">-{discountAmount.toLocaleString("vi-VN")} đ</span>
                </div>
              )}

              {walletDeduction > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span className="font-bold">Sử dụng ví</span>
                  <span className="font-black">-{walletDeduction.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
            </div>

            <div className="mb-8 flex items-end justify-between">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Cần thanh toán
              </span>
              <span className="text-3xl font-black text-slate-900">
                {finalTotal.toLocaleString("vi-VN")} đ
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
              className="mt-4 block text-center text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900"
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
