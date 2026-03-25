import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

const token = process.env["GH_MODELS_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";

async function buildWebsite() {
  const client = new ModelClient(endpoint, new AzureKeyCredential(token));

  try {
    console.log("GPT-5 is designing MYANMAR GLOBAL INSIGHT... Please wait.");
    
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "သင်သည် BBC News ကဲ့သို့ သေသပ်လှပသော သတင်း Website များကို ဖန်တီးပေးသည့် ကျွမ်းကျင် Web Developer ဖြစ်သည်။" 
          },
          { 
            role: "user", 
            content: `
              Website အမည်: MYANMAR GLOBAL INSIGHT
              Layout လိုအပ်ချက်များ:
              1. Header: အနီရင့်ရောင် Background တွင် အဖြူရောင် Logo ပါရမည်။
              2. Fonts: Pyidaungsu Font သုံး၍ မြန်မာစာသားများကို သေသပ်စွာပြရန်။
              3. Home Page: 
                 - အပေါ်ဆုံးတွင် Breaking News ပုံကြီးတစ်ပုံနှင့် ခေါင်းစဉ်။
                 - အောက်တွင် သတင်းများကို ဘယ်ဘက်ပုံ၊ ညာဘက်စာသား (List View) ပုံစံဖြင့် ပြရန်။
              4. Features: Tailwind CSS (CDN) ကို သုံးပါ။ Responsive ဖြစ်ရမည်။
              5. နမူနာ သတင်း (၅) ပုဒ်ကို မြန်မာဘာသာဖြင့် ထည့်ပေးပါ။
              HTML Code သီးသန့်သာ ထုတ်ပေးပါ။
            ` 
          }
        ],
        model: "openai/gpt-5"
      }
    });

    if (response && response.body && response.body.choices) {
      const htmlContent = response.body.choices[0].message.content;
      // Markdown စာသားများ ပါလာပါက ဖယ်ရှားခြင်း
      const cleanHtml = htmlContent.replace(/```html|```/g, "").trim();
      
      fs.writeFileSync("index.html", cleanHtml);
      console.log("Success! Your BBC-style News Website is ready.");
    }
  } catch (err) {
    console.error("Error building website:", err.message);
  }
}

buildWebsite();
