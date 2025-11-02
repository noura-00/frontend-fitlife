# FitLife - Frontend

## Project Overview

**FitLife Frontend** is a modern React application that provides a beautiful and interactive user interface for the FitLife fitness application. It features a contemporary UI with responsive design and smooth user experience.

---

## Technologies Used

- **React 19.1.1**
- **React Router DOM 7.9.4** (for page navigation)
- **Vite 7.1.7** (build tool and development server)
- **CSS3** (for styling and design)
- **ESLint** (for code quality)

---

## Project Structure

```
frontend-fitlife/
│
├── public/                     # Public files
│   ├── videos/                # Video files
│   └── vite.svg               # Vite icon
│
├── src/                        # Source code
│   ├── assets/                # Static assets
│   │   ├── fitlife.png        # Application logo
│   │   └── react.svg
│   │
│   ├── components/            # Reusable components
│   │   ├── BottomNav/         # Bottom navigation bar
│   │   │   ├── BottomNav.jsx
│   │   │   └── styles.css
│   │   └── NavBar/            # Top navigation bar
│   │       ├── NavBar.jsx
│   │       └── styles.css
│   │
│   ├── pages/                 # Application pages
│   │   ├── HomePage/          # Home page (login/signup)
│   │   │   ├── HomePage.jsx
│   │   │   └── styles.css
│   │   ├── SignupPage/        # Detailed signup page
│   │   │   ├── SignupPage.jsx
│   │   │   └── styles.css
│   │   ├── PostsPage/         # Posts page
│   │   │   ├── PostsPage.jsx
│   │   │   └── styles.css
│   │   ├── ProfilePage/       # Profile page
│   │   │   ├── ProfilePage.jsx
│   │   │   └── styles.css
│   │   ├── ExercisesPage/     # Exercises page
│   │   │   ├── ExercisesPage.jsx
│   │   │   └── styles.css
│   │   └── DashboardPage/     # Dashboard
│   │       ├── DashboardPage.jsx
│   │       └── styles.css
│   │
│   ├── utilities/             # Helper utilities
│   │   ├── users-api.js       # Users API
│   │   ├── posts-api.js       # Posts API
│   │   ├── workouts-api.js    # Workouts API
│   │   ├── comments-api.js    # Comments API
│   │   ├── sendRequest.js     # Request sending function
│   │   └── getToken.js        # Token retrieval function
│   │
│   ├── App.jsx                # Main application component
│   ├── App.css                # General styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
│
├── index.html                 # Main HTML file
├── package.json               # Dependencies file
├── vite.config.js             # Vite configuration
├── eslint.config.js           # ESLint configuration
└── README.md                   # This file
```

---

## Main Features

### 1. Home Page (HomePage)
- **Video Background**: Automatic background video
- **Logo and Tagline**: FitLife logo with motivational tagline
- **Login/Signup Forms**: Transparent and elegant forms
- **Responsive Design**: Works perfectly on all devices

### 2. Posts Page (PostsPage)
- Display all user posts
- Support for images in posts
- Display user information with each post

### 3. Profile Page (ProfilePage)
- Display user information
- Display user posts
- Ability to update profile
- Display profile picture

### 4. Exercises Page (ExercisesPage)
- Display available workout plans
- Filter by goal type (Cut, Bulk, Maintain, Home)
- Details for each workout plan

### 5. Bottom Navigation Bar (BottomNav)
- Easy navigation between main pages
- Elegant and compact design
- Visual indicator for active page

---

## Pages and Routes

- `/` - Home page (login/signup)
- `/signup` - Detailed signup page
- `/posts` - Posts page
- `/profile` - Profile page
- `/exercises` - Exercises page
- `/dashboard` - Dashboard

---

## Setup Instructions

### 1. Install Node.js
Make sure Node.js (version 16 or later) is installed:
```bash
node --version
npm --version
```

### 2. Install Dependencies
```bash
# Navigate to project directory
cd frontend-fitlife

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The application will run on `http://localhost:5174` or `http://127.0.0.1:5174`

### 4. Build for Production
```bash
npm run build
```

A `dist` folder will be created containing the built files.

### 5. Preview Production Build
```bash
npm run preview
```

---

## API Configuration

The application is connected to the backend API at:
```
http://127.0.0.1:8000
```

You can modify the API URL in the `utilities/*-api.js` files:
- `utilities/users-api.js`
- `utilities/posts-api.js`
- `utilities/workouts-api.js`
- `utilities/comments-api.js`

---

## Authentication

The application uses **JWT (JSON Web Tokens)** for authentication:
- Token is stored in `localStorage`
- Token is sent with every API request in the `Authorization` header
- Upon logout, the token is removed

### Main API Functions

#### users-api.js
- `signup(userData)` - Create new account
- `login(credentials)` - Login
- `logout()` - Logout
- `getProfile()` - Get user profile
- `updateProfile(profileData)` - Update user profile

#### posts-api.js
- `getAllPosts()` - Get all posts
- `getPost(id)` - Get specific post
- `createPost(postData)` - Create new post
- `updatePost(id, postData)` - Update post
- `deletePost(id)` - Delete post
- `getUserPosts(userId)` - Get user posts

#### workouts-api.js
- `getAllWorkouts()` - Get all workout plans
- `getWorkout(id)` - Get specific workout plan

#### comments-api.js
- `getComments(postId)` - Get post comments
- `createComment(postId, content)` - Add new comment

---

## Design and Styling

### Main Colors
- **Orange**: `#f97316` - Primary color
- **Yellow**: `#fbbf24` - Secondary color
- **White**: `#ffffff` - Text and backgrounds
- **Light Gray**: `#f9f9f9` - Backgrounds

### Fonts
- Uses system default fonts
- Responsive font sizes

### Responsive Design
- All pages are responsive and work on:
  - Mobile devices (320px+)
  - Tablets (768px+)
  - Desktops (1024px+)

---

## Special Features

### 1. Image Handling
- Support for image uploads for posts and profiles
- Image loading error handling
- Display placeholder when image fails to load

### 2. Video Background
- Automatic video playback on home page
- Automatic looping
- Performance optimization

### 3. Navigation
- Elegant bottom navigation bar
- Smooth navigation between pages
- User state persistence

---

## Available Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Common Issues

### Issue: CORS Policy Error
**Solution**: Make sure the backend allows requests from `http://localhost:5174`

### Issue: Images Not Showing
**Solution**: 
1. Make sure the backend is serving media files
2. Check the image URL in the browser console
3. Verify the image is linked correctly

### Issue: Login Not Working
**Solution**:
1. Verify the backend is running on `http://127.0.0.1:8000`
2. Check the API URL in `utilities/users-api.js`
3. Open browser Console to check for errors

### Issue: Video Not Showing
**Solution**: 
1. Make sure the video file exists in `public/videos/`
2. Check the path in `HomePage.jsx`

---

## Future Development

- [ ] Add likes system
- [ ] Add follow system
- [ ] Add notifications
- [ ] Add search functionality
- [ ] Performance improvements
- [ ] Add PWA support

---

## Contributing

1. Fork the project
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is open source and available for use.

---

## Contact

For help or inquiries, please open an issue in the repository.
