import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Palette, Zap } from "lucide-react";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";

const ProductSection = ({ title, subtitle, icon: Icon, products, loading, darkBg = false }) => (
  <section className={`py-16 md:py-24 ${darkBg ? "bg-slate-50" : "bg-white"}`}>
    <div className="mx-auto max-w-screen-2xl px-4">
      <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
        <div className="text-center md:text-left">
          <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
            {Icon && <Icon size={24} className="text-indigo-500" strokeWidth={2} />}
            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 md:text-3xl">
              {title}
            </h2>
          </div>
          {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>

        <Link
          to="/shop"
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition-colors hover:text-indigo-600"
        >
          Xem tất cả
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
            <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">
              Đang tải bộ sưu tập...
            </p>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-medium text-slate-400">Đang cập nhật sản phẩm.</p>
        </div>
      )}
    </div>
  </section>
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topPriceProducts, setTopPriceProducts] = useState([]);
  const [topQuantityProducts, setTopQuantityProducts] = useState([]);
  const [topColorProducts, setTopColorProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [featuredRes, priceRes, quantityRes, colorRes] = await Promise.all([
          productService.getAllProducts({ featured: true }),
          productService.getProductsByPrice(),
          productService.getProductsByQuantity(),
          productService.getProductsByColorCount(),
        ]);
        setFeaturedProducts(featuredRes.products || featuredRes);
        setTopPriceProducts(priceRes.products || priceRes);
        setTopQuantityProducts(quantityRes.products || quantityRes);
        setTopColorProducts(colorRes.products || colorRes);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070"
            alt="Sneaker Banner"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
            Bộ sưu tập mới nhất 2026
          </span>
          <h1 className="mb-6 text-5xl font-black uppercase leading-tight tracking-tighter text-white md:text-7xl lg:text-8xl">
            Định Hình <br /> Phong Cách
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-sm font-medium text-slate-300 md:text-base">
            Khám phá những đôi sneaker giới hạn, thiết kế độc quyền và xu hướng thời trang đường phố
            mới nhất chỉ có tại Kickz.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/shop"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 transition-all hover:scale-105 hover:bg-slate-100 sm:w-auto"
            >
              Mua sắm ngay
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <ProductSection
        title="Sản Phẩm Nổi Bật"
        subtitle="Những đôi giày được săn đón nhiều nhất tuần qua"
        icon={Flame}
        products={featuredProducts}
        loading={loading}
      />

      <ProductSection
        title="Bộ Sưu Tập Cao Cấp"
        subtitle="Khẳng định đẳng cấp với những phiên bản giới hạn"
        icon={Sparkles}
        products={topPriceProducts}
        loading={loading}
        darkBg={true}
      />

      <ProductSection
        title="Đa Dạng Màu Sắc"
        subtitle="Thể hiện cá tính qua từng sắc màu độc đáo"
        icon={Palette}
        products={topColorProducts}
        loading={loading}
      />

      <ProductSection
        title="Sẵn Sàng Giao Ngay"
        subtitle="Không cần chờ đợi, đặt là ship liền tay"
        icon={Zap}
        products={topQuantityProducts}
        loading={loading}
        darkBg={true}
      />
    </div>
  );
};

export default Home;
