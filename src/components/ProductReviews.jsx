import { useState, useEffect } from "react";
import { Star, User, MessageCircle, ShoppingBag, CheckCircle } from "lucide-react";
import { reviewService } from "../services/reviewService";
import { authService } from "../services/authService";
import { orderService } from "../services/orderService";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterStar, setFilterStar] = useState(0);

  const [hasPurchased, setHasPurchased] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getReviewsByProduct(productId);
      setReviews(data);
    } catch (error) {
      console.error("Lỗi lấy đánh giá", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (isAuthenticated) {
      try {
        const userRes = await authService.getMe();
        const orderRes = await orderService.getUserOrders(userRes.user._id);

        const isBought = orderRes.orders.some(
          (order) =>
            ["paid", "processing", "shipped", "completed"].includes(order.status) &&
            order.items.some(
              (item) => item.productId._id === productId || item.productId === productId,
            ),
        );

        setHasPurchased(isBought);
      } catch (error) {
        console.error("Lỗi kiểm tra lịch sử đơn hàng:", error);
      }
    }
  };

  useEffect(() => {
    fetchReviews();
    checkPurchaseStatus();
  }, [productId, isAuthenticated]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setIsSubmitting(true);
    try {
      await reviewService.createReview({ productId, rating, comment });
      alert("Cảm ơn bạn đã đánh giá!");
      setComment("");
      setRating(5);
      fetchReviews();
      setFilterStar(0);
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  const getPercentage = (count) => (totalReviews > 0 ? (count / totalReviews) * 100 : 0);

  const filteredReviews =
    filterStar === 0 ? reviews : reviews.filter((r) => r.rating === filterStar);

  return (
    <div className="mt-20 border-t border-slate-200 pt-16">
      <h2 className="mb-10 text-2xl font-black uppercase tracking-widest text-slate-900">
        Đánh giá từ khách hàng
      </h2>

      <div className="flex flex-col gap-16 lg:flex-row">
        <div className="w-full lg:w-1/3">
          <div className="mb-10 rounded-2xl bg-slate-50 p-8">
            <div className="mb-8 text-center">
              <p className="text-5xl font-black text-slate-900">{averageRating}</p>
              <div className="my-3 flex justify-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={24}
                    fill={s <= Math.round(averageRating) ? "currentColor" : "none"}
                    strokeWidth={s <= Math.round(averageRating) ? 0 : 2}
                  />
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Dựa trên {totalReviews} đánh giá
              </p>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div
                  key={star}
                  className="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
                  onClick={() => setFilterStar(star)}
                  title={`Lọc xem đánh giá ${star} sao`}
                >
                  <span className="w-3 text-right">{star}</span>
                  <Star size={14} className="text-yellow-400" fill="currentColor" strokeWidth={0} />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all duration-700 ease-out"
                      style={{ width: `${getPercentage(ratingCounts[star])}%` }}
                    ></div>
                  </div>
                  <span className="w-6 text-right text-xs">{ratingCounts[star]}</span>
                </div>
              ))}
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
              <p className="mb-4 text-sm font-medium text-slate-500">
                Vui lòng đăng nhập để viết đánh giá cho sản phẩm này.
              </p>
              <a
                href="/login"
                className="inline-block text-sm font-bold uppercase tracking-widest text-slate-900 underline hover:text-slate-600"
              >
                Đăng nhập ngay
              </a>
            </div>
          ) : !hasPurchased ? (
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-8 text-center">
              <ShoppingBag size={32} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                Chỉ những khách hàng đã mua và trải nghiệm sản phẩm mới có thể để lại đánh giá.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Viết đánh giá của bạn
              </h3>
              <div className="flex gap-2 text-yellow-400">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRating(num)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      fill={num <= rating ? "currentColor" : "none"}
                      strokeWidth={num <= rating ? 0 : 2}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows="4"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                className="w-full rounded-xl border-2 border-slate-200 p-4 text-sm outline-none transition-colors focus:border-slate-900"
              ></textarea>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          )}
        </div>
        <div className="w-full lg:w-2/3">
          {totalReviews > 0 && (
            <div className="mb-8 flex flex-wrap gap-3 border-b border-slate-100 pb-8">
              <button
                onClick={() => setFilterStar(0)}
                className={`rounded-full border-2 px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${filterStar === 0 ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-900 hover:bg-slate-50"}`}
              >
                Tất cả ({totalReviews})
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterStar(star)}
                  className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-xs font-bold transition-all ${filterStar === star ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-900 hover:bg-slate-50"}`}
                >
                  {star}{" "}
                  <Star
                    size={12}
                    fill="currentColor"
                    strokeWidth={0}
                    className={filterStar === star ? "text-yellow-400" : "text-slate-300"}
                  />
                  <span className={filterStar === star ? "text-white/70" : "text-slate-400"}>
                    ({ratingCounts[star]})
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-8">
            {loading ? (
              <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-slate-400">
                Đang tải đánh giá...
              </p>
            ) : totalReviews === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 py-20 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  Chưa có đánh giá nào.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Hãy là người đầu tiên sở hữu và đánh giá sản phẩm này!
                </p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 py-12 text-center text-sm font-medium text-slate-500">
                Không có đánh giá {filterStar} sao nào cho sản phẩm này.
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review._id} className="border-b border-slate-100 pb-8 last:border-0">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black uppercase text-slate-900">
                            {review.userId?.firstName} {review.userId?.lastName}
                          </p>
                          <span className="flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-green-600">
                            <CheckCircle size={10} strokeWidth={3} /> Đã mua hàng
                          </span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= review.rating ? "currentColor" : "none"}
                          strokeWidth={s <= review.rating ? 0 : 2}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 pl-16 font-medium leading-relaxed text-slate-600">
                    {review.comment}
                  </p>
                  {review.replies?.length > 0 && (
                    <div className="ml-16 mt-6 rounded-2xl border-l-4 border-slate-900 bg-slate-50 p-5">
                      {review.replies.map((reply, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                          <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                            <MessageCircle size={14} /> Phản hồi từ KICKZ.
                          </p>
                          <p className="text-sm font-medium leading-relaxed text-slate-600">
                            {reply.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
