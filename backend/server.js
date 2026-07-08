import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL, // ✅ Better than allowing all
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI) // ✅ Fixed
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Error:', err.message));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); // ✅ Add this

app.get('/', (req, res) => {
  res.json({ message: 'AI Chatbot Backend Running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));