import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const brandId = searchParams.get("brand");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (categoryId) params.category = categoryId;
        if (brandId) params.brand = brandId;
        const data = await productService.getAllProducts(params);
        setProducts(data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, brandId]);

  return (
    <div className="mx-auto min-h-[75vh] max-w-7xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-light uppercase tracking-widest text-slate-900">Cửa Hàng</h1>
        {(categoryId || brandId) && (
          <p className="mt-2 text-sm uppercase tracking-widest text-slate-500">
            Đang lọc theo: {categoryId ? "Danh mục" : ""}
            {categoryId && brandId ? " & " : ""}
            {brandId ? "Thương hiệu" : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="animate-pulse uppercase tracking-widest text-slate-400">
            Đang tải sản phẩm...
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="uppercase tracking-widest">Không có sản phẩm nào phù hợp.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
