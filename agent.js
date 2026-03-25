import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import axios from "axios";

const token = process.env["GH_MODELS_TOKEN"];
const serperKey = process.env["SERPER_API_KEY"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));
const modelName = "DeepSeek-V3"; 

async function askAI(role, task) {
  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: role + " အရေးကြီးချက်: မြန်မာစာသတ်ပုံကို ယူနီကုဒ်စနစ်ဖြင့် အမှန်ကန်ဆုံး ရေးသားပါ။" },
          { role: "user", content: task }
        ],
        model: modelName
      }
    });

    // Error စစ်ဆေးခြင်း
    if (response.body && response.body.choices && response.body.choices[0]) {
      return response.body.choices[0].message.content;
    } else {
      throw new Error("AI Response is empty or invalid.");
    }
  } catch (err) {
    console.error("AI Error:", err.message);
    return `<h1>Error occurred</h1><p>${err.message}</p>`; // Error ဖြစ်ရင် စာသားလေး ပြပေးမယ်
  }
}

async function googleSearch(query) {
  console.log(`🔍 Searching: ${query}`);
  try {
    const data = JSON.stringify({ "q": query, "gl": "mm", "hl": "my" });
    const config = {
      method: 'post',
      url: 'https://google.serper.dev/search',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      data: data
    };
    const response = await axios(config);
    return response.data.organic.map(item => `${item.title}: ${item.snippet}`).join("\n");
  } catch (err) {
    console.error("Search Error:", err.message);
    return "No search results.";
  }
}

async function startAgent() {
  const userReq = process.env["NEWS_HEADLINE"] || "မြန်မာ့သတင်း Website";
  console.log(`🚀 AGENT STARTING: ${userReq}`);

  const searchResults = await googleSearch(userReq);
  
  const finalCode = await askAI(
    "You are a Senior Web Developer.",
    `Build a professional and functional Web App/Website for: "${userReq}". Use Tailwind CSS and ensure interactive JavaScript. Use this data: \n${searchResults}\n Response ONLY with full HTML/JS code.`
  );

  // HTML သေချာပါမှ သိမ်းရန်
  if (finalCode.includes("<html") || finalCode.includes("<!DOCTYPE")) {
    fs.writeFileSync("index.html", finalCode.replace(/```html|```/g, "").trim());
    console.log("✅ Build Complete!");
  } else {
    console.log("❌ Build failed: No HTML content received.");
    process.exit(1);
  }
}

startAgent();
