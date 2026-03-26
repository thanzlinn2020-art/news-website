import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import axios from "axios";

const token = process.env["GH_MODELS_TOKEN"];
const serperKey = process.env["SERPER_API_KEY"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));
const modelName = "gpt-4o"; 

async function startUniversalBuilder() {
  const prompt = process.env["NEWS_HEADLINE"] || "Useful Web App";
  console.log(`🤖 STARTING UNIVERSAL BUILDER: ${prompt}`);

  // ၁။ Internet မှာ ဒီ App အလုပ်လုပ်ဖို့ လိုအပ်တဲ့ သင်္ချာနဲ့ Logic တွေ ရှာမယ်
  const searchResults = await axios.post('https://google.serper.dev/search', { q: `functional logic for ${prompt} using javascript`, gl: "mm" }, {
    headers: { 'X-API-KEY': serperKey }
  }).then(res => JSON.stringify(res.data.organic));

  // ၂။ AI က အဲ့ဒီ Logic တွေနဲ့ တကယ့် App ကို ရေးမယ်
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are an expert Software Engineer. You build FULLY FUNCTIONAL web apps. You output ONLY HTML/JS/CSS code. No talking." },
        { role: "user", content: `Create a professional and working web application for: "${prompt}". 
           Use these logic references: ${searchResults}. 
           Rules: 
           - Must have a high-end UI with Tailwind CSS. 
           - Must have COMPLETE JavaScript logic for the app features.
           - All text must be in Burmese. 
           - Must be mobile-friendly.
           Output ONLY the full HTML code.` }
      ],
      model: modelName
    }
  });

  let finalCode = response.body.choices[0].message.content.trim();
  if (finalCode.startsWith("```")) finalCode = finalCode.replace(/^```html|```$/g, "").trim();

  fs.writeFileSync("index.html", finalCode);
  console.log(`✅ ${prompt} IS READY!`);
}

startUniversalBuilder();
