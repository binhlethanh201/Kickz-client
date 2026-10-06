import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, Heart } from "lucide-react";
import { authService } from "../services/authService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dropdownRef = useRef(null);
  const isAuthenticated = !!localStorage.getItem("token");

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
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
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold tracking-tighter">
          KICKZ.
        </Link>

        <nav className="hidden space-x-8 text-sm font-medium md:flex">
          <Link to="/shop" className="transition-colors hover:text-gray-600">
            SHOP
          </Link>
          <Link to="/brands" className="transition-colors hover:text-gray-600">
            BRANDS
          </Link>
        </nav>

        <div className="flex items-center space-x-5">
          <button className="hover:text-gray-600">
            <Search size={20} strokeWidth={1.5} />
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center hover:text-gray-600 focus:outline-none"
              >
                <User size={20} strokeWidth={1.5} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 rounded-xl border border-white/50 bg-white/70 p-2 shadow-lg backdrop-blur-xl">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block rounded-lg px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-white/60"
                  >
                    Tài khoản của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50/50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:text-gray-600">
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <Link to="/wishlist" className="relative flex items-center hover:text-gray-600">
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative flex items-center hover:text-gray-600">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
