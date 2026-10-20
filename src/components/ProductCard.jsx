import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="group relative flex flex-col">
      <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 transition-all duration-500 group-hover:shadow-xl">
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
          <div className="flex translate-y-4 transform items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-900 transition-transform duration-300 group-hover:translate-y-0">
            Xem chi tiết <ArrowRight size={14} />
          </div>
        </div>
      </div>
      <div className="flex flex-grow flex-col justify-between px-1">
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {product.brand?.name || "KICKZ"}
          </p>
          <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-900 transition-colors group-hover:text-indigo-600">
            {product.name}
          </h3>
        </div>
        <p className="mt-3 text-sm font-black tracking-wider text-slate-900">
          {product.price.toLocaleString("vi-VN")} <span className="text-xs">₫</span>
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
