import { Link } from "react-router-dom";
import { ShoppingBag, Search, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-2xl tracking-tighter">
          KICKZ.
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link to="/shop" className="hover:text-gray-600 transition-colors">SHOP</Link>
          <Link to="/brands" className="hover:text-gray-600 transition-colors">BRANDS</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-5">
          <button className="hover:text-gray-600"><Search size={20} strokeWidth={1.5} /></button>
          <Link to="/login" className="hover:text-gray-600"><User size={20} strokeWidth={1.5} /></Link>
          <Link to="/cart" className="hover:text-gray-600 relative flex items-center">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;