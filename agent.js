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
      messages: [{ role: "system", content: role }, { role: "user", content: task }],
      model: modelName
    }
  });
  return response.body.choices[0].message.content;
}

async function startUniversalAgent() {
  // Lynn ဆီက လာတဲ့ အမိန့် (ဥပမာ- "BMI App ဆောက်ပေးပါ" သို့မဟုတ် "ငွေလဲနှုန်းတွက်တဲ့ App")
  const prompt = process.env["NEWS_HEADLINE"] || "Useful Web App";
  console.log(`🚀 AGENT MISSION: Building "${prompt}"...`);

  // ၁။ Internet မှာ ဒီ App အတွက် လိုအပ်တဲ့ Logic တွေ ရှာမယ်
  const res = await axios.post('https://google.serper.dev/search', { q: `how to build ${prompt} web app functionality`, gl: "mm" }, {
    headers: { 'X-API-KEY': serperKey }
  });
  const techSpecs = JSON.stringify(res.data.organic);

  // ၂။ AI က အဲ့ဒီ အချက်အလက်တွေနဲ့ App တစ်ခုလုံးကို ရေးမယ်
  const finalCode = await askAI(
    "You are an Advanced AI Software Engineer like Devin or Replit Agent.",
    `Task: Build a fully functional, professional-grade Web Application for: "${prompt}". 
     
     TECHNICAL SPECS:
     - Use Tailwind CSS for a high-end UI/UX.
     - Include all necessary JavaScript logic for the app to actually WORK (e.g., calculations, data handling).
     - Responsive design (Mobile + Desktop).
     - Language: Burmese (Labels and Instructions).
     - Knowledge base: ${techSpecs}.
     
     Output ONLY pure HTML/CSS/JS code. No explanations. No markdown.`
  );

  let cleanCode = finalCode.trim();
  if (cleanCode.startsWith("```")) cleanCode = cleanCode.replace(/^```html|```$/g, "").trim();

  fs.writeFileSync("index.html", cleanCode);
  console.log(`✅ SUCCESS: "${prompt}" has been built and deployed!`);
}

startUniversalAgent();
