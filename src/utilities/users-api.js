import sendRequest from "./sendRequest";
const BASE_URL = "/users/";

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
    return null;
  }
}

// update profile function
export async function updateProfile(formData) {
  try {
    const response = await sendRequest(`${BASE_URL}profile/`, "PUT", formData);
    return response;
  } catch (err) {
    throw err;
  }
}

// logout function
export async function logout() {
  localStorage.removeItem("token");
}

// follow user function
export async function followUser(userId) {
  try {
    const response = await sendRequest(`users/${userId}/follow/`, "POST");
    return response;
  } catch (err) {
    throw err;
  }
}

// unfollow user function
export async function unfollowUser(userId) {
  try {
    const response = await sendRequest(`users/${userId}/follow/`, "DELETE");
    return response;
  } catch (err) {
    throw err;
  }
}

// check if following user
export async function checkFollowing(userId) {
  try {
    const response = await sendRequest(`users/${userId}/follow/`, "GET");
    return response;
  } catch (err) {
    throw err;
  }
}
