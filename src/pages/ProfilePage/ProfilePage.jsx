// IMPORTS
import "./styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as usersAPI from "../../utilities/users-api";
import * as postsAPI from "../../utilities/posts-api";
import * as commentsAPI from "../../utilities/comments-api";
import getToken from "../../utilities/getToken";

export default function ProfilePage({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postFormData, setPostFormData] = useState({ content: "", workout_plan: "", image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeTab, setActiveTab] = useState("posts"); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [showCelebration, setShowCelebration] = useState(false); // Celebration modal
  const [previousProgress, setPreviousProgress] = useState(0); // Track previous progress

  const goalTypes = {
    cut: "Weight Loss",
    bulk: "Muscle Building",
    maintain: "Weight Maintenance",
    home: "Home Workouts",
  };

  function getGoalTypeLabel(goalType) {
    return goalTypes[goalType] || goalType;
  }
  const [formData, setFormData] = useState({
    bio: "",
    profile_picture: "",
    goal: "",
    current_weight: "",
    target_weight: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const profileData = await usersAPI.getProfile();
      if (profileData) {
        setProfile(profileData);
        setFormData({
          bio: profileData.bio || "",
          profile_picture: profileData.profile_picture || "",
          goal: profileData.goal || "",
          current_weight: profileData.current_weight || "",
          target_weight: profileData.target_weight || "",
        });
        // Set profile picture preview if exists
        if (profileData.profile_picture) {
          const fullUrl = profileData.profile_picture.startsWith('http') 
            ? profileData.profile_picture 
            : (profileData.profile_picture.startsWith('/') ? profileData.profile_picture : `/${profileData.profile_picture}`);
          setProfileImagePreview(fullUrl);
        } else {
          setProfileImagePreview(null);
        }
        // Load user posts
        await loadUserPosts(profileData.username);
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      const errorMessage = err.message || "An error occurred while loading the profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserPosts(username) {
    try {
      const allPosts = await postsAPI.getPosts();
      // Filter posts for current user
      const userPosts = allPosts.filter(post => post.user_username === username);
      setPosts(userPosts);
    } catch (err) {
      console.error("Error loading user posts:", err);
    }
  }

  async function loadPostComments(postId) {
    try {
      setLoadingComments(true);
      const comments = await commentsAPI.getPostComments(postId);
      setPostComments(comments || []);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  }

  function handlePostClick(post) {
    setSelectedPost(post);
    setShowPostDetailModal(true);
    loadPostComments(post.id);
  }

  async function handleAddComment(postId) {
    try {
      if (!commentText.trim()) return;
      
      const newComment = await commentsAPI.createComment(postId, commentText);
      setCommentText("");
      
      // Add new comment to state
      if (newComment) {
        setPostComments(previousComments => [newComment, ...previousComments]);
        // Update comments count for selected post
        if (selectedPost) {
          setSelectedPost(previousPost => ({
            ...previousPost,
            comments_count: (previousPost.comments_count || 0) + 1
          }));
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred while adding the comment");
    }
  }

  async function handleDeleteComment(commentId, postId) {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        
        await commentsAPI.deleteComment(commentId);
        
        // Remove comment from state
        setPostComments(previousComments => {
          const filtered = previousComments.filter(comment => comment.id !== commentId);
          console.log(`Deleted comment ${commentId}. Comments: ${previousComments.length} -> ${filtered.length}`);
          return filtered;
        });
        
        // Update comments count for selected post
        if (selectedPost) {
          setSelectedPost(previousPost => ({
            ...previousPost,
            comments_count: Math.max(0, (previousPost.comments_count || 0) - 1)
          }));
        }
        
        // Update post in posts list
        setPosts(previousPosts => previousPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments_count: Math.max(0, (post.comments_count || 0) - 1)
            };
          }
          return post;
        }));
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError(err.message || "An error occurred while deleting the comment");
      }
    }
  }

  async function handleDeletePost(postId) {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        
        await postsAPI.deletePost(postId);
        
        // Remove post from state
        setPosts(previousPosts => {
          const filtered = previousPosts.filter(post => post.id !== postId);
          console.log(`Deleted post ${postId}. Posts: ${previousPosts.length} -> ${filtered.length}`);
          return filtered;
        });
        
        // Close modal if deleted post was selected
        if (selectedPost && selectedPost.id === postId) {
          setShowPostDetailModal(false);
          setSelectedPost(null);
          setPostComments([]);
          setCommentText("");
        }
      } catch (err) {
        console.error("Error deleting post:", err);
        setError(err.message || "An error occurred while deleting the post");
      }
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    loadProfile();
    
  }, [navigate]);

  // Monitor progress and show celebration at 100%
  useEffect(() => {
    if (!profile || !profile.current_weight || !profile.target_weight) {
      setPreviousProgress(0);
      return;
    }
    
    const currentNum = parseFloat(String(profile.current_weight).replace(/[^\d.]/g, ''));
    const targetNum = parseFloat(String(profile.target_weight).replace(/[^\d.]/g, ''));
    
    if (isNaN(currentNum) || isNaN(targetNum)) {
      setPreviousProgress(0);
      return;
    }
    
    const progress = calculateProgress(profile.current_weight, profile.target_weight, profile.goal);
    
    // Show celebration when progress reaches 100% and wasn't 100% before
    if (progress === 100 && previousProgress < 100) {
      setShowCelebration(true);
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 6000);
      
      setPreviousProgress(progress);
      return () => clearTimeout(timer);
    }
    
    setPreviousProgress(progress);
    
  }, [profile?.current_weight, profile?.target_weight, profile?.goal]);

  function handleChange(evt) {
    if (evt.target.name === "profile_picture") {
      const file = evt.target.files[0];
      if (file) {
        // Save file in formData
        setFormData({ ...formData, profile_picture: file });
        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [evt.target.name]: evt.target.value });
    }
    setError("");
    setSuccess("");
  }

  function handlePostFormChange(evt) {
    if (evt.target.name === "image") {
      const file = evt.target.files[0];
      if (file) {
        setPostFormData({ ...postFormData, image: file });
        // Show image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPostFormData({ ...postFormData, [evt.target.name]: evt.target.value });
    }
    setError("");
  }

  async function handlePostSubmit(evt) {
    try {
      evt.preventDefault();
      setError("");

      if (!postFormData.content.trim()) {
        setError("Please enter post content");
        return;
      }

      // Send data as FormData to support image upload
      const formDataToSend = new FormData();
      formDataToSend.append("content", postFormData.content);
      
      if (postFormData.workout_plan && postFormData.workout_plan.toString().trim() && postFormData.workout_plan !== "0") {
        formDataToSend.append("workout_plan", postFormData.workout_plan);
      }
      if (postFormData.image) {
        formDataToSend.append("image", postFormData.image);
      }

      const newPost = await postsAPI.createPost(formDataToSend);
      setShowCreatePostModal(false);
      setPostFormData({ content: "", workout_plan: "", image: null });
      setImagePreview(null);
      setSuccess("Post created successfully!");
      
      // Add new post to state immediately
      if (newPost && newPost.user_username === profile.username) {
        setPosts(previousPosts => [newPost, ...previousPosts]);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "An error occurred while creating the post");
    }
  }

  // Calculate progress percentage (closeness to target)
  function calculateProgress(current, target, goal) {
    if (!current || !target) return 0;
    
    // Try to extract numeric values from text
    const currentNum = parseFloat(String(current).replace(/[^\d.]/g, ''));
    const targetNum = parseFloat(String(target).replace(/[^\d.]/g, ''));
    
    // If we can't parse numbers, don't show progress
    if (isNaN(currentNum) || isNaN(targetNum)) return 0;
    
    const diff = Math.abs(currentNum - targetNum);
    const maxWeight = Math.max(currentNum, targetNum);
    
    if (maxWeight === 0) return 0;
    
    // Calculate progress based on relative difference
    // The smaller the difference, the higher the progress (closer to goal)
    const progress = Math.max(0, Math.min(100, Math.round((1 - (diff / maxWeight)) * 100)));
    
    // For weight loss: if reached goal or exceeded, progress = 100%
    if (goal && (goal.includes('Weight Loss') || goal.includes('cut') || goal.includes('lose'))) {
      if (currentNum <= targetNum) {
        return 100;
      }
    }
    
    // For muscle building: if reached goal or exceeded, progress = 100%
    if (goal && (goal.includes('Muscle Building') || goal.includes('bulk') || goal.includes('gain'))) {
      if (currentNum >= targetNum) {
        return 100;
      }
    }
    
    return progress;
  }

  async function handleSubmit(evt) {
    try {
      evt.preventDefault();
      setError("");
      setSuccess("");

      
      const hasNewImage = formData.profile_picture instanceof File;

      
      const dataToSend = {
        bio: formData.bio || "",
        goal: formData.goal || "",
        current_weight: formData.current_weight || null,
        target_weight: formData.target_weight || null,
      };

      // If there's a new image, use FormData
      if (hasNewImage) {
        const formDataToSend = new FormData();
        formDataToSend.append("bio", dataToSend.bio);
        formDataToSend.append("goal", dataToSend.goal);
        if (dataToSend.current_weight !== null) {
          formDataToSend.append("current_weight", dataToSend.current_weight);
        }
        if (dataToSend.target_weight !== null) {
          formDataToSend.append("target_weight", dataToSend.target_weight);
        }
        formDataToSend.append("profile_picture", formData.profile_picture);
        
        console.log("Updating profile with FormData (includes image)");
        const updatedProfile = await usersAPI.updateProfile(formDataToSend);
        
        if (updatedProfile) {
          setProfile(previousState => ({
            ...previousState,
            ...updatedProfile,
            profile_picture: updatedProfile.profile_picture || previousState.profile_picture
          }));
          setIsEditing(false);
          setProfileImagePreview(null);
          setSuccess("Profile updated successfully!");
        } else {
          setError("Failed to update profile");
        }
      } else {
       
        console.log("Updating profile with JSON");
        const updatedProfile = await usersAPI.updateProfile(dataToSend);
        
        if (updatedProfile) {
          setProfile(updatedProfile);
          setIsEditing(false);
          setSuccess("Profile updated successfully!");
        } else {
          setError("Failed to update profile");
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = err.message || "An error occurred while updating the profile";
      setError(errorMessage);
    }
  }

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page-container">
        {error && <div className="error-message">{error}</div>}
        {!error && <div className="error-message">Cannot load profile</div>}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => {
              setError("");
              loadProfile();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      
      <div className="profile-header-instagram">
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            {profile.profile_picture ? (
              <img 
                src={profile.profile_picture.startsWith('http') 
                  ? profile.profile_picture 
                  : (profile.profile_picture.startsWith('/') ? profile.profile_picture : `/${profile.profile_picture}`)} 
                alt={profile.username}
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                <svg className="default-user-icon-large" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                  <path d="M12 14C7.58172 14 4 16.6863 4 20.2427C4 20.724 4.36879 21 4.8 21H19.2C19.6312 21 20 20.724 20 20.2427C20 16.6863 16.4183 14 12 14Z" fill="currentColor"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        
        <div className="profile-info-section">
          <div className="profile-username-row">
            <h1 className="profile-username">{profile.username}</h1>
          </div>

         
          {!isEditing && (
            <div className="profile-actions-frame-right">
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="create-post-header-btn"
              >
                + New Post
              </button>
              <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                Edit Profile
              </button>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-bio-form" encType="multipart/form-data">
              <div className="profile-picture-edit-section">
                <div className="profile-picture-edit-container">
                  <label htmlFor="profile-picture-input" className="profile-picture-preview-wrapper">
                    {profileImagePreview || profile.profile_picture ? (
                      <>
                        <img 
                          src={profileImagePreview || (profile.profile_picture?.startsWith('http') 
                            ? profile.profile_picture 
                            : (profile.profile_picture?.startsWith('/') ? profile.profile_picture : `/${profile.profile_picture}`))} 
                          alt="Profile preview" 
                          className="profile-picture-preview"
                          onError={(e) => {
                            console.error("Failed to load profile picture preview:", profileImagePreview || profile.profile_picture);
                          }}
                          onLoad={() => {
                            console.log("Successfully loaded profile picture preview");
                          }}
                        />
                        <div className="change-picture-overlay">
                          <div className="change-picture-icon">+</div>
                          <span className="change-picture-text-overlay">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="profile-picture-default">
                        <svg className="default-user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                          <path d="M12 14C7.58172 14 4 16.6863 4 20.2427C4 20.724 4.36879 21 4.8 21H19.2C19.6312 21 20 20.724 20 20.2427C20 16.6863 16.4183 14 12 14Z" fill="currentColor"/>
                        </svg>
                        <div className="change-picture-overlay">
                          <div className="change-picture-icon">+</div>
                          <span className="change-picture-text-overlay">Add</span>
                        </div>
                      </div>
                    )}
                  </label>
                  <input
                    type="file"
                    id="profile-picture-input"
                    name="profile_picture"
                    accept="image/*"
                    onChange={handleChange}
                    className="profile-picture-input"
                    style={{ display: "none" }}
                  />
                  {(profileImagePreview || profile.profile_picture) && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          
                          const dataToSend = new FormData();
                          dataToSend.append("bio", formData.bio || "");
                          dataToSend.append("profile_picture", ""); 
                          
                          const updatedProfile = await usersAPI.updateProfile(dataToSend);
                          
                          if (updatedProfile) {
                            
                            setFormData(previousState => ({ ...previousState, profile_picture: "" }));
                            setProfileImagePreview(null);
                            setProfile(previousState => ({
                              ...previousState,
                              profile_picture: null
                            }));
                            
                           
                            const input = document.getElementById('profile-picture-input');
                            if (input) {
                              input.value = '';
                            }
                          setSuccess("Picture removed successfully!");
                          setTimeout(() => setSuccess(""), 3000);
                        }
                      } catch (err) {
                        console.error("Error removing picture:", err);
                        setError(err.message || "An error occurred while removing the picture");
                        }
                      }}
                      className="remove-picture-btn"
                    >
                      Remove Picture
                    </button>
                  )}
                </div>
              </div>

            
              <div className="profile-bio-frame-edit">
                <label className="bio-label">Bio:</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                  rows="3"
                  className="bio-textarea"
                />
              </div>

              
              <div className="profile-fitness-frame-edit">
                <div className="fitness-fields-grid">
                  <div className="form-field-group">
                    <label htmlFor="goal">Goal:</label>
                    <select
                      id="goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="fitness-input"
                    >
                      <option value="">Select Goal</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Building">Muscle Building</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Weight Maintenance">Weight Maintenance</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="current_weight">Current Weight:</label>
                    <input
                      type="text"
                      id="current_weight"
                      name="current_weight"
                      value={formData.current_weight}
                      onChange={handleChange}
                      placeholder="Enter your current weight"
                      className="fitness-input"
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="target_weight">Target Weight:</label>
                    <input
                      type="text"
                      id="target_weight"
                      name="target_weight"
                      value={formData.target_weight}
                      onChange={handleChange}
                      placeholder="Enter your target weight"
                      className="fitness-input"
                    />
                  </div>
                </div>
              </div>

              <div className="edit-actions">
                <button type="submit" className="save-btn">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ 
                      bio: profile.bio || "", 
                      profile_picture: profile.profile_picture || "",
                      goal: profile.goal || "",
                      current_weight: profile.current_weight || "",
                      target_weight: profile.target_weight || "",
                    });
                    setProfileImagePreview(profile.profile_picture || null);
                    
                    const input = document.getElementById('profile-picture-input');
                    if (input) {
                      input.value = '';
                    }
                    setError("");
                    setSuccess("");
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
            
              <div className="profile-bio-frame">
                <div className="profile-bio-label">Bio</div>
                <div className="profile-bio">
                  {profile.bio || "No bio available"}
                </div>
              </div>

              <div className="profile-fitness-frame">
                <div className="profile-fitness-header">
                  <h3>My Fitness Info</h3>
                </div>
                
                <div className="profile-fitness-content">
                  <div className="fitness-field">
                    <label>Goal:</label>
                    <span className="fitness-value">
                      {profile.goal || "Not set"}
                    </span>
                  </div>
                  {(profile.current_weight || profile.target_weight) && (
                    <div className="weight-progress-section">
                      <div className="weight-info">
                        <div className="weight-item">
                          <label>Current Weight:</label>
                          <span className="weight-value">
                            {profile.current_weight || "Not set"}
                          </span>
                        </div>
                        <div className="weight-item">
                          <label>Target Weight:</label>
                          <span className="weight-value">
                            {profile.target_weight || "Not set"}
                          </span>
                        </div>
                      </div>

                      
                      {profile.current_weight && profile.target_weight && (() => {
                        const currentNum = parseFloat(String(profile.current_weight).replace(/[^\d.]/g, ''));
                        const targetNum = parseFloat(String(profile.target_weight).replace(/[^\d.]/g, ''));
                        const canCalculate = !isNaN(currentNum) && !isNaN(targetNum);
                        if (!canCalculate) return null;
                        const progress = calculateProgress(profile.current_weight, profile.target_weight, profile.goal);
                        
                        return (
                          <div className="progress-bar-container">
                            <div className="progress-bar-label">
                              <span>Progress</span>
                              <span className="progress-percentage">{progress}%</span>
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {!profile.current_weight && !profile.target_weight && (
                    <div className="no-fitness-data">
                      No fitness information set
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="posts-section">
        <div className="posts-tabs">
          <button 
            className={`posts-tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button 
            className={`posts-tab ${activeTab === "workouts" ? "active" : ""}`}
            onClick={() => setActiveTab("workouts")}
          >
            Workouts
          </button>
        </div>
        
        {activeTab === "posts" ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="post-thumbnail"
              onClick={() => handlePostClick(post)}
            >
              {(() => {
               
                let imageSrc = null;
                
               
                if (post.image_url) {
                  imageSrc = post.image_url;
                } else if (post.image) {
                
                  if (post.image.startsWith('http')) {
                    imageSrc = post.image;
                  } else {
                   
                    imageSrc = post.image.startsWith('/') ? post.image : `/${post.image}`;
                  }
                }
                
               
                if (!imageSrc && (post.image_url || post.image)) {
                  console.log('Post image data:', { image_url: post.image_url, image: post.image, post_id: post.id });
                }
                
                if (imageSrc) {
                  
                  const finalImageSrc = imageSrc.startsWith('http') 
                    ? imageSrc 
                    : (imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`);
                  
                  return (
                    <img 
                      src={finalImageSrc}
                      alt="Post" 
                      onError={(e) => {
                        console.error("Failed to load image:", finalImageSrc, "Original:", imageSrc, "Post ID:", post.id);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="post-placeholder"><span>📷</span></div>';
                      }}
                      onLoad={() => {
                        console.log("Successfully loaded image:", finalImageSrc, "Post ID:", post.id);
                      }}
                    />
                  );
                } else {
                  return (
                    <div className="post-placeholder">
                      <span>📷</span>
                    </div>
                  );
                }
              })()}
            </div>
            ))}
        </div>
        ) : (
        <div className="workout-plan-display">
          {profile.selected_workout_plan_detail ? (
            <div className="selected-workout-plan">
              <div className="workout-plan-header">
                <h2>{profile.selected_workout_plan_detail.title}</h2>
                <div className="workout-plan-header-right">
                  <span className="goal-badge">{getGoalTypeLabel(profile.selected_workout_plan_detail.goal_type)}</span>
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to remove this workout plan?")) {
                        try {
                          await usersAPI.updateProfile({ selected_workout_plan: "" });
                          setProfile(previousState => ({
                            ...previousState,
                            selected_workout_plan: null,
                            selected_workout_plan_detail: null
                          }));
                          setSuccess("Workout plan removed successfully");
                          setTimeout(() => setSuccess(""), 3000);
                        } catch (err) {
                          console.error("Error removing workout plan:", err);
                          setError(err.message || "An error occurred while removing the workout plan");
                        }
                      }
                    }}
                    className="remove-workout-plan-btn"
                    title="Remove Plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="workout-plan-info">
                <span className="duration">📅 {profile.selected_workout_plan_detail.duration} weeks</span>
              </div>
              {profile.selected_workout_plan_detail.description && (
                <div className="workout-plan-description">
                  <h3>Description:</h3>
                  <p>{profile.selected_workout_plan_detail.description}</p>
                </div>
              )}
              {profile.selected_workout_plan_detail.equipment_needed && (
                <div className="workout-plan-equipment">
                  <h3>Equipment Needed:</h3>
                  <p>{profile.selected_workout_plan_detail.equipment_needed}</p>
                </div>
              )}
              {profile.selected_workout_plan_detail.notes && (
                <div className="workout-plan-notes">
                  <h3>Detailed Plan and Tips:</h3>
                  <div className="notes-content">{profile.selected_workout_plan_detail.notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-workout-plan">
              <p>No workout plan selected yet</p>
              <p className="hint">Go to the Exercises page and choose a plan that suits you</p>
            </div>
          )}
        </div>
        )}
      </div>

      
      {showCreatePostModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCreatePostModal(false);
          setPostFormData({ content: "", workout_plan: "" });
          setError("");
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Post</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowCreatePostModal(false);
                  setPostFormData({ content: "", workout_plan: "", image: null });
                  setImagePreview(null);
                  setError("");
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePostSubmit} encType="multipart/form-data">
              
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setPostFormData({ ...postFormData, image: null });
                      setImagePreview(null);
                    }}
                    className="remove-image-btn"
                    title="Remove Image"
                    aria-label="Remove Image"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="post-image">Add Image (optional):</label>
                <input
                  type="file"
                  id="post-image"
                  name="image"
                  accept="image/*"
                  onChange={handlePostFormChange}
                  className="file-input"
                />
              </div>

              <div className="form-group">
                <textarea
                  name="content"
                  value={postFormData.content}
                  onChange={handlePostFormChange}
                  placeholder="What do you want to share?"
                  rows="6"
                  required
                  className="post-textarea"
                />
              </div>
              <div className="form-group">
                <label>Link to Workout Plan (optional):</label>
                <input
                  type="number"
                  name="workout_plan"
                  value={postFormData.workout_plan}
                  onChange={handlePostFormChange}
                  placeholder="Workout plan ID"
                  className="post-input"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePostModal(false);
                    setPostFormData({ content: "", workout_plan: "" });
                    setError("");
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPostDetailModal && selectedPost && (
        <div className="modal-overlay" onClick={() => {
          setShowPostDetailModal(false);
          setSelectedPost(null);
          setPostComments([]);
          setCommentText("");
        }}>
          <div className="modal-content post-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post</h2>
              <div className="modal-header-actions">
                {profile && selectedPost && selectedPost.user === profile.user_id && (
                  <button
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="delete-post-modal-btn"
                    title="Delete Post"
                  >
                    🗑️
                  </button>
                )}
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowPostDetailModal(false);
                    setSelectedPost(null);
                    setPostComments([]);
                    setCommentText("");
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="post-detail-content">
              
              {(() => {
               
                let imageSrc = null;
                
                if (selectedPost.image_url) {
                  imageSrc = selectedPost.image_url;
                } else if (selectedPost.image) {
                  
                  if (selectedPost.image.startsWith('http')) {
                    imageSrc = selectedPost.image;
                  } else {
                    
                    imageSrc = selectedPost.image.startsWith('/') ? selectedPost.image : `/${selectedPost.image}`;
                  }
                }
                
                if (imageSrc) {
                 
                  const finalImageSrc = imageSrc.startsWith('http') 
                    ? imageSrc 
                    : (imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`);
                  
                  return (
                    <div className="post-detail-image">
                      <img 
                        src={finalImageSrc}
                        alt="Post" 
                        onClick={() => setSelectedImage(finalImageSrc)}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          console.error("Failed to load image in modal:", finalImageSrc, "Original:", imageSrc);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log("Successfully loaded image in modal:", finalImageSrc);
                        }}
                      />
                    </div>
                  );
                }
                return null;
              })()}

              
              <div className="post-detail-text">
                <div className="post-detail-user">
                  {selectedPost.user_profile_picture ? (
                    <img 
                      src={selectedPost.user_profile_picture.startsWith('http') 
                        ? selectedPost.user_profile_picture 
                        : (selectedPost.user_profile_picture.startsWith('/') ? selectedPost.user_profile_picture : `/${selectedPost.user_profile_picture}`)} 
                      alt={selectedPost.user_username}
                      className="user-avatar-small-image"
                      onError={(e) => {
                        console.error("Failed to load profile picture in modal:", selectedPost.user_profile_picture);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="user-avatar-small">
                      {selectedPost.user_username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="username">{selectedPost.user_username}</span>
                </div>
                <p className="post-content-full">{selectedPost.content}</p>
                <div className="post-date-small">
                  {new Date(selectedPost.created_at).toLocaleDateString("ar-SA", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Comments section */}
              <div className="post-detail-comments-section">
                <h3>Comments ({postComments.length})</h3>
                
                {/* Comments list */}
                <div className="post-detail-comments-list">
                  {loadingComments ? (
                    <div className="loading-comments">Loading comments...</div>
                  ) : postComments.length > 0 ? (
                    postComments.map((comment) => (
                      <div key={comment.id} className="comment-item-detail">
                        <div className="comment-content-detail">
                          <span className="comment-author-detail">{comment.user_username}:</span>
                          <span className="comment-text-detail">{comment.content}</span>
                        </div>
                          {profile && (comment.user === profile.user_id || selectedPost.user === profile.user_id) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id, selectedPost.id)}
                            className="delete-comment-btn"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-comments">No comments yet</div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddComment(selectedPost.id);
                  }}
                  className="add-comment-form-detail"
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="comment-input-detail"
                  />
                  <button type="submit" className="comment-submit-btn-detail">
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div 
          className="image-modal-overlay" 
          onClick={() => setSelectedImage(null)}
        >
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <img 
              src={selectedImage.startsWith('http') 
                ? selectedImage 
                : (selectedImage.startsWith('/') ? selectedImage : `/${selectedImage}`)} 
              alt="Full size" 
              className="image-modal-image"
              onError={(e) => {
                console.error("Failed to load full size image:", selectedImage);
              }}
            />
          </div>
        </div>
      )}

      {/* Celebration Modal - Shows when progress reaches 100% */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-emoji">🎉</div>
            <h2 className="celebration-title">Congratulations!</h2>
            <p className="celebration-message">You've reached your goal! 🎊</p>
            <p className="celebration-submessage">You're amazing! Keep up the great work!</p>
            <button 
              className="celebration-close-btn"
              onClick={() => setShowCelebration(false)}
            >
              Awesome!
            </button>
          </div>
          
          <div className="confetti confetti-1">🎉</div>
          <div className="confetti confetti-2">🎊</div>
          <div className="confetti confetti-3">⭐</div>
          <div className="confetti confetti-4">🎈</div>
          <div className="confetti confetti-5">🎉</div>
          <div className="confetti confetti-6">🎊</div>
          <div className="confetti confetti-7">⭐</div>
          <div className="confetti confetti-8">🎈</div>
        </div>
      )}
    </div>
  );
}
