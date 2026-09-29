# 🎬 Agasobanuye Fast

Agasobanuye Fast is a movie website built with:

* HTML
* CSS
* JavaScript
* Node.js
* Express
* MongoDB

The application provides a public movie website and a protected administration dashboard.

---

## 📁 Project Structure

```text
Agasobanuye-Fast/
│
├── frontend/
│   ├── index.html
│   ├── watch.html
│   ├── admin.html
│   ├── style.css
│   └── app.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Category.js
│   │   └── View.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── categories.js
│   │   └── analytics.js
│   │
│   └── middleware/
│       └── auth.js
│
├── uploads/
│   ├── movies/
│   └── covers/
│
└── README.md
```

---

# ⚙️ Requirements

Install:

1. Node.js
2. MongoDB Community Server
3. A modern web browser

---

# 📦 Install Dependencies

Open Command Prompt inside:

```text
Agasobanuye-Fast/backend
```

Run:

```cmd
npm install
```

---

# 🗄️ MongoDB

The default database is:

```text
agasobanuye_fast
```

The default local connection is:

```text
mongodb://127.0.0.1:27017/agasobanuye_fast
```

Make sure MongoDB is running before starting the application.

---

# 🔐 Environment Variables

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/agasobanuye_fast

JWT_SECRET=replace_this_with_a_long_random_secret

ADMIN_USERNAME=admin

ADMIN_PASSWORD=change_this_password
```

Use a strong password when deploying the website publicly.

---

# ▶️ Start the Server

Inside the backend folder:

```cmd
npm start
```

The website should run at:

```text
http://localhost:5000
```

The administration dashboard is:

```text
http://localhost:5000/admin.html
```

---

# 🎬 Movie Upload

The administrator can upload:

* Movie video file
* Movie cover
* Movie title
* Year
* Category
* Language
* Entertainers
* Description

Uploaded movie files are stored in:

```text
uploads/movies/
```

Movie covers are stored in:

```text
uploads/covers/
```

---

# 👁️ Analytics

Agasobanuye Fast records:

* Movie views
* Visitor IDs
* Downloads
* Number of movies
* Number of categories
* Most-watched movies

The administration dashboard displays these statistics.

A visitor is assigned a browser-based visitor ID. The server prevents repeated views from the same visitor ID from being counted repeatedly within a short period.

---

# 🔐 Admin Authentication

The admin dashboard uses JWT authentication.

The login endpoint is:

```text
POST /api/auth/login
```

The admin token is stored in the browser and sent to protected API endpoints.

Protected operations include:

* Uploading movies
* Deleting movies
* Creating categories
* Deleting categories
* Viewing analytics

---

# 🌐 API Endpoints

## Authentication

```text
POST /api/auth/login
```

## Movies

```text
GET /api/movies

GET /api/movies/:id

POST /api/movies

DELETE /api/movies/:id

POST /api/movies/:id/view

POST /api/movies/:id/download
```

## Categories

```text
GET /api/categories

POST /api/categories

DELETE /api/categories/:id
```

## Analytics

```text
GET /api/analytics
```

---

# 🛠️ Development Mode

Install nodemon:

```cmd
npm install --save-dev nodemon
```

Then run:

```cmd
npm run dev
```

---

# ⚠️ Production Notes

Before publishing the website:

1. Change the admin password.
2. Change the JWT secret.
3. Do not publish the `.env` file.
4. Use HTTPS.
5. Use secure production storage for large video files.
6. Configure MongoDB securely.
7. Add rate limiting to authentication.
8. Validate uploaded file types.
9. Set appropriate upload size limits.
10. Only upload and distribute movies you have permission to use.

---

# 🚀 Future Features

Possible future improvements:

* Movie editing
* User accounts
* Favorites
* Watch history
* Continue watching
* Daily analytics
* Weekly analytics
* Monthly analytics
* Analytics charts
* Comments
* Ratings
* Better download management
* Upload progress
* Multiple video qualities
* Subtitles
* Dark/light themes
* Mobile navigation
* Pagination
* Featured movies
* Recently watched movies

---

## Agasobanuye Fast

Built for managing and watching authorized movie content through a simple web interface.

```
```
