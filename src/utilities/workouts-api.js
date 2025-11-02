import sendRequest from "./sendRequest";
const BASE_URL = "/workouts/";

// get all workout plans
export async function getWorkoutPlans(goalType = null) {
  try {
    let url = `${BASE_URL}`;
    if (goalType) {
      url += `?goal_type=${goalType}`;
    }
    const response = await sendRequest(url, "GET");
    return response;
  } catch (err) {
    console.error("Error getting workout plans:", err);
    return [];
  }
}

// get single workout plan
export async function getWorkoutPlan(id) {
  try {
    const response = await sendRequest(`${BASE_URL}${id}/`, "GET");
    return response;
  } catch (err) {
    console.error("Error getting workout plan:", err);
    return null;
  }
}

// create workout plan
export async function createWorkoutPlan(formData) {
  try {
    const response = await sendRequest(`${BASE_URL}`, "POST", formData);
    return response;
  } catch (err) {
    console.error("Error creating workout plan:", err);
    throw err;
  }
}

