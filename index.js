import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text || "";

  let reply = "✅ Bot is working";

  if (text.toLowerCase().includes("call")) {
    reply = "📞 Call request received (simulation only)";
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

app.get("/", (req, res) => {
  res.send("Telegram bot server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));
