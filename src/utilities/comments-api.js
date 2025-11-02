import sendRequest from "./sendRequest";
const BASE_URL = "http://127.0.0.1:8000";

// get comments for a post
export async function getPostComments(postId) {
  try {
    const response = await sendRequest(`${BASE_URL}/posts/${postId}/comments/`, "GET");
    return response || [];
  } catch (err) {
    console.error("Error getting comments:", err);
    return [];
  }
}

// create comment
export async function createComment(postId, content) {
  try {
    const response = await sendRequest(`${BASE_URL}/posts/${postId}/comments/`, "POST", { content });
    return response;
  } catch (err) {
    console.error("Error creating comment:", err);
    throw err;
  }
}

// update comment
export async function updateComment(commentId, content) {
  try {
    const response = await sendRequest(`${BASE_URL}/comments/${commentId}/`, "PUT", { content });
    return response;
  } catch (err) {
    console.error("Error updating comment:", err);
    throw err;
  }
}

// delete comment
export async function deleteComment(commentId) {
  try {
    const response = await sendRequest(`${BASE_URL}/comments/${commentId}/`, "DELETE");
    return response;
  } catch (err) {
    console.error("Error deleting comment:", err);
    throw err;
  }
}

