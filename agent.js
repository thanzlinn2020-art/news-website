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
          { role: "system", content: "You are a professional web editor. Response ONLY with valid HTML/CSS code." },
          { role: "user", content: `Create a professional news website in Burmese language about: ${headline}. Use Tailwind CSS for modern design.` }
        ],
        model: "gpt-4o-mini" 
      }
    });

    if (response.body && response.body.choices && response.body.choices.length > 0) {
      let htmlContent = response.body.choices[0].message.content;
      // HTML သန့်စင်ခြင်း
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      
      // index.html ဖိုင်ကို ကျိန်းသေ ဆောက်ခိုင်းခြင်း
      fs.writeFileSync("index.html", htmlContent);
      console.log("SUCCESS: index.html has been created successfully!");
    } else {
      throw new Error("AI did not return any content.");
    }
  } catch (err) {
    console.error("AI Build Error:", err.message);
    // Error ဖြစ်ခဲ့ရင်တောင် Action မရပ်သွားအောင် ရိုးရိုးဖိုင်လေးတစ်ခု ဆောက်ပေးထားခြင်း
    fs.writeFileSync("index.html", "<h1>Website is updating... Please refresh in 1 minute.</h1>");
    process.exit(1);
  }
}

buildWebsite();
