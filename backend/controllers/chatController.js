import OpenAI from "openai";
import Chat from "../models/Chat.js";

const getClient = () =>
  new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

const isImageRequest = (message) => {
  const msg = message.toLowerCase();
  return (
    msg.includes("image") ||
    msg.includes("picture") ||
    msg.includes("photo") ||
    msg.includes("draw") ||
    msg.includes("generate") ||
    msg.includes("/imagine")
  );
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title createdAt updatedAt");
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user._id,
    });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    console.log("Message received:", message);
    console.log("Is image request:", isImageRequest(message));

    let reply = "";
    let imageUrl = null;

    if (isImageRequest(message)) {
      const searchQuery = message
        .toLowerCase()
        .replace(
          /send me|sand me|generate|create|show me|give me|image|picture|photo|draw|of|a |an |the /gi,
          ""
        )
        .trim()
        .replace(/\s+/g, ",");

      const seed = Math.floor(Math.random() * 9999);
      imageUrl = `https://loremflickr.com/768/768/${searchQuery}?lock=${seed}`;
      reply = "Here is your image!";
    } else {
      const client = getClient();
      const completion = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: message }],
        max_tokens: 1024,
        temperature: 0.7,
      });
      reply = completion.choices[0]?.message?.content;
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOneAndUpdate(
        { _id: chatId, user: req.user._id },
        {
          $push: {
            messages: [
              { role: "user", content: message },
              { role: "assistant", content: reply, imageUrl },
            ],
          },
        },
        { new: true }
      );
    } else {
      chat = await Chat.create({
        user: req.user._id,
        title: message.slice(0, 50),
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: reply, imageUrl },
        ],
      });
    }

    res.json({ reply, imageUrl, chatId: chat._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI response failed" });
  }
};