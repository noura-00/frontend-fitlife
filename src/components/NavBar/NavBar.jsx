// IMPORTS
import "./styles.css";
import { Link, useNavigate } from "react-router-dom";
import * as usersAPI from "../../utilities/users-api";
import getToken from "../../utilities/getToken";

export default function NavBar({ user, setUser }) {
  const navigate = useNavigate();
  const isAuthenticated = !!getToken();

  async function handleLogout() {
    await usersAPI.logout();
    setUser(null);
    navigate("/");
  }

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">FitLife</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Home</Link>
        <Link to="/workouts">Workouts</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout} className="logout-btn">
          
        </button>
      </div>
    </nav>
  );
}


