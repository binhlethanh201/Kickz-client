import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Heart, X, ArrowRight } from "lucide-react";
import { authService } from "../services/authService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { brandService } from "../services/brandService";
import ProductCard from "./ProductCard";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dropdownRef = useRef(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setActiveMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchOpen || activeMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen, activeMenu]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await productService.searchProducts(searchQuery.trim());
          setSearchResults(results);
        } catch (error) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catData, brandData] = await Promise.all([
          categoryService.getAllCategories(),
          brandService.getAllBrands(),
        ]);
        setCategories(catData);
        setBrands(brandData);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu menu:", error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchCartCount = async () => {
    if (!isAuthenticated) return setCartCount(0);
    try {
      const data = await cartService.getCart();
      const items = data.cart?.items || data.items || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      setCartCount(0);
    }
  };

  const fetchWishlistCount = async () => {
    if (!isAuthenticated) return setWishlistCount(0);
    try {
      const data = await wishlistService.getWishlist();
      setWishlistCount(data.count || 0);
    } catch (error) {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("wishlistUpdated", fetchWishlistCount);
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("wishlistUpdated", fetchWishlistCount);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    authService.logout();
    window.location.reload();
  };

  return (
    <>
      {(activeMenu || isSearchOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setActiveMenu(null);
            setIsSearchOpen(false);
          }}
        />
      )}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled || activeMenu || isSearchOpen
            ? "bg-white shadow-sm"
            : "bg-white/80 backdrop-blur-md"
        }`}
        onMouseLeave={() => !isSearchOpen && setActiveMenu(null)}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 ${isScrolled && !isSearchOpen ? "h-14" : "h-20"}`}
        >
          <Link
            to="/"
            className="text-3xl font-black tracking-tighter text-slate-900"
            onClick={() => {
              setActiveMenu(null);
              setIsSearchOpen(false);
            }}
          >
            KICKZ.
          </Link>

          <nav className="hidden h-full space-x-12 text-sm font-bold tracking-widest md:flex">
            <div
              className={`flex h-full cursor-pointer items-center border-b-2 transition-all duration-300 ${activeMenu === "shop" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"}`}
              onMouseEnter={() => {
                setActiveMenu("shop");
                setIsSearchOpen(false);
              }}
            >
              SHOP
            </div>
            <div
              className={`flex h-full cursor-pointer items-center border-b-2 transition-all duration-300 ${activeMenu === "brands" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"}`}
              onMouseEnter={() => {
                setActiveMenu("brands");
                setIsSearchOpen(false);
              }}
            >
              BRANDS
            </div>
          </nav>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setActiveMenu(null);
              }}
              className={`transition-colors ${isSearchOpen ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              {isSearchOpen ? (
                <X size={22} strokeWidth={2} />
              ) : (
                <Search size={22} strokeWidth={2} />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-slate-600 hover:text-slate-900 focus:outline-none"
                >
                  <User size={22} strokeWidth={2} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-6 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/order"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Đơn hàng
                    </Link>
                    <div className="my-1 border-t border-slate-100"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                <User size={22} strokeWidth={2} />
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  className="relative flex items-center text-slate-600 hover:text-slate-900"
                >
                  <Heart size={22} strokeWidth={2} />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative flex items-center text-slate-600 hover:text-slate-900"
                >
                  <ShoppingBag size={22} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>

        <div
          className={`absolute left-0 top-full w-full origin-top overflow-hidden bg-white transition-all duration-300 ease-in-out ${
            activeMenu
              ? "max-h-[500px] border-b border-slate-200 opacity-100 shadow-2xl"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-10">
            {activeMenu === "shop" && (
              <div className="animate-in fade-in slide-in-from-top-4 flex gap-12 duration-500">
                <div className="w-2/3">
                  <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Tất cả danh mục
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/shop?category=${cat._id}`}
                        onClick={() => setActiveMenu(null)}
                        className="group flex items-center justify-between border-b border-slate-100 pb-3 text-lg font-black uppercase tracking-wider text-slate-800 transition-all hover:border-slate-900 hover:text-slate-900"
                      >
                        {cat.name}
                        <ArrowRight
                          size={20}
                          className="text-slate-900 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100"
                        />
                      </Link>
                    ))}
                    <Link
                      to="/shop"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-center justify-between border-b border-slate-100 pb-3 text-lg font-black uppercase tracking-wider text-slate-800 transition-all hover:border-slate-900 hover:text-slate-900"
                    >
                      XEM TẤT CẢ SẢN PHẨM
                      <ArrowRight
                        size={20}
                        className="text-slate-900 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100"
                      />
                    </Link>
                  </div>
                </div>

                <div
                  className="group relative w-1/3 cursor-pointer overflow-hidden rounded-2xl bg-slate-100 shadow-inner"
                  onClick={() => navigate("/shop")}
                >
                  <img
                    src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop"
                    alt="New Collection"
                    className="h-[300px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                    <span className="mb-2 w-max rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                      HOT DROP
                    </span>
                    <h4 className="text-2xl font-black uppercase tracking-widest text-white">
                      NEW ARRIVALS
                    </h4>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "brands" && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Thương hiệu hàng đầu
                  </h3>
                  <Link
                    to="/shop"
                    onClick={() => setActiveMenu(null)}
                    className="text-xs font-bold uppercase tracking-widest text-slate-900 underline hover:text-slate-600"
                  >
                    Duyệt tất cả
                  </Link>
                </div>
                <div className="flex flex-wrap gap-4">
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      to={`/shop?brand=${brand._id}`}
                      onClick={() => setActiveMenu(null)}
                      className="rounded-full border-2 border-slate-200 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-600 transition-all duration-300 hover:-translate-y-1 hover:border-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-lg"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`absolute left-0 top-full w-full origin-top overflow-hidden bg-white transition-all duration-300 ease-in-out ${
            isSearchOpen
              ? "max-h-[85vh] border-b border-slate-200 opacity-100 shadow-2xl"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex max-h-[85vh] flex-col">
            <div className="shrink-0 border-b border-slate-100 bg-white">
              <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
                <Search className="mr-3 text-slate-400" size={18} strokeWidth={2} />
                <form
                  className="flex-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setIsSearchOpen(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium tracking-widest text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </form>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-2 text-slate-400 hover:text-slate-900"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8">
              <div className="mx-auto max-w-7xl">
                {!searchQuery.trim() ? (
                  <div className="mt-8 text-center text-slate-400">
                    <p className="text-sm font-medium uppercase tracking-widest">
                      Tìm kiếm sneakers, quần áo, phụ kiện...
                    </p>
                  </div>
                ) : isSearching ? (
                  <div className="mt-8 text-center">
                    <p className="animate-pulse text-sm font-medium uppercase tracking-widest text-slate-400">
                      Đang tìm kiếm...
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Kết quả ({searchResults.length})
                      </p>
                      <button
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setIsSearchOpen(false);
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-slate-900 underline hover:text-slate-600"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:grid-cols-5">
                      {searchResults.slice(0, 5).map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center text-slate-400">
                    <p className="text-sm font-medium uppercase tracking-widest">
                      Không tìm thấy kết quả cho "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
