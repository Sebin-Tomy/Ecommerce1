const STATUS_CODES = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

const MESSAGES = {
    ACCOUNT_BLOCKED: "Your account has been blocked. Please contact support for assistance.",
    LOGIN_REQUIRED: "You need to log in to access this resource.",
    COUPON_ALREADY_USED: "Coupon already used.",
    COUPON_EXCEEDS_TOTAL: "Coupon discount amount exceeds the total value.",
    COUPON_APPLIED_SUCCESS: "Coupon applied successfully.",
    COUPON_REMOVED_SUCCESS: "Coupon removed successfully.",
    COUPON_NOT_FOUND: "Coupon not found.",
    CART_UPDATE_FAILED: "Failed to update cart.",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
  };



module.exports = { STATUS_CODES,MESSAGES };
