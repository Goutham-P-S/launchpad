import axios from "axios";

export async function llamaChat(options: {
  system: string;
  user: string;
  temperature?: number;
  format?: string;
}) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      console.log(`Attempting completion via Gemini 2.5 Pro...`);
      const geminiConfig: any = {
        temperature: options.temperature ?? 0.2,
      };

      if (options.format === "json") {
        geminiConfig.responseMimeType = "application/json";
      }

      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`, {
        systemInstruction: {
          parts: [{ text: options.system }]
        },
        contents: [
          { role: "user", parts: [{ text: options.user }] }
        ],
        generationConfig: geminiConfig
      }, { timeout: 0 });

      if (res.status === 200 && res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.data.candidates[0].content.parts[0].text;
      }
    } catch (e: any) {
      console.warn("Gemini API call failed, falling back to local Ollama agent...", e.message);
    }
  }

  console.log("Routing prompt to local Ollama endpoint...");
  const res = await axios.post("http://localhost:11434/api/chat", {
    model: "qwen2.5:14b-instruct-q4_K_M",
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user }
    ],
    temperature: options.temperature ?? 0.2,
    stream: false,
    format: options.format,
    options: {
      num_ctx: 32768
    }
  }, { timeout: 0 }); // 0 means no timeout

  if (res.status !== 200) {
    throw new Error("Local Ollama call failed");
  }

  return res.data.message.content;
}
