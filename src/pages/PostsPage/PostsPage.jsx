// IMPORTS
import "./styles.css";
import { useState, useEffect } from "react";
import * as postsAPI from "../../utilities/posts-api";
import * as commentsAPI from "../../utilities/comments-api";
import * as usersAPI from "../../utilities/users-api";
import getToken from "../../utilities/getToken";
import fitLifeLogo from "../../assets/ChatGPT_Image_Nov_3__2025_at_11_26_28_PM-removebg-preview.png";

export default function PostsPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null); 
  const [expandedPosts, setExpandedPosts] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [commentForms, setCommentForms] = useState({}); 
  const [loadingComments, setLoadingComments] = useState({}); 
  const [selectedImage, setSelectedImage] = useState(null); 

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const profile = await usersAPI.getProfile();
        if (profile && profile.user_id) {
          
          setCurrentUser({ id: profile.user_id, username: profile.username });
        }
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    }
    
    if (getToken()) {
      loadCurrentUser();
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const allPosts = await postsAPI.getPosts();
      setPosts(allPosts || []);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId) {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        
        await postsAPI.deletePost(postId);
        
        setPosts(previousPosts => {
          const filtered = previousPosts.filter(post => post.id !== postId);
          console.log(`Deleted post ${postId}. Posts: ${previousPosts.length} -> ${filtered.length}`);
          return filtered;
        });
        
        setComments(previousComments => {
          const newComments = { ...previousComments };
          delete newComments[postId];
          return newComments;
        });
        
        setExpandedPosts(previousState => {
          const newExpanded = { ...previousState };
          delete newExpanded[postId];
          return newExpanded;
        });
      } catch (err) {
        console.error("Error deleting post:", err);
        setError(err.message || "An error occurred while deleting the post");
      }
    }
  }

  async function loadComments(postId) {
    try {
      setLoadingComments(previousState => ({ ...previousState, [postId]: true }));
      const postComments = await commentsAPI.getPostComments(postId);
      setComments(previousState => ({ ...previousState, [postId]: postComments }));
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setLoadingComments(previousState => ({ ...previousState, [postId]: false }));
    }
  }

  function toggleComments(postId) {
    console.log("Toggle comments for post:", postId);
    setExpandedPosts(previousState => {
      const isExpanded = previousState[postId];
      const newExpanded = !isExpanded;
      
      console.log("Post expanded state:", isExpanded, "->", newExpanded);
      
      if (newExpanded) {
        setComments(currentComments => {
          if (!currentComments[postId]) {
            console.log("Loading comments for post:", postId);
            loadComments(postId);
          }
          return currentComments;
        });
      }
      
      return { ...previousState, [postId]: newExpanded };
    });
  }

  function handleCommentChange(postId, value) {
    setCommentForms(previousState => ({ ...previousState, [postId]: value }));
  }

  async function handleCommentSubmit(postId, evt) {
    try {
      evt.preventDefault();
      const commentText = commentForms[postId] || "";
      
      if (!commentText.trim()) {
        return;
      }

      const newComment = await commentsAPI.createComment(postId, commentText);
      setCommentForms(previousState => ({ ...previousState, [postId]: "" }));
      
      
      if (newComment) {
        setComments(previousComments => {
          const postComments = previousComments[postId] || [];
          return {
            ...previousComments,
            [postId]: [newComment, ...postComments]
          };
        });
       
        setPosts(previousPosts => previousPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments_count: (post.comments_count || 0) + 1
            };
          }
          return post;
        }));
      }
    } catch (err) {
      setError(err.message || "An error occurred while adding the comment");
    }
  }

  async function handleDeleteComment(commentId, postId) {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        
        await commentsAPI.deleteComment(commentId);
        
        
        setComments(previousComments => {
          const postComments = previousComments[postId] || [];
          const filtered = postComments.filter(comment => comment.id !== commentId);
          console.log(`Deleted comment ${commentId} from post ${postId}. Comments: ${postComments.length} -> ${filtered.length}`);
          return {
            ...previousComments,
            [postId]: filtered
          };
        });
        
        
        setPosts(previousPosts => {
          return previousPosts.map(post => {
            if (post.id === postId) {
              const newCount = Math.max(0, (post.comments_count || 0) - 1);
              return {
                ...post,
                comments_count: newCount
              };
            }
            return post;
          });
        });
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError(err.message || "An error occurred while deleting the comment");
      }
    }
  }

  if (loading) {
    return (
      <div className="posts-page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="posts-page-container">
      {/* Logo at the top */}
      <div className="posts-logo">
        <img src={fitLifeLogo} alt="FitLife" className="logo-image" />
      </div>

      {/* Header */}
      <div className="posts-header">
        <h1>Posts</h1>
        <p className="posts-subtitle">All user posts</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts yet. Be the first to post! 🎉</p>
        </div>
      ) : (
        <div className="posts-feed">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-user-info">
                  {post.user_profile_picture ? (
                    <img 
                      src={post.user_profile_picture.startsWith('http') 
                        ? post.user_profile_picture 
                        : (post.user_profile_picture.startsWith('/') ? post.user_profile_picture : `/${post.user_profile_picture}`)} 
                      alt={post.user_username}
                      className="user-avatar-image"
                      onError={(e) => {
                        console.error("Failed to load profile picture:", post.user_profile_picture);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log("Successfully loaded profile picture:", post.user_profile_picture);
                      }}
                    />
                  ) : (
                    <div className="user-avatar">
                      {post.user_username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="username">{post.user_username}</span>
                </div>
              </div>

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
                    <div className="post-image" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(finalImageSrc);
                    }} style={{ cursor: 'pointer' }}>
                      <img 
                        src={finalImageSrc}
                        alt="Post" 
                        onError={(e) => {
                          console.error("Failed to load image:", finalImageSrc, "Original:", imageSrc, "Post ID:", post.id);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log("Successfully loaded image:", finalImageSrc, "Post ID:", post.id);
                        }}
                      />
                    </div>
                  );
                }
                return null;
              })()}

              <div className="post-content">
                <p>{post.content}</p>
              </div>

              {post.workout_plan && (
                <div className="post-workout-link">
                  <span>💪 Linked to workout plan #{post.workout_plan}</span>
                </div>
              )}

              <div className="post-footer">
                <span className="post-date">
                  {new Date(post.created_at).toLocaleDateString("ar-SA")}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleComments(post.id);
                  }}
                  className="view-comments-btn"
                  type="button"
                >
                  💬 {post.comments_count || 0} comments
                </button>
              </div>

              {/* Comments section */}
              {expandedPosts[post.id] && (
                <div className="comments-section">
                  {/* Form for adding new comment */}
                  <form
                    onSubmit={(e) => handleCommentSubmit(post.id, e)}
                    className="add-comment-form"
                  >
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentForms[post.id] || ""}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      className="comment-input"
                    />
                    <button type="submit" className="comment-submit-btn">
                      Post
                    </button>
                  </form>

                  {/* Comments list */}
                  {loadingComments[post.id] ? (
                    <div className="loading-comments">Loading comments...</div>
                  ) : (
                    <div className="comments-list">
                      {comments[post.id] && Array.isArray(comments[post.id]) && comments[post.id].length > 0 ? (
                        comments[post.id].map((comment) => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-content">
                              <span className="comment-author">{comment.user_username}:</span>
                              <span className="comment-text">{comment.content}</span>
                            </div>
                            {(currentUser || user) && (
                              (comment.user === (currentUser?.id || user?.id) || 
                               post.user === (currentUser?.id || user?.id))
                            ) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="delete-comment-btn"
                                title="Delete Comment"
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
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full Image Modal */}
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
    </div>
  );
}

