export const REFUND_REASONS = [
  { value: "damaged", label: "Hàng bị hư hỏng" },
  { value: "wrong_item", label: "Giao sai sản phẩm" },
  { value: "not_as_described", label: "Không đúng mô tả" },
  { value: "late_delivery", label: "Giao hàng trễ" },
  { value: "changed_mind", label: "Đổi ý, không muốn mua nữa" },
  { value: "other", label: "Lý do khác" },
];

export const REFUND_STATUSES = [
  { value: "requested", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-700" },
  { value: "approved", label: "Đã duyệt", color: "bg-blue-100 text-blue-700" },
  { value: "rejected", label: "Bị từ chối", color: "bg-red-100 text-red-700" },
  { value: "shipped_back", label: "Đã gửi hàng về", color: "bg-purple-100 text-purple-700" },
  { value: "received", label: "Shop đã nhận hàng", color: "bg-indigo-100 text-indigo-700" },
  { value: "refunded", label: "Đã hoàn tiền", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Đã hủy", color: "bg-slate-100 text-slate-500" },
];

export const REFUND_METHODS = [
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
  { value: "payos_reversal", label: "Hoàn vào số dư" },
  { value: "cash", label: "Tiền mặt" },
];

export const RETURN_CARRIERS = [
  { value: "ghn", label: "GHN" },
  { value: "ghtk", label: "GHTK" },
  { value: "viettelpost", label: "Viettel Post" },
  { value: "jne", label: "JNE" },
  { value: "other", label: "Hãng khác" },
];

export const REQUIRES_RETURN_REASONS = ["damaged", "wrong_item", "not_as_described"];

export const requiresReturn = (reason) => REQUIRES_RETURN_REASONS.includes(reason);

export const getRefundTimelineText = (reason) => {
  return requiresReturn(reason)
    ? "Xử lý & Hoàn tiền trong 5-7 ngày làm việc (Cần trả hàng)"
    : "Xử lý & Hoàn tiền trong 1-2 ngày làm việc";
};

export const canCancelOrder = (order) => {
  return order && order.status === "pending";
};

const REFUND_ELIGIBLE_ORDER_STATUSES = ["paid", "processing", "shipped", "completed"];

export const canRequestRefund = (order) =>
  order && REFUND_ELIGIBLE_ORDER_STATUSES.includes(order.status);

export const getRefundStatusMeta = (status) =>
  REFUND_STATUSES.find((s) => s.value === status) || {
    value: status,
    label: status,
    color: "bg-slate-100 text-slate-700",
  };

export const getRefundReasonLabel = (value) =>
  REFUND_REASONS.find((r) => r.value === value)?.label || value;

export const getRefundMethodLabel = (value) =>
  REFUND_METHODS.find((m) => m.value === value)?.label || value;

export const canCancelRefund = (refund) =>
  refund && ["requested", "approved"].includes(refund.status);
