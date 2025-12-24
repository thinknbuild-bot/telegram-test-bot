import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;

const HF_MODEL =
  "https://api-inference.huggingface.co/models/google/flan-t5-small";


// ⏱ timeout helper
function fetchWithTimeout(url, options, timeout = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), timeout)
    )
  ]);
}

async function askAI(prompt) {
  try {
    const res = await fetchWithTimeout(
      HF_MODEL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `Reply briefly and clearly:\n${prompt}`
        })
      },
      8000
    );

    const data = await res.json();

    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.split("\n").slice(-1)[0].trim();
    }

    throw new Error("Empty AI response");
  } catch (err) {
    console.error("⚠️ AI failed:", err.message);
    return null;
  }
}

// Telegram webhook on ROOT
app.post("/", async (req, res) => {
  console.log("📩 Update received");

  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = (message.text || "").trim();
  const lower = text.toLowerCase();

  let reply;

  // 🔴 Call intent ALWAYS wins
  if (lower.includes("call")) {
    reply = "📞 Call request received (simulation only)";
  } else {
    // 🤖 Try AI
    const aiReply = await askAI(text);
    reply = aiReply || "🤖 I’m here! Please try again in a moment.";
  }

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    const tgData = await tgRes.json();
    console.log("📤 Telegram response:", tgData);
  } catch (err) {
    console.error("❌ Telegram send failed:", err);
  }

  res.sendStatus(200);
});

// Browser check
app.get("/", (req, res) => {
  res.send("Telegram AI bot running safely");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server started"));
