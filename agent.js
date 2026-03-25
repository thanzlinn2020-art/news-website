import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import axios from "axios";

const token = process.env["GH_MODELS_TOKEN"];
const serperKey = process.env["SERPER_API_KEY"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));
const modelName = "DeepSeek-R1"; // မြန်မာစာနဲ့ Logic ပိုကောင်းဖို့ DeepSeek သုံးပါမယ်

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
  // Telegram ကနေ ပို့လိုက်တဲ့ "ဘာဆောက်ပေးရမလဲ" ဆိုတဲ့ ခိုင်းစေချက်
  const userRequirement = process.env["NEWS_HEADLINE"] || "ရွှေဈေးတွက်ချက်ပေးတဲ့ Web App";
  console.log(`🚀 UNIVERSAL AGENT ACTIVATED: Building "${userRequirement}"\n`);

  // --- အဆင့် (၁): Research & Planning ---
  // Agent က ဒီ App မှာ ဘာတွေပါသင့်လဲ Google မှာ ရှာပြီး Plan ဆွဲပါမယ်
  const searchResults = await googleSearch(`best features for ${userRequirement}`);
  const plan = await askAI(
    "You are a Senior Product Manager & Architect.",
    `User wants to build: ${userRequirement}. Based on these references: \n${searchResults}\n Create a detailed UI/UX plan and features list in Burmese.`
  );
  console.log("📝 Plan Created:", plan.substring(0, 100) + "...");

  // --- အဆင့် (၂): Advanced Coding ---
  // Plan အတိုင်း HTML/Tailwind/JavaScript code တွေ ရေးပါမယ်
  const code = await askAI(
    "You are an Expert Full-stack Developer (Devin/Replit style). Response ONLY with full HTML/JS/CSS code in one file.",
    `Build a functional and beautiful Web App/Website for: "${userRequirement}". 
     Use the following plan: ${plan}. 
     Ensure it is fully interactive with JavaScript if needed. 
     Use Tailwind CSS for a modern Look. All text should be in Burmese.`
  );

  // --- အဆင့် (၃): Self-Correction & Polishing ---
  const finalCode = await askAI(
    "You are a Quality Assurance Engineer. Review the code for bugs and improve the Burmese font rendering.",
    `Check this code for errors and ensure the UI is perfect: \n\n${code}`
  );

  fs.writeFileSync("index.html", finalCode.replace(/```html|```/g, "").trim());
  console.log(`\n✅ MISSION ACCOMPLISHED: "${userRequirement}" is now live!`);
}

runUniversalAgent();
