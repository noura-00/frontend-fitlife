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

export function getUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // JWT from Django REST Framework Simple JWT contains user_id in payload
    return payload.user_id || payload.id || null;
  } catch (e) {
    return null;
  }
}
