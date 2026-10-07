import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productService } from "../services/productService";
import ProductInfo from "../components/ProductInfo";
import ProductReviews from "../components/ProductReviews";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await productService.getProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Sản phẩm không tồn tại.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
      <div className="flex flex-col gap-12 md:flex-row lg:gap-24">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gray-100 md:w-1/2">
          <img
            src={product.img}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="flex w-full md:w-1/2">
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductReviews productId={product._id} />
    </div>
  );
};

export default ProductDetail;
