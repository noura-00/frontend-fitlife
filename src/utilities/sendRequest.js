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

  const apiUrl = `http://127.0.0.1:8000/${url}`
  
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[sendRequest] ${method} ${apiUrl}`, payload ? { payload: isFormData ? 'FormData' : payload } : '');
  }

  try {
    const res = await fetch(apiUrl, options);

    if (res.ok) {
      if (res.status === 204 || method === "DELETE") {
        return { success: true };
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (process.env.NODE_ENV === 'development') {
          console.log(`[sendRequest] Response:`, data);
        }
        return data;
      }
      
      const text = await res.text();
      return text ? text : { success: true };
    }

    let errorMessage = `Error ${res.status}: ${res.statusText}`;
    let errorData = null;
    try {
      errorData = await res.json();
      errorMessage = errorData.error || errorData.detail || errorMessage;
      if (process.env.NODE_ENV === 'development') {
        console.error(`[sendRequest] Error response:`, errorData);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[sendRequest] Error ${res.status}:`, res.statusText);
      }
    }

    const error = new Error(errorMessage);
    error.response = { data: errorData, status: res.status, statusText: res.statusText };
    throw error;
  } catch (err) {
    
    if (err instanceof TypeError && err.message.includes('fetch')) {
      console.error('[sendRequest] Network error:', err);
      throw new Error('Network error. Please check if the backend server is running on http://localhost:8000');
    }
    throw err;
  }
}
