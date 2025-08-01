# 🌐 Environment Variable Setup
This section covers the essential environment variables required for the project to run successfully. Please make sure to add these in your `.env` files.

---

## Backend Environment Variables

### `MONGODB_URL`
- **What it is:** The connection string to your MongoDB database.
- **Where to set:** `backend/.env`

#### 🔧 How to Get It:
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a cluster (or use an existing one).
- Under your cluster, click **Connect** → **Connect Your Application**.
- Copy the connection string like:
  ```
  mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
  ```
- Replace `<username>`, `<password>`, and `<dbname>` accordingly.

#### 📝 Example:
```env
MONGODB_URL=mongodb+srv://myuser:mypassword@cluster0.mongodb.net/mydb
```

### `GEMINI_API_KEY`
- **What it is:** API key from [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey) used for chatbot responses.
- **Where to set:** `backend/.env`

#### 🔧 How to Get It:
- Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Generate an API key (sign in with a Google account if required)
- Copy and paste it into your `.env` file.

#### 📝 Example:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Frontend Environment Variables

### `NEXT_PUBLIC_BACKEND_URL`
- **What it is:** Public URL of your backend server, used by the frontend to make API requests.
- **Where to set:** `frontend/.env`

#### 🔧 How to Set:
- If running on default port:  
  ```env
  NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
  ```
- If running on another port:  
  ```env
  NEXT_PUBLIC_BACKEND_URL=http://localhost:PORT_NUMBER
  ```
- If deployed (e.g., on Vercel, Railway, etc.):  
  ```env
  NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
  ```

> ℹ️ Make sure the backend is accessible from the frontend environment.

---

✅ **Don't forget** to restart your dev server after updating `.env` files!

⚠️ **Warning:** Always keep `.env` files private and do not expose them in version control systems like GitHub.

---

### Happy Coding! 💻✨