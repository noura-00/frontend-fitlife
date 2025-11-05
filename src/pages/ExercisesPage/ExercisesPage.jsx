// IMPORTS
import "./styles.css";
import { useState, useEffect } from "react";
import * as workoutsAPI from "../../utilities/workouts-api";
import * as usersAPI from "../../utilities/users-api";

export default function ExercisesPage() {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectingPlan, setSelectingPlan] = useState(false);

  const goalTypes = {
    all: "All",
    cut: "Weight Loss",
    bulk: "Muscle Building",
    maintain: "Weight Maintenance",
    home: "Home Workouts",
  };

  useEffect(() => {
    loadWorkoutPlans();
  }, [selectedGoal]);

  async function loadWorkoutPlans() {
    try {
      setLoading(true);
      setError("");
      const goalType = selectedGoal === "all" ? null : selectedGoal;
      const plans = await workoutsAPI.getWorkoutPlans(goalType);
      setWorkoutPlans(plans || []);
    } catch (err) {
      console.error("Error loading workout plans:", err);
      const errorMessage = err.message || "Failed to load workout plans. Please make sure you are logged in.";
      setError(errorMessage);
      setWorkoutPlans([]);
    } finally {
      setLoading(false);
    }
  }

  function getGoalTypeLabel(goalType) {
    return goalTypes[goalType] || goalType;
  }

  async function handleSelectPlan(planId) {
    try {
      setSelectingPlan(true);
      await usersAPI.updateProfile({ selected_workout_plan: planId });
      alert("Workout plan selected successfully! You can view it in your profile page.");
      setSelectingPlan(false);
    } catch (err) {
      console.error("Error selecting plan:", err);
      alert("An error occurred while selecting the plan: " + (err.message || "Unknown error"));
      setSelectingPlan(false);
    }
  }

  if (loading) {
    return (
      <div className="exercises-page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exercises-page-container">
        <div className="error-message">{error}</div>
        <button onClick={() => loadWorkoutPlans()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="exercises-page-container">
        <button onClick={() => setSelectedPlan(null)} className="back-btn">
          ← Back
        </button>
        <div className="plan-detail">
          <h1>{selectedPlan.title}</h1>
          <div className="plan-meta">
            <span className="goal-badge">{getGoalTypeLabel(selectedPlan.goal_type)}</span>
            <span className="duration">{selectedPlan.duration} weeks</span>
          </div>
          {selectedPlan.description && (
            <div className="plan-description">
              <h3>Description:</h3>
              <p>{selectedPlan.description}</p>
            </div>
          )}
          {selectedPlan.equipment_needed && (
            <div className="plan-equipment">
              <h3>Equipment Needed:</h3>
              <p>{selectedPlan.equipment_needed}</p>
            </div>
          )}
          {selectedPlan.notes && (
            <div className="plan-notes">
              <h3>Detailed Plan and Tips:</h3>
              <div className="notes-content">{selectedPlan.notes}</div>
            </div>
          )}
          <button
            onClick={() => handleSelectPlan(selectedPlan.id)}
            className="select-plan-btn"
            disabled={selectingPlan}
          >
            {selectingPlan ? "Selecting..." : "✓ Select This Plan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exercises-page-container">
      <h1>Workout Plans</h1>
      <div className="goal-filters">
        {Object.entries(goalTypes).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedGoal(key)}
            className={`filter-btn ${selectedGoal === key ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      {workoutPlans.length === 0 ? (
        <div className="no-plans">
          <p>No workout plans available</p>
        </div>
      ) : (
        <div className="workout-plans-grid">
          {workoutPlans.map((plan) => (
            <div
              key={plan.id}
              className="workout-plan-card"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="plan-header">
                <h3>{plan.title}</h3>
                <span className="goal-badge">{getGoalTypeLabel(plan.goal_type)}</span>
              </div>
              <div className="plan-info">
                <span className="duration">📅 {plan.duration} weeks</span>
              </div>
              {plan.description && (
                <p className="plan-preview">{plan.description.substring(0, 100)}...</p>
              )}
              <button className="view-plan-btn">View Details →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
