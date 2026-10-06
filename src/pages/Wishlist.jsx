import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wishlistService } from "../services/wishlistService";
import { Trash2, ShoppingBag } from "lucide-react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error("Lỗi lấy wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      fetchWishlist();
    } catch (error) {
      alert("Xóa sản phẩm thất bại");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-24 text-center uppercase tracking-widest text-gray-500">
        Đang tải mục yêu thích...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[75vh] max-w-7xl px-4 py-16">
      <h1 className="mb-12 text-center text-3xl font-light uppercase tracking-widest text-slate-900">
        Danh sách yêu thích
      </h1>

      {wishlist.length === 0 ? (
        <div className="rounded-2xl border border-white/50 bg-white/40 py-24 text-center shadow-sm backdrop-blur-xl">
          <Heart size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1} />
          <p className="mb-6 text-slate-500">Bạn chưa có sản phẩm yêu thích nào.</p>
          <Link
            to="/"
            className="inline-block rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg"
          >
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/50 shadow-sm backdrop-blur-xl transition-all hover:shadow-md"
            >
              <Link
                to={`/product/${product._id}`}
                className="block aspect-[4/5] overflow-hidden bg-gray-100"
              >
                <img
                  src={product.img}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              <button
                onClick={() => handleRemove(product._id)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500"
                title="Xóa khỏi danh sách"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>

              <div className="flex flex-grow flex-col p-5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {product.brand?.name || "KICKZ"}
                </p>
                <Link
                  to={`/product/${product._id}`}
                  className="mb-2 line-clamp-1 text-base font-semibold text-slate-900 transition-colors hover:text-slate-600"
                >
                  {product.name}
                </Link>
                <p className="mb-4 text-sm font-bold text-slate-900">${product.price}</p>

                <div className="mt-auto pt-2">
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                  >
                    <ShoppingBag size={14} /> Chọn mua
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
