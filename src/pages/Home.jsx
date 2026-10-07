import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";

const ProductSection = ({ title, products, loading }) => (
  <section className="mb-20">
    <h2 className="mb-10 text-center text-2xl font-bold uppercase tracking-widest text-slate-900">
      {title}
    </h2>
    {loading ? (
      <div className="flex h-40 items-center justify-center">
        <p className="animate-pulse text-sm uppercase tracking-widest text-gray-400">Loading...</p>
      </div>
    ) : products.length > 0 ? (
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    ) : (
      <p className="text-center text-sm text-slate-400">Chưa có sản phẩm.</p>
    )}
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

        setFeaturedProducts(featuredRes);
        setTopPriceProducts(priceRes);
        setTopQuantityProducts(quantityRes);
        setTopColorProducts(colorRes);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16">
      <ProductSection title="Sản Phẩm Nổi Bật" products={featuredProducts} loading={loading} />
      <ProductSection title="Bộ Sưu Tập Cao Cấp" products={topPriceProducts} loading={loading} />
      <ProductSection title="Đa Dạng Màu Sắc" products={topColorProducts} loading={loading} />
      <ProductSection title="Sẵn Sàng Giao Ngay" products={topQuantityProducts} loading={loading} />
    </div>
  );
};

export default Home;
