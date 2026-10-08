import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { brandService } from "../../../services/brandService";
import { categoryService } from "../../../services/categoryService";
import {
  Button,
  SearchInput,
  Modal,
  Badge,
  toast,
  Pagination,
} from "../../../components/shared/AdminUI";

const ProductTab = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
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
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prod, br, cat] = await Promise.all([
        adminService.getAllProducts(),
        brandService.getAllBrands(),
        categoryService.getAllCategories(),
      ]);
      setProducts(prod);
      setBrands(br);
      setCategories(cat);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) navigate(`/admin/products`);
  }, [searchTerm, navigate]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditId(product._id);
      setFormData({
        ...product,
        brand: product.brand?._id || product.brand,
        category: product.category?._id || product.category,
        size: product.size ? product.size.join(", ") : "",
        color: product.color ? product.color.join(", ") : "",
      });
    } else {
      setEditId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await adminService.createProduct(payload);
        toast.success("Thêm sản phẩm mới thành công!");
        navigate(`/admin/products`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa sản phẩm này? Hành động này không thể hoàn tác!")) {
      try {
        await adminService.deleteProduct(id);
        toast.success("Đã xóa sản phẩm thành công!");
        fetchData();
      } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm!");
      }
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    navigate(`/admin/products/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
        />
        <Button icon={Plus} onClick={() => handleOpenModal()}>
          Thêm Sản phẩm
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full flex-1 text-left text-sm">
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
                <td colSpan="4" className="p-8 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center">
                  Không có sản phẩm nào
                </td>
              </tr>
            ) : (
              currentData.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="flex items-center gap-4 p-4">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-14 w-14 rounded-xl bg-slate-100 object-cover"
                    />
                    <div>
                      <span className="block font-bold text-slate-900">{p.name}</span>
                      {p.isFeatured && (
                        <span className="text-[10px] font-black uppercase text-red-500">
                          Nổi bật
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-black">{p.price.toLocaleString("vi-VN")} đ</td>
                  <td className="p-4">
                    <Badge variant={p.quantity > 0 ? "success" : "danger"}>
                      {p.quantity > 0 ? `${p.quantity} sẵn` : "Hết hàng"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white"
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      >
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
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
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
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
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
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
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
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
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
                className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
              >
                <option value="">-- Chọn --</option>
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
                className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
              >
                <option value="">-- Chọn --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Kích cỡ (VD: 39, 40)
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Màu sắc (VD: Đen, Trắng)
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Mô tả
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-slate-900"
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
                Đánh dấu là sản phẩm nổi bật
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-4 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ProductTab;
