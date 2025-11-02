import getToken from "./getToken";

export default async function sendRequest(url, method = "GET", payload = null) {
  const options = { method };
  
  const isFormData = payload instanceof FormData;
  
  if (payload) {
    if (!isFormData) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(payload);
    } else {
      options.body = payload;
    }
  }

  const token = getToken();
  if (token) {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`http://localhost:8000${url}`, options);

  if (res.ok) {
    if (res.status === 204 || method === "DELETE") {
      return { success: true };
    }
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    
    const text = await res.text();
    return text ? text : { success: true };
  }

  let errorMessage = "Bad Request";
  try {
    const errorData = await res.json();
    errorMessage = errorData.error || errorData.detail || errorMessage;
  } catch (e) {
    errorMessage = `Error ${res.status}: ${res.statusText}`;
  }

  throw new Error(errorMessage);
}
