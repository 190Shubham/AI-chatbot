# AI Chatbot 🤖

An AI-powered chatbot built with the MERN stack and React that allows users to chat with an AI assistant.

## Features

- 🔐 User Authentication (Login & Register)
- 💬 AI Chat Interface
- 🌙 Dark/Light Theme
- 📁 File Upload Support
- 🎤 Voice Input
- 📷 Camera Support
- 📱 Responsive Design

## Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### AI
- Groq API

## Installation

### Clone the repository

```bash
git clone https://github.com/190Shubham/AI-chatbot.git
```

### Install dependencies

```bash
npm install
```

Install backend dependencies

```bash
cd backend
npm install
```

Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file inside the `backend` folder and add:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

### Run the project

Backend

```bash
cd backend
npm start
```

Frontend

```bash
cd frontend
npm start
```

## Project Structure

```
AI-chatbot/
│
├── backend/
├── frontend/
├── package.json
└── README.md
```

## Author

**Shubham Kumar**