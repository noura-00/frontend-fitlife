import getToken from "./getToken";

export default async function sendRequest(url, method = "GET", payload = null) {
  const options = { method };
  
  // التحقق إذا كان payload هو FormData (لرفع الملفات)
  const isFormData = payload instanceof FormData;
  
  if (payload) {
    if (!isFormData) {
      // إذا لم يكن FormData، أرسل كـ JSON
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(payload);
    } else {
      // إذا كان FormData، لا تحدد Content-Type (دع المتصفح يحدده تلقائياً)
      options.body = payload;
    }
  }

  const token = getToken();
  if (token) {
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, options);

  if (res.ok) {
    // للـ DELETE requests، قد لا يكون هناك محتوى (204 No Content)
    if (res.status === 204 || method === "DELETE") {
      return { success: true };
    }
    
    // التحقق من وجود محتوى قبل محاولة تحويله إلى JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    
    // إذا كان هناك محتوى نصي
    const text = await res.text();
    return text ? text : { success: true };
  }

  // الحصول على رسالة الخطأ من الـ response إن وجدت
  let errorMessage = "Bad Request";
  try {
    const errorData = await res.json();
    errorMessage = errorData.error || errorData.detail || errorMessage;
  } catch (e) {
    errorMessage = `Error ${res.status}: ${res.statusText}`;
  }

  throw new Error(errorMessage);
}
