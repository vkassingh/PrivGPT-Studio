# 🚀 PrivGPT Studio

**Your private AI studio — versatile, secure, and all‑in‑one.**

---

## 🎥 Demo

💻 **Screen Recording Demo:**

> [![Pitch Video](https://img.youtube.com/vi/OoHNVjYpup8/1.jpg)](https://youtu.be/OoHNVjYpup8)

---

## 💡 Why It’s Needed

AI tools are everywhere — but most send your data to cloud servers you can’t control.  
**Startups, researchers, and creators need AI that’s private, flexible, and powerful.**

👉 **PrivGPT Studio solves this by combining local and cloud models in one workspace, with:**  
✅ Full privacy control (no hidden history sharing)  
✅ Versatile input (text, PDF, images, voice)  
✅ Offline fallback, multi‑chat management, latency tracking

**AI without compromise.**

---

## ✨ Overview

PrivGPT Studio is a **privacy‑first AI workspace** where you can:  
✅ Run **local models** and **cloud models** side by side  
✅ Keep each chat **independent**, but reference others when needed  
✅ Upload **PDFs, images, videos, and audio** for analysis  
✅ Use **voice input** with built‑in transcription  
✅ **Rename, export, clear, delete** chats easily  
✅ **Track latency** and switch models on the fly  
✅ Even **work offline** by falling back to a local model automatically

---

## 🔧 Tech Stack

**Frontend:** Next.js (React), TailwindCSS  
**Backend:** Flask (Python)  
**Database:** MongoDB  
**AI:**

- **Local:** Ollama models
- **Cloud:** Gemini API

---

## 📦 Features

- 🧠 Multi‑chat with cross‑references
- 🔒 Privacy‑first design (local/cloud separation)
- 📄 PDF summarization, 📊 image/graph interpretation, 🎤 voice input
- ✨ Rename, export, delete sessions
- ⚡ Offline fallback to local models
- 📈 Latency count and metrics

---

## 🖥️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/privgpt-studio.git
cd privgpt-studio
```

### 2️. Set up the client (Next.js frontend)

```bash
cd client
npm ci
npm run dev
# Runs on http://localhost:3000
```

👉 **Client `.env.local` example:**

```ini
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

### 3️. Set up the server (Flask backend)

```bash
cd server
python -m venv venv
# On Linux/Mac
source venv/bin/activate
# On Windows
venv\Scripts\activate

pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

👉 **Server `.env` example:**

```ini
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_connection
```

---

### 4️. (Optional) Start Ollama locally

```bash
ollama serve
ollama pull <model_name>
```

---

## 📂 Project Structure

```bash
privgpt-studio/
│
├── client/          # Next.js frontend
│   ├── components/
│   ├── app/
│   └── ...
│
├── server/          # Flask backend
│   ├── app.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

© 2025 Rucha Ambaliya. All rights reserved.
