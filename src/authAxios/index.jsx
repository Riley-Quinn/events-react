import axios from "./ApiConfig";

const token = localStorage.getItem("token");
const authAxios = axios?.create({
  baseURL: window.location.host === "localhost:3000" ? `http://localhost:4000/api` : "/api",
  headers: { Authorization: `Bearer ${token}` },
});
authAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.status === 401) {
      // Check if the current page is not already the sign-in page
      if (
        window.location.pathname !== "/authentication/sign-in" &&
        window.location.pathname !== "/signup" &&
        window.location.pathname !== "/forget-password" &&
        window.location.pathname !== "/reset-password"
      ) {
        window.location.href = "/authentication/sign-in";
      }
    }
    return Promise.reject(err);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    authAxios.defaults.headers.common["Authorization"] = token;

    localStorage.setItem("token", token);
  } else {
    delete authAxios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

export default authAxios;
