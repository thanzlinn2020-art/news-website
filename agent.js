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

async function buildProfessionalCMS() {
  const userHeadline = process.env["NEWS_HEADLINE"] || "မြန်မာ့နောက်ဆုံးရသတင်းများ";
  console.log(`🚀 Building Professional News Portal for: ${userHeadline}`);

  // Google Search မှ တကယ့် သတင်းအချက်အလက်များကို ရယူခြင်း
  const res = await axios.post('https://google.serper.dev/search', { q: userHeadline, gl: "mm" }, {
    headers: { 'X-API-KEY': serperKey }
  });
  const realNewsData = JSON.stringify(res.data.organic.slice(0, 6)); // သတင်း ၆ ပုဒ် ယူမယ်

  const finalCode = await askAI(
    "You are a Senior UI/UX & Full-stack Developer. You build professional, high-end news portals.",
    `Build a professional Myanmar News Website (BBC/CNN Style).
     
     DESIGN SPECIFICATIONS:
     1. **Hero Section**: A big featured news with a high-quality image.
     2. **News Grid**: A 3-column grid for other news items.
     3. **Auto-Data**: Populate the website with this real data: ${realNewsData}.
     4. **Admin Engine**:
        - Use a floating 'Settings' icon or a discrete button to access the 'News Management' area.
        - Must have an 'Edit' button on each news card when in Admin mode.
        - Must have a 'Fetch New Stories' button that updates the list using AI.
     5. **Persistence**: Save all edits in LocalStorage.
     6. **Visuals**: Use Tailwind CSS, clean typography (Pyidaungsu font support), and real Unsplash news images.
     7. **Language**: Pure Burmese.
     
     Response ONLY with valid HTML code starting with <!DOCTYPE html>.`
  );

  let cleanCode = finalCode.trim();
  if (cleanCode.startsWith("```")) cleanCode = cleanCode.replace(/^```html|```$/g, "").trim();

  fs.writeFileSync("index.html", cleanCode);
  console.log("✅ Professional News Portal Build Complete!");
}

buildProfessionalCMS();
