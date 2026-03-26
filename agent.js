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

async function buildBBCStyleCMS() {
  const userHeadline = process.env["NEWS_HEADLINE"] || "မြန်မာ့နောက်ဆုံးရသတင်းများ";
  console.log(`🚀 Building BBC Style Portal for: ${userHeadline}`);

  // Google Search မှ တကယ့် BBC News များ ရှာဖွေခြင်း
  const res = await axios.post('https://google.serper.dev/search', { q: `site:bbc.com/burmese ${userHeadline}`, gl: "mm" }, {
    headers: { 'X-API-KEY': serperKey }
  });
  const realNewsData = JSON.stringify(res.data.organic.slice(0, 8)); 

  const finalCode = await askAI(
    "You are a Senior UI/UX Developer specializing in News Portals.",
    `Build a BBC Burmese clone in one HTML file. 
     
     DESIGN REQUIREMENTS:
     1. **Header**: Red background with white 'NEWS' text and Burmese labels.
     2. **Typography**: Use clean sans-serif fonts with clear spacing between lines.
     3. **Layout**: One big 'Hero' story at the top, followed by a list of smaller news items with thumbnails on the side (like BBC mobile app).
     4. **Auto-Data**: Populate with this data: ${realNewsData}.
     5. **Admin Power**:
        - Hide an 'Admin' access button at the bottom.
        - Inside Admin: Ability to 'Edit' news content and 'Add' new items manually.
        - Button 'Fetch Latest' to re-run AI search and update data.
     6. **Functionality**: Fully interactive buttons with JavaScript and LocalStorage persistence.
     
     Response ONLY with valid, complete HTML starting with <!DOCTYPE html>. No explanations.`
  );

  let cleanCode = finalCode.trim();
  if (cleanCode.startsWith("```")) cleanCode = cleanCode.replace(/^```html|```$/g, "").trim();

  fs.writeFileSync("index.html", cleanCode);
  console.log("✅ BBC Style News Portal Build Complete!");
}

buildBBCStyleCMS();
