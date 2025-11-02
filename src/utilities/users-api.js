import sendRequest from "./sendRequest";
const BASE_URL = "http://127.0.0.1:8000/users/";

// signup function
export async function signup(formData) {
  try {
    const response = await sendRequest(`${BASE_URL}signup/`, "POST", formData);
    if (response && response.access) {
      localStorage.setItem("token", response.access);
      return response.user;
    }
    return null;
  } catch (err) {
    localStorage.removeItem("token");
    console.error("Signup error:", err);
    // إرجاع الخطأ بدلاً من null لنعرض الرسالة التفصيلية
    throw err;
  }
}

// login function
export async function login(formData) {
  try {
    const response = await sendRequest(`${BASE_URL}login/`, "POST", formData);
    if (response && response.access) {
      localStorage.setItem("token", response.access);
      console.log(response, "login check response");
      return response.user;
    }
    localStorage.removeItem("token");
    throw new Error("Invalid credentials");
  } catch (err) {
    localStorage.removeItem("token");
    console.error("Login error:", err);
    throw err;
  }
}

// get profile function
export async function getProfile() {
  try {
    const response = await sendRequest(`${BASE_URL}profile/`, "GET");
    return response;
  } catch (err) {
    console.error("Error getting profile:", err);
    // إرجاع null بدلاً من throw لإظهار رسالة الخطأ في الصفحة
    return null;
  }
}

// update profile function
export async function updateProfile(formData) {
  try {
    const response = await sendRequest(`${BASE_URL}profile/`, "PUT", formData);
    return response;
  } catch (err) {
    // إرجاع الخطأ بدلاً من null لعرض رسالة الخطأ التفصيلية
    throw err;
  }
}

// logout function
export async function logout() {
  localStorage.removeItem("token");
}
