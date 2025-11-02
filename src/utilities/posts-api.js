import sendRequest from "./sendRequest";
const BASE_URL = "/posts/";

// get all posts
export async function getPosts() {
  try {
    const response = await sendRequest(`${BASE_URL}`, "GET");
    return response || [];
  } catch (err) {
    console.error("Error getting posts:", err);
    return [];
  }
}

// get single post
export async function getPost(id) {
  try {
    const response = await sendRequest(`${BASE_URL}${id}/`, "GET");
    return response;
  } catch (err) {
    console.error("Error getting post:", err);
    return null;
  }
}

// create new post
export async function createPost(formData) {
  try {
    const response = await sendRequest(`${BASE_URL}`, "POST", formData);
    return response;
  } catch (err) {
    console.error("Error creating post:", err);
    throw err;
  }
}

// update post
export async function updatePost(id, formData) {
  try {
    const response = await sendRequest(`${BASE_URL}${id}/`, "PUT", formData);
    return response;
  } catch (err) {
    console.error("Error updating post:", err);
    throw err;
  }
}

// delete post
export async function deletePost(id) {
  try {
    const response = await sendRequest(`${BASE_URL}${id}/`, "DELETE");
    return response;
  } catch (err) {
    console.error("Error deleting post:", err);
    throw err;
  }
}

// get user's posts
export async function getUserPosts(userId) {
  try {
    const posts = await getPosts();
    return posts.filter(post => post.user === userId);
  } catch (err) {
    console.error("Error getting user posts:", err);
    return [];
  }
}

