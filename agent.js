import { ModelClient } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

async function buildWebsite() {
  const token = process.env["GH_MODELS_TOKEN"];
  const headline = process.env["NEWS_HEADLINE"] || "နောက်ဆုံးရ မြန်မာသတင်းများ";
  const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a professional BBC News editor. Response ONLY with valid HTML/CSS code." },
          { role: "user", content: `Create a professional news website about: ${headline}. Use Burmese language.` }
        ],
        model: "gpt-4o" // model နာမည်ကို gpt-4o လို့ ခဏပြောင်းကြည့်ရအောင်
      }
    });

    if (response.body && response.body.choices) {
      let htmlContent = response.body.choices[0].message.content;
      // HTML Tag တွေပဲ ကျန်အောင် သန့်စင်ခြင်း
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      
      fs.writeFileSync("index.html", htmlContent);
      console.log("Website Updated Successfully!");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

buildWebsite();
