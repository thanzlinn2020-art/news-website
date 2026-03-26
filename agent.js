import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import axios from "axios";

const token = process.env["GH_MODELS_TOKEN"];
const serperKey = process.env["SERPER_API_KEY"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));
const modelName = "gpt-4o"; // Logic ပိုမှန်ဖို့ gpt-4o ကို ခဏပြန်သုံးပါမယ်

async function askAI(role, task) {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: role + " အရေးကြီးချက်: JavaScript Function များ အလုပ်လုပ်ရမည်။ Admin Dashboard ပါရမည်။" },
        { role: "user", content: task }
      ],
      model: modelName
    }
  });
  return response.body.choices[0].message.content;
}

async function startUniversalBuilder() {
  const userReq = process.env["NEWS_HEADLINE"] || "Myanmar News Portal with Admin Dashboard";
  console.log(`🚀 BUILDING FULL WEB APP: ${userReq}`);

  // Step 1: Search for latest news
  const searchResults = await (async (q) => {
    const res = await axios.post('https://google.serper.dev/search', { q, gl: "mm" }, {
      headers: { 'X-API-KEY': serperKey }
    });
    return res.data.organic.map(i => i.snippet).join("\n");
  })(userReq);

  // Step 2: Coding with Full Functionality
  const finalCode = await askAI(
    "You are a Full-stack Developer.",
    `Build a complete News Web App.
     REQUIRED FEATURES:
     1. Home Page: Show news with real images from Unsplash.
     2. Admin Dashboard: A hidden section or a modal to add/edit/delete news.
     3. JavaScript: Use LocalStorage to save news locally so Admin changes persist.
     4. UI: Modern Tailwind CSS. Buttons MUST work.
     5. Language: Burmese.
     Data to include: ${searchResults}
     Response ONLY with full HTML/JS/CSS code.`
  );

  fs.writeFileSync("index.html", finalCode.replace(/```html|```/g, "").trim());
  console.log("✅ Full Web App with Admin Panel is Ready!");
}

startUniversalBuilder();
