import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query) {
          const data = await productService.searchProducts(query);
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="mx-auto min-h-[75vh] max-w-7xl px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-light uppercase tracking-widest text-slate-900">
          Kết quả tìm kiếm
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Tìm thấy {products.length} kết quả cho "{query}"
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="animate-pulse uppercase tracking-widest text-slate-400">Đang tìm kiếm...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <SearchIcon size={48} className="mb-4 opacity-50" />
          <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
