import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

// Telegram will hit ROOT "/"
app.post("/", async (req, res) => {
  console.log("📩 Update received");

  const message = req.body.message;
  if (!message) {
    return res.sendStatus(200);
  }

  const chatId = message.chat.id;
  const text = (message.text || "").toLowerCase();

  let reply = "🤖 Bot is alive";

  if (text.includes("call")) {
    reply = "📞 Call request received (simulation only)";
  } else if (text.includes("hi") || text.includes("hello")) {
    reply = "👋 Hi! Bot is working fine.";
  } else {
    reply = "✅ Message received.";
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply
    })
  });

  res.sendStatus(200);
});

// Optional GET for browser check
app.get("/", (req, res) => {
  res.send("Telegram bot root endpoint active");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server started on root /"));
