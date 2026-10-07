import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isAddingCart, setIsAddingCart] = useState(false);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  useEffect(() => {
    if (product.size?.length > 0) setSelectedSize(product.size[0]);
    if (product.color?.length > 0) setSelectedColor(product.color[0]);

    const checkWishlist = async () => {
      if (isAuthenticated) {
        try {
          const data = await wishlistService.getWishlist();
          const isSaved = data.wishlist?.some(
            (item) => item._id === product._id || item === product._id,
          );
          setIsInWishlist(!!isSaved);
        } catch (error) {
          console.error("Lỗi lấy wishlist");
        }
      }
    };
    checkWishlist();
  }, [product, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để mua hàng!");
      return navigate("/login");
    }
    if (product.size?.length > 0 && !selectedSize) return alert("Vui lòng chọn Size!");
    if (product.color?.length > 0 && !selectedColor) return alert("Vui lòng chọn Màu sắc!");

    setIsAddingCart(true);
    try {
      await cartService.addToCart(
        product._id,
        1,
        selectedSize ? Number(selectedSize) : null,
        selectedColor || null,
      );
      alert("Thêm vào giỏ hàng thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm vào giỏ");
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để lưu sản phẩm!");
      return navigate("/login");
    }
    setIsTogglingWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product._id);
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product._id);
        setIsInWishlist(true);
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật Wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
        {product.brand?.name || "KICKZ ORIGINALS"}
      </p>
      <h1 className="mb-4 text-3xl font-black uppercase tracking-tighter text-slate-900 md:text-5xl">
        {product.name}
      </h1>
      <p className="mb-8 text-2xl font-bold text-slate-800">
        {product.price.toLocaleString("vi-VN")} VNĐ
      </p>

      <div className="space-y-8">
        {product.color?.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-900">
              Màu sắc:{" "}
              <span className="font-normal capitalize text-slate-600">{selectedColor}</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.color.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(c)}
                  className={`h-10 rounded-xl border-2 px-4 text-sm font-bold uppercase transition-all ${
                    selectedColor === c
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-transparent text-slate-600 hover:border-slate-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.size?.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Kích cỡ (Size)
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.size.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(s)}
                  className={`flex h-12 items-center justify-center rounded-xl border-2 text-sm font-black transition-all ${
                    selectedSize === s
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-transparent text-slate-900 hover:border-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            disabled={isAddingCart}
            className="flex-grow rounded-xl bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-xl disabled:opacity-50"
          >
            {isAddingCart ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
          </button>

          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            className={`flex w-14 items-center justify-center rounded-xl border-2 transition-all duration-300 disabled:opacity-50 ${
              isInWishlist
                ? "border-red-500 bg-red-50 text-red-500 shadow-sm"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            <Heart size={24} strokeWidth={2} className={isInWishlist ? "fill-current" : ""} />
          </button>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-900">
            Mô tả sản phẩm
          </h3>
          <p className="text-base leading-relaxed text-slate-600">
            {product.desc ||
              "Sản phẩm được thiết kế với phong cách tối giản, sử dụng vật liệu cao cấp mang lại sự thoải mái tối đa cho người sử dụng hàng ngày."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
