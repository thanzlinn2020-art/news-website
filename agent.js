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

async function startSmartAgent() {
  const userHeadline = process.env["NEWS_HEADLINE"] || "မြန်မာ့နောက်ဆုံးရသတင်းများ";
  console.log(`🚀 Building Smart CMS for: ${userHeadline}`);

  // Google Search ကနေ တကယ့် သတင်းအချက်အလက်တွေ ကြိုတင်ရှာဖွေထားမယ်
  const res = await axios.post('https://google.serper.dev/search', { q: userHeadline, gl: "mm" }, {
    headers: { 'X-API-KEY': serperKey }
  });
  const searchResults = JSON.stringify(res.data.organic);

  const finalCode = await askAI(
    "You are a Senior Full-stack Developer. Output ONLY valid HTML/JS code.",
    `Build a Smart News CMS in one HTML file. 
     FEATURES TO INCLUDE:
     1. **Auto-Fetch Initial Data**: Populate the app with these news items: ${searchResults}.
     2. **Admin Dashboard**: 
        - A list of all news items with 'Edit' and 'Delete' buttons.
        - A 'Fetch Latest' button that (simulated) gets new AI-generated news.
     3. **Editor Interface**: When 'Edit' is clicked, show a form to change Title, Content, and Image URL.
     4. **Persistence**: Use LocalStorage so changes stay even after refresh.
     5. **Design**: Modern, clean news portal with Tailwind CSS.
     6. **Language**: Burmese labels.`
  );

  let cleanCode = finalCode.trim();
  if (cleanCode.startsWith("```")) cleanCode = cleanCode.replace(/^```html|```$/g, "").trim();

  fs.writeFileSync("index.html", cleanCode);
  console.log("✅ Smart CMS Agent Build Complete!");
}

startSmartAgent();
