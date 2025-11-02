export default function getToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp;
  if (exp < Date.now() / 1000) {
    localStorage.removeItem("token");
    return null;
  }

  return token;
}
