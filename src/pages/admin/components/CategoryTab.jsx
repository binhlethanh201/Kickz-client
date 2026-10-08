import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { categoryService } from "../../../services/categoryService";
import { Button, SearchInput, Modal, toast, Pagination } from "../../../components/shared/AdminUI";

const CategoryTab = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { name: "", imageUrl: "" };
  const [formData, setFormData] = useState(initialForm);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) navigate(`/admin/products/categories`);
  }, [searchTerm, navigate]);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditId(cat._id);
      setFormData({ name: cat.name, imageUrl: cat.imageUrl || "" });
    } else {
      setEditId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editId) {
        await categoryService.updateCategory(editId, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoryService.createCategory(formData);
        toast.success("Thêm danh mục mới thành công!");
        navigate(`/admin/products/categories`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu danh mục!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa danh mục này?")) {
      try {
        await categoryService.deleteCategory(id);
        toast.success("Đã xóa danh mục!");
        fetchCategories();
      } catch (error) {
        toast.error("Lỗi khi xóa!");
      }
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    navigate(`/admin/products/categories/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
        />
        <Button icon={Plus} onClick={() => handleOpenModal()}>
          Thêm Danh mục
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full flex-1 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
            <tr>
              <th className="p-4">Ảnh / Icon</th>
              <th className="p-4">Tên danh mục</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="p-8 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center">
                  Không có danh mục nào
                </td>
              </tr>
            ) : (
              currentData.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <img
                      src={c.imageUrl || "https://via.placeholder.com/50"}
                      alt={c.name}
                      className="h-12 w-12 rounded-lg bg-slate-100 object-cover"
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-900">{c.name}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
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
        title={editId ? "Sửa Danh mục" : "Thêm Danh mục"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Tên danh mục *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              URL Hình ảnh *
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
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
export default CategoryTab;
