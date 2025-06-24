import { authStore } from "../stores/authStore";

export const checkoutExpiration = () => {
  const expiresAt = Number(sessionStorage.getItem("expires_at")) * 1000;
  if (!expiresAt) return false;
  const now = Date.now();
  return now > expiresAt;
};

export const cleanSession = () => {
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("isLogged", "false");
};

export const checkLogState = () => {
  console.log("CHECKING LOG STATE");
  if (typeof window === "undefined" || !window.sessionStorage) return;
  const isExpired = checkoutExpiration();
  if (isExpired) {
    cleanSession();
  }
  if (!isExpired) {
    const { email } = JSON.parse(localStorage.getItem("user") || "{}");
    const { fullName } = JSON.parse(
      localStorage.getItem("participant") || "{}"
    );
    authStore.setState({
      fullName,
      email,
    });
  }
  return isExpired;
};
