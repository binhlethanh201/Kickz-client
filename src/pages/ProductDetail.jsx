import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productService } from "../services/productService";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID từ thanh địa chỉ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
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
        {/* Cột trái: Hình ảnh */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 md:w-1/2">
          <img
            src={product.img}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Cột phải: Thông tin & Hành động */}
        <div className="flex w-full flex-col justify-center md:w-1/2">
          <p className="mb-3 text-sm uppercase tracking-widest text-gray-500">
            {product.brand?.name || "KICKZ ORIGINALS"}
          </p>
          <h1 className="mb-4 text-3xl font-light text-gray-900 md:text-4xl">{product.name}</h1>
          <p className="mb-10 text-xl font-medium">${product.price}</p>

          <div className="space-y-8">
            <button className="w-full bg-black py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gray-800">
              Thêm vào giỏ hàng
            </button>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider">
                Mô tả sản phẩm
              </h3>
              <p className="text-sm font-light leading-relaxed text-gray-600">
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
