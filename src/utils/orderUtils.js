export const canCancelOrder = (order) => {
  return ["pending", "paid"].includes(order.status);
};

export const getCancelButtonText = (order) => {
  if (order.status === "pending") {
    return "❌ Hủy ngay";
  }

  if (order.status === "paid") {
    if (order.paymentMethod === "payos") {
      return "Hủy & hoàn tiền";
    }
    if (order.paymentMethod === "cod") {
      return "Yêu cầu hoàn tiền";
    }
  }

  return "Liên hệ admin";
};

export const getCancelMessage = (order) => {
  if (order.status === "pending") {
    return "Hủy đơn hàng này ngay? Bạn sẽ không bị mất phí.";
  }

  if (order.status === "paid") {
    if (order.paymentMethod === "payos") {
      return "Hủy đơn hàng? Hoàn tiền sẽ về tài khoản trong 12-24 giờ.";
    }
    if (order.paymentMethod === "cod") {
      return "Yêu cầu hủy đơn hàng? Admin sẽ xác nhận hoàn tiền " + "trong vòng 3-5 ngày làm việc.";
    }
  }

  return "Không thể hủy đơn hàng ở trạng thái này. " + "Vui lòng liên hệ admin để được hỗ trợ.";
};

export const getRefundInfo = (order) => {
  if (order.status !== "cancelled" || !order.paidAt) {
    return null;
  }

  if (order.paymentMethod === "payos") {
    return {
      type: "PayOS",
      status: "Đang xử lý",
      timeline: "12-24 giờ",
      amount: order.totalPrice,
    };
  }

  if (order.paymentMethod === "cod") {
    return {
      type: "COD",
      status: order.refundRequested ? "Chờ xác nhận admin" : "Đã xác nhận",
      timeline: "3-5 ngày làm việc",
      amount: order.totalPrice,
    };
  }

  return null;
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-slate-100 text-slate-700";
};
