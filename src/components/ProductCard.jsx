import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="group block cursor-pointer">
      <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden bg-gray-100">
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="space-y-1">
        <h3 className="truncate text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="text-xs uppercase tracking-wider text-gray-500">
          {product.brand?.name || "KICKZ"}
        </p>
        <p className="mt-2 text-sm font-semibold text-black">${product.price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
