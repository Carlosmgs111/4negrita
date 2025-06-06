const checkoutExpiration = () => {
  const expiresAt = new Date(Number(sessionStorage.getItem("expires_at")));
  if (!expiresAt) return false;
  const now = new Date();
  return now < expiresAt;
};

const cleanSession = () => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("expire_at");
  sessionStorage.removeItem("expire_in");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("token_type");
};

export const checkLogState = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  const isExpired = checkoutExpiration();
  if (isExpired) {
    cleanSession();
  }
  return isExpired;
};
