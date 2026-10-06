import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingCart, setIsAddingCart] = useState(false);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      try {
        const productData = await productService.getProductById(id);
        setProduct(productData);

        if (productData.size && productData.size.length > 0) {
          setSelectedSize(productData.size[0]);
        }
        if (productData.color && productData.color.length > 0) {
          setSelectedColor(productData.color[0]);
        }

        if (isAuthenticated) {
          try {
            const wishlistData = await wishlistService.getWishlist();
            const isSaved = wishlistData.wishlist?.some((item) => item._id === id || item === id);
            setIsInWishlist(!!isSaved);
          } catch (error) {
            console.log("Không thể lấy wishlist.");
          }
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndWishlist();
  }, [id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }
    if (product?.size?.length > 0 && !selectedSize) {
      return alert("Vui lòng chọn Size!");
    }
    if (product?.color?.length > 0 && !selectedColor) {
      return alert("Vui lòng chọn Màu sắc!");
    }

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
      navigate("/login");
      return;
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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="animate-pulse text-sm uppercase tracking-widest text-gray-400">
          Loading details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Sản phẩm không tồn tại.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-24">
      <div className="flex flex-col gap-12 md:flex-row lg:gap-24">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm md:w-1/2">
          <img
            src={product.img}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="flex w-full flex-col justify-center md:w-1/2">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            {product.brand?.name || "KICKZ ORIGINALS"}
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {product.name}
          </h1>
          <p className="mb-8 text-2xl font-semibold text-slate-800">{product.price} VNĐ</p>

          <div className="space-y-8">
            {product.color && product.color.length > 0 && (
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
                      className={`h-10 rounded-xl border-2 px-4 text-sm font-medium capitalize transition-all ${
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

            {product.size && product.size.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                    Kích cỡ (Size)
                  </h3>
                  <button className="text-xs text-slate-500 underline hover:text-slate-900">
                    Bảng size
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {product.size.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(s)}
                      className={`flex h-12 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all ${
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
                className="flex-grow rounded-xl bg-slate-900 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50"
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
      </div>
    </div>
  );
};

export default ProductDetail;
