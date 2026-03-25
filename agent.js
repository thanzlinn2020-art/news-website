import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

const token = process.env["GH_MODELS_TOKEN"];
// Telegram မှ ပို့လိုက်သော သတင်းခေါင်းစဉ်ကို ရယူခြင်း
const headline = process.env["NEWS_HEADLINE"] || "နောက်ဆုံးရ မြန်မာ့သတင်းများ";

async function buildWebsite() {
  const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "သင်သည် BBC News ပုံစံ MYANMAR GLOBAL INSIGHT အတွက် သတင်းရေးပေးရမည်။ HTML/Tailwind CSS သာ ထုတ်ပေးပါ။" },
          { role: "user", content: `ယခုသတင်းခေါင်းစဉ်ဖြင့် Website ကို Update လုပ်ပေးပါ: ${headline}` }
        ],
        model: "openai/gpt-5"
      }
    });

    if (response && response.body && response.body.choices) {
      const htmlContent = response.body.choices[0].message.content.replace(/```html|```/g, "").trim();
      fs.writeFileSync("index.html", htmlContent);
      console.log("Website Updated Successfully with headline: " + headline);
    }
  } catch (err) {
    console.error("AI Build Error:", err.message);
  }
}

buildWebsite();
