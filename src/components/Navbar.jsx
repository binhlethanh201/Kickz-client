import { Link } from "react-router-dom";
import { ShoppingBag, Search, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tighter">
          KICKZ.
        </Link>

        {/* Navigation */}
        <nav className="hidden space-x-8 text-sm font-medium md:flex">
          <Link to="/shop" className="transition-colors hover:text-gray-600">
            SHOP
          </Link>
          <Link to="/brands" className="transition-colors hover:text-gray-600">
            BRANDS
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-5">
          <button className="hover:text-gray-600">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link to="/login" className="hover:text-gray-600">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/cart" className="relative flex items-center hover:text-gray-600">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
