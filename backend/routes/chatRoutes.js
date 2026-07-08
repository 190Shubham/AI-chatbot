import express from "express";
import { chatWithAI, getChats, getChatById } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getChats);
router.get("/:chatId", protect, getChatById);
router.post("/send", protect, chatWithAI);

export default router;
