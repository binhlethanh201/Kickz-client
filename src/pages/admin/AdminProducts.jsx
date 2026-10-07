import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { adminService } from "../../services/adminService";
import { brandService } from "../../services/brandService";
import { categoryService } from "../../services/categoryService";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    quantity: "",
    img: "",
    brand: "",
    category: "",
    size: "",
    color: "",
    isFeatured: false,
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodData, brandData, catData] = await Promise.all([
        adminService.getAllProducts(),
        brandService.getAllBrands(),
        categoryService.getAllCategories(),
      ]);
      setProducts(prodData);
      setBrands(brandData);
      setCategories(catData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditId(product._id);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        quantity: product.quantity,
        img: product.img,
        brand: product.brand?._id || product.brand,
        category: product.category?._id || product.category,
        size: product.size ? product.size.join(", ") : "",
        color: product.color ? product.color.join(", ") : "",
        isFeatured: product.isFeatured || false,
      });
    } else {
      setEditId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        size: formData.size
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((s) => !isNaN(s) && s !== 0),
        color: formData.color
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c),
      };

      if (editId) {
        await adminService.updateProduct(editId, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await adminService.createProduct(payload);
        alert("Thêm sản phẩm mới thành công!");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác!")
    ) {
      try {
        await adminService.deleteProduct(id);
        fetchData();
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">
          Quản lý Sản phẩm
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg"
        >
          <Plus size={18} strokeWidth={2.5} />
          Thêm sản phẩm mới
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 text-slate-500">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Giá bán</th>
                <th className="p-4">Tồn kho</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="animate-pulse p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center font-bold uppercase tracking-widest text-slate-400"
                  >
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-slate-50">
                    <td className="flex items-center gap-4 p-4">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="h-14 w-14 rounded-xl bg-slate-100 object-cover"
                      />
                      <div>
                        <span className="line-clamp-1 block max-w-xs font-bold text-slate-900">
                          {product.name}
                        </span>
                        {product.isFeatured && (
                          <span className="text-[10px] font-black uppercase text-red-500">
                            Nổi bật
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-black">{product.price.toLocaleString("vi-VN")} đ</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${product.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {product.quantity > 0 ? `${product.quantity} sẵn hàng` : "Hết hàng"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-900 hover:text-white"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-in zoom-in-95 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
                {editId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Link ảnh sản phẩm (URL) *
                  </label>
                  <input
                    type="url"
                    name="img"
                    required
                    value={formData.img}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Thương hiệu *
                  </label>
                  <select
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Danh mục *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Kích cỡ (Size)
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="VD: 39, 40, 41"
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Màu sắc
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="VD: Đen, Trắng"
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-slate-900 focus:bg-white"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="cursor-pointer text-sm font-bold uppercase tracking-widest text-slate-900"
                  >
                    Đánh dấu là sản phẩm nổi bật (Featured)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
