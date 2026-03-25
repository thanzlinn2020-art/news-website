import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import axios from "axios";

const token = process.env["GH_MODELS_TOKEN"];
const serperKey = process.env["SERPER_API_KEY"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));

// --- DeepSeek-V3 ကို အသုံးပြုခြင်း ---
const modelName = "DeepSeek-V3"; 

async function askAI(role, task) {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: role + " အရေးကြီးချက်: မြန်မာစာသတ်ပုံကို ယူနီကုဒ်စနစ်ဖြင့် အမှန်ကန်ဆုံး ရေးသားပါ။" },
        { role: "user", content: task }
      ],
      model: modelName
    }
  });
  return response.body.choices[0].message.content;
}

async function googleSearch(query) {
  console.log(`🌐 Agent is browsing the web for: ${query}...`);
  const data = JSON.stringify({ "q": query, "gl": "mm", "hl": "my" });
  const config = {
    method: 'post',
    url: 'https://google.serper.dev/search',
    headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
    data: data
  };
  const response = await axios(config);
  return response.data.organic.map(item => `${item.title}: ${item.snippet}`).join("\n");
}

async function runUniversalAgent() {
  const userRequirement = process.env["NEWS_HEADLINE"] || "ရွှေဈေးတွက်ချက်ပေးတဲ့ Web App";
  console.log(`🚀 UNIVERSAL AGENT (DeepSeek-V3) ACTIVATED: Building "${userRequirement}"\n`);

  const searchResults = await googleSearch(`how to build ${userRequirement}`);
  
  const plan = await askAI(
    "You are a Senior Web Architect.",
    `Build requirement: ${userRequirement}. Search references: \n${searchResults}\n Create a structure for this app in Burmese.`
  );

  const finalCode = await askAI(
    "You are an Expert Full-stack Developer. Response ONLY with full HTML/JS/CSS code in one file using Tailwind CSS.",
    `Build this App/Website: "${userRequirement}". Plan: ${plan}. Ensure interactivity with JavaScript and use correct Burmese fonts.`
  );

  fs.writeFileSync("index.html", finalCode.replace(/```html|```/g, "").trim());
  console.log(`\n✅ DeepSeek-V3 has finished building: "${userRequirement}"`);
}

runUniversalAgent();
