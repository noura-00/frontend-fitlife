// IMPORTS
import "./styles.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import fitLifeLogo from "../../assets/ChatGPT_Image_Nov_3__2025_at_11_26_28_PM-removebg-preview.png";

import * as usersAPI from "../../utilities/users-api";

export default function HomePage({ user, setUser }) {
  const initialState = { username: "", password: "" };
  const [formData, setFormData] = useState(initialState);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Auto-play and loop video
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.log("Video autoplay prevented:", err);
      });
    }
  }, []);

  function handleChange(evt) {
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  }


  async function handleLogin(evt) {
    try {
      evt.preventDefault();
      setError("");
      
      if (!formData.username || !formData.password) {
        setError("Please enter both username and password");
        return;
      }
      
      const loggedInUser = await usersAPI.login(formData);
      if (loggedInUser) {
        setUser(loggedInUser);
        navigate("/profile");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setUser(null);
      let errorMessage = "Invalid username or password";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.toString().includes("Failed to fetch") || err.toString().includes("Network")) {
        errorMessage = "Connection error. Please make sure the backend server is running.";
      }
      
      setError(errorMessage);
    }
  }

  async function handleSignup(evt) {
    try {
      evt.preventDefault();
      setError("");

      if (!formData.username || !formData.password) {
        setError("Please enter username and password");
        return;
      }

      const userData = {
        username: formData.username,
        password: formData.password,
      };

      const newUser = await usersAPI.signup(userData);
      if (newUser) {
        setUser(newUser);
        navigate("/profile");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage = err.message || "An error occurred during registration. Make sure the username is not already taken.";
      setError(errorMessage);
    }
  }

  return (
    <div className="home-page-container">
      {!user && (
        <>
          <header>
            <div className="white-line-container">
              <div className="white-line-left"></div>
              <div className="line-buttons">
                <button 
                  onClick={() => {
                    setShowLoginForm(true);
                    setShowFormModal(true);
                    setError("");
                    setFormData({ username: "", password: "" });
                  }}
                  className={`line-btn login-btn ${showLoginForm && showFormModal ? 'active' : ''}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    setShowLoginForm(false);
                    setShowFormModal(true);
                    setError("");
                    setFormData({ username: "", password: "" });
                  }}
                  className={`line-btn signup-btn ${!showLoginForm && showFormModal ? 'active' : ''}`}
                >
                  Sign Up
                </button>
              </div>
              <div className="white-line-middle"></div>
              <div className="line-logo">
                <img 
                  src={fitLifeLogo} 
                  alt="FitLife" 
                  className="line-logo-img"
                />
              </div>
              <div className="white-line-right"></div>
            </div>
          </header>
          

          
          <div className="bottom-line-container">
            <div className="bottom-line-text">Where fitness meets community</div>
            <div className="bottom-white-line"></div>
            <div className="bottom-line-subtext">
              Track your goals, share your progress, and celebrate every milestone with people who share your passion.
            </div>
          </div>

          {/* Full Background Video */}
          <div className="home-video-background">
            <video
              ref={videoRef}
              className="home-background-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => {
                if (videoRef.current) {
                  videoRef.current.playbackRate = 1.0;
                  videoRef.current.play().catch(err => {
                    console.log("Video play error:", err);
                  });
                }
              }}
              onCanPlay={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(err => {
                    console.log("Video play error on canPlay:", err);
                  });
                }
              }}
            >
              <source src="/videos/video2-compress_X-Design.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay"></div>
          </div>


          {showFormModal && (
            <div className={`home-form-modal ${showLoginForm ? 'show-login' : 'show-signup'}`}>
              <div className="form-modal-content">
                <button 
                  className="close-modal-btn"
                  onClick={() => {
                    setShowFormModal(false);
                    setError("");
                  }}
                >
                  ×
                </button>
                {showLoginForm ? (
                  <form onSubmit={handleLogin} className="auth-form">
                    <h2 className="form-title">Login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-field">
                      <label htmlFor="login_username">Username</label>
                      <input
                        value={formData.username}
                        type="text"
                        name="username"
                        maxLength="150"
                        required
                        id="login_username"
                        onChange={handleChange}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="login_password">Password</label>
                      <input
                        value={formData.password}
                        type="password"
                        name="password"
                        required
                        id="login_password"
                        onChange={handleChange}
                        placeholder="Enter your password"
                      />
                    </div>
                    <button type="submit" className="btn submit">
                      Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="auth-form">
                    <h2 className="form-title">Create New Account</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-field">
                      <label htmlFor="signup_username">Username</label>
                      <input
                        value={formData.username}
                        type="text"
                        name="username"
                        maxLength="150"
                        required
                        id="signup_username"
                        onChange={handleChange}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="signup_password">Password</label>
                      <input
                        value={formData.password}
                        type="password"
                        name="password"
                        required
                        id="signup_password"
                        onChange={handleChange}
                        placeholder="Enter your password"
                      />
                    </div>
                    <button type="submit" className="btn submit">
                      Sign Up
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
