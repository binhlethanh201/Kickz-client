const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-light mb-8">New Arrivals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Nơi chứa ProductCard sau này */}
        <p className="text-gray-500 text-sm">Đang tải sản phẩm...</p>
      </div>
    </div>
  );
};

export default Home;