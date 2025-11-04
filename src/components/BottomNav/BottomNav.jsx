// IMPORTS
import "./styles.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as usersAPI from "../../utilities/users-api";

export default function BottomNav({ setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await usersAPI.logout();
      if (setUser) {
        setUser(null);
      }
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  }

  return (
    <nav className="bottom-nav">
      <Link 
        to="/posts" 
        className={`nav-item ${location.pathname === '/posts' || location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <span className="nav-label">Home</span>
      </Link>
      
      <Link 
        to="/exercises" 
        className={`nav-item ${location.pathname === '/exercises' ? 'active' : ''}`}
      >
        <span className="nav-label">Exercises</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        <span className="nav-label">Profile</span>
      </Link>

      <button 
        onClick={handleLogout}
        className="nav-item nav-item-logout"
      >
        <span className="nav-label">Logout</span>
      </button>
    </nav>
  );
}

