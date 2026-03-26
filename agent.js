import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import axios from "axios";

const token = process.env["GH_MODELS_TOKEN"];
const serperKey = process.env["SERPER_API_KEY"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));
const modelName = "gpt-4o"; 

async function askAI(role, task) {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: role },
        { role: "user", content: task }
      ],
      model: modelName
    }
  });
  return response.body.choices[0].message.content;
}

async function startUniversalBuilder() {
  const userReq = process.env["NEWS_HEADLINE"] || "Myanmar News Web App with Admin Panel";
  console.log(`🚀 RE-BUILDING WEB APP: ${userReq}`);

  // Search real data
  const searchResults = await (async (q) => {
    try {
      const res = await axios.post('https://google.serper.dev/search', { q, gl: "mm" }, {
        headers: { 'X-API-KEY': serperKey }
      });
      return res.data.organic.map(i => i.snippet).join("\n");
    } catch (e) { return "Latest Myanmar News Updates"; }
  })(userReq);

  // Strict Coding Prompt
  const finalCode = await askAI(
    "You are a Senior Full-stack Web Developer. You only output pure, valid, and complete HTML code.",
    `Build a complete, one-file Myanmar News Web App. 
     STRICT RULES:
     1. NO introduction text. NO explanations. NO markdown triple backticks.
     2. Start directly with <!DOCTYPE html>.
     3. Include:
        - Modern News Home Page with Tailwind CSS.
        - Working 'Admin Dashboard' button that opens a Modal/Section.
        - JavaScript to Add/Delete news using LocalStorage.
        - Use https://images.unsplash.com/photo-1585829365234-78d9b8129f50?w=800 for placeholders.
     4. Content: Use this data: ${searchResults}.
     5. All labels must be in Burmese.`
  );

  // Clean the code if AI still adds markdown
  let cleanCode = finalCode.trim();
  if (cleanCode.startsWith("```")) {
    cleanCode = cleanCode.replace(/^```html|```$/g, "").trim();
  }

  fs.writeFileSync("index.html", cleanCode);
  console.log("✅ index.html has been updated with real functional code!");
}

startUniversalBuilder();
