import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

// Token နှင့် Endpoint သတ်မှတ်ခြင်း
const token = process.env["GH_MODELS_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";

async function buildWebsite() {
  const client = new ModelClient(endpoint, new AzureKeyCredential(token));

  try {
    console.log("GPT-5 is building your news website... please wait.");
    
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "သင်သည် ကျွမ်းကျင်သော Full-stack Web Developer တစ်ဦးဖြစ်သည်။ HTML, Tailwind CSS code ကိုသာ သီးသန့်ထုတ်ပေးပါ။" },
          { role: "user", content: "မြန်မာသတင်း Media Website တစ်ခုအတွက် ဆွဲဆောင်မှုရှိသော Landing Page HTML code တစ်ခုကို ရေးပေးပါ။" }
        ],
        model: "openai/gpt-5" // ဓာတ်ပုံထဲမှာပါတဲ့ model အတိုင်း အတိအကျ သုံးထားပါတယ်
      }
    });

    // Response ကို သေချာစစ်ဆေးခြင်း
    if (response && response.body && response.body.choices && response.body.choices.length > 0) {
      const htmlContent = response.body.choices[0].message.content;
      
      // Markdown စာသားများပါလာပါက ဖယ်ရှားခြင်း
      const cleanHtml = htmlContent.replace(/```html|```/g, "").trim();
      
      fs.writeFileSync("index.html", cleanHtml);
      console.log("Success! GPT-5 has created 'index.html'.");
    } else {
      console.log("AI Error Data:", JSON.stringify(response.body, null, 2));
    }
  } catch (err) {
    console.error("Connection Error:", err.message);
  }
}

buildWebsite();
