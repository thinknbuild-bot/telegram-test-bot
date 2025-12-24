import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;

// Hugging Face model (good free model)
const HF_MODEL =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

async function askAI(prompt) {
  const response = await fetch(HF_MODEL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: `Answer clearly and politely:\n${prompt}`
    })
  });

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text.replace(prompt, "").trim();
  }

  return "🤖 AI is thinking… please try again.";
}

app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text || "";

  let reply = "✅ Bot is working";

  // Call intent detection
  if (text.toLowerCase().includes("call")) {
    reply = "📞 Call request received (simulation only)";
  } else {
    // AI reply
    reply = await askAI(text);
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
  res.send("Telegram AI bot running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));
