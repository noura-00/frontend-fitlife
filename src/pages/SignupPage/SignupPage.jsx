// IMPORTS
import "./styles.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as usersAPI from "../../utilities/users-api";

export default function SignupPage({ setUser }) {
  const initialState = { username: "", password: "" };
  const [formData, setFormData] = useState(initialState);
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
    setError("");
  }

  async function handleSubmit(evt) {
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

      const user = await usersAPI.signup(userData);
      if (user) {
        setUser(user);
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
    <section className="signup-hero-container">
      {/* Background Video */}
      <div className="signup-video-background">
        <video
          ref={videoRef}
          className="signup-background-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => {
            console.log("Video loaded successfully");
            if (videoRef.current) {
              videoRef.current.play().catch(err => {
                console.log("Video play error:", err);
              });
            }
          }}
          onError={(e) => {
            console.error("Video error:", e);
            console.log("Video element:", videoRef.current);
            console.log("Video src:", videoRef.current?.src);
          }}
          onCanPlay={() => {
            console.log("Video can play");
            if (videoRef.current) {
              videoRef.current.play().catch(err => {
                console.log("Video play error on canPlay:", err);
              });
            }
          }}
        >
          <source src="/videos/video2-compress_X-Design.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

     
      <button 
        onClick={() => navigate("/")} 
        className="signup-close-btn"
        aria-label="Close"
      >
        ✕
      </button>

      <div className="signup-content-wrapper">
        <div className="signup-text-section">
          <h1 className="signup-main-title">FitLife</h1>
          <p className="signup-subtitle">Transform towards a promising future</p>
          <p className="signup-description">
            Join our fitness community and start your journey to a healthier, stronger you.
          </p>
        </div>

        
        <div className="signup-form-section">
          <form onSubmit={handleSubmit} className="signup-form">
            <h2 className="signup-form-title">Create New Account</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-field">
              <label htmlFor="id_username">Username:</label>
              <input
                value={formData.username}
                type="text"
                name="username"
                maxLength="150"
                required
                id="id_username"
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-field">
              <label htmlFor="id_password">Password:</label>
              <input
                value={formData.password}
                type="password"
                name="password"
                required
                id="id_password"
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn signup-submit-btn">
              Sign Up
            </button>

            <p className="link-text">
              Already have an account?{" "}
              <span onClick={() => navigate("/")} className="link">
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

