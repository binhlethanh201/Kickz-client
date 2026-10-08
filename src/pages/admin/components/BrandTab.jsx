import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { brandService } from "../../../services/brandService";
import { Button, SearchInput, Modal, toast, Pagination } from "../../../components/shared/AdminUI";

const BrandTab = () => {
  const { page } = useParams();
  const navigate = useNavigate();
  const currentPage = page ? parseInt(page, 10) : 1;
  const itemsPerPage = 5;

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { name: "", logoUrl: "" };
  const [formData, setFormData] = useState(initialForm);

  const fetchBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchTerm) navigate(`/admin/products/brands`);
  }, [searchTerm, navigate]);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditId(brand._id);
      setFormData({ name: brand.name, logoUrl: brand.logoUrl || "" });
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
        await brandService.updateBrand(editId, formData);
        toast.success("Cập nhật thương hiệu thành công!");
      } else {
        await brandService.createBrand(formData);
        toast.success("Thêm thương hiệu mới thành công!");
        navigate(`/admin/products/brands`);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi lưu thương hiệu!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa thương hiệu này?")) {
      try {
        await brandService.deleteBrand(id);
        toast.success("Đã xóa thương hiệu!");
        fetchBrands();
      } catch (error) {
        toast.error("Lỗi khi xóa!");
      }
    }
  };

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    navigate(`/admin/products/brands/page/${newPage}`);
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm thương hiệu..."
        />
        <Button icon={Plus} onClick={() => handleOpenModal()}>
          Thêm Thương hiệu
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full flex-1 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
            <tr>
              <th className="p-4">Logo</th>
              <th className="p-4">Tên thương hiệu</th>
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
                  Không có thương hiệu nào
                </td>
              </tr>
            ) : (
              currentData.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <img
                      src={b.logoUrl || "https://via.placeholder.com/50"}
                      alt={b.name}
                      className="h-12 w-12 rounded-lg border border-slate-100 bg-white object-contain p-1"
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-900">{b.name}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenModal(b)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
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
        title={editId ? "Sửa Thương hiệu" : "Thêm Thương hiệu"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Tên thương hiệu *
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
              URL Logo *
            </label>
            <input
              type="url"
              required
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
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
export default BrandTab;
