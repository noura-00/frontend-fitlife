import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav/BottomNav";
import HomePage from "./pages/HomePage/HomePage";
import SignupPage from "./pages/SignupPage/SignupPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import PostsPage from "./pages/PostsPage/PostsPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ExercisesPage from "./pages/ExercisesPage/ExercisesPage";
import getToken from "./utilities/getToken";

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isAuthenticated = !!getToken();
  
  // Hide BottomNav on login and signup pages
  const hideBottomNav = location.pathname === "/" || location.pathname === "/signup";
  const showBottomNav = isAuthenticated && !hideBottomNav;

  return (
    <main className="App">
      <Routes>
        <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
        <Route path="/signup" element={<SignupPage setUser={setUser} />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/posts" element={<PostsPage user={user} />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showBottomNav && <BottomNav setUser={setUser} />}
    </main>
  );
}

export default App;
