import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

async function buildWebsite() {
  const token = process.env["GH_MODELS_TOKEN"];
  const headline = process.env["NEWS_HEADLINE"] || "နောက်ဆုံးရ မြန်မာသတင်းများ";
  const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));

  console.log("Starting AI build for:", headline);

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "You are a professional BBC News editor. Response ONLY with valid HTML/CSS code using Tailwind CSS. Include beautiful news images from Unsplash. Use Burmese language." 
          },
          { role: "user", content: `Create a professional news website about: ${headline}. Show headlines, detailed news, and currency rates at the top.` }
        ],
        model: "gpt-4o-mini" // ပိုမြန်ပြီး တည်ငြိမ်တဲ့ model ကို သုံးပါမယ်
      }
    });

    if (response.body && response.body.choices && response.body.choices.length > 0) {
      let htmlContent = response.body.choices[0].message.content;
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      fs.writeFileSync("index.html", htmlContent);
      console.log("SUCCESS: index.html has been created!");
    } else {
      throw new Error("AI did not return any content.");
    }
  } catch (err) {
    console.error("AI Build Error:", err.message);
    process.exit(1);
  }
}

buildWebsite();
