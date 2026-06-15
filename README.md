
## 📌 Setup Instructions

### Prerequisites
Make sure you have the following installed:
- Node.js (v20.x or above)
- npm (comes with Node.js)
- Git
- MongoDB Atlas account (free tier)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
BASE_URL=http://localhost:5000
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App
Frontend: http://localhost:5173

Backend:  http://localhost:5000
---

## 💡 Assumptions Made

1. Each user can only see and manage their own shortened URLs — no shared access between users.
2. Short codes are randomly generated using `nanoid` (6 characters) unless a custom alias is provided.
3. Custom aliases must be unique across all users.
4. Analytics are tracked per click — device type, browser, IP address, and timestamp are recorded automatically.
5. Expired URLs (past expiry date) will not redirect — they return an error message instead.
6. Passwords are hashed using `bcryptjs` before storing in the database — plain text passwords are never stored.
7. JWT tokens expire after 7 days — users need to log in again after that.
8. The app is designed for desktop and mobile browsers — no native mobile app.
9. MongoDB Atlas free tier (M0) is used as the database — no local MongoDB installation required.
10. No email verification is required during signup


Architecture:
 [url_shortener_architecture_document.pdf](https://github.com/user-attachments/files/28947632/url_shortener_architecture_document.pdf)
