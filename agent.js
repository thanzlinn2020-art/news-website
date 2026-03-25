import ModelClient from "@azure-rest/ai-inference";
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
          { 
            role: "system", 
            content: `သင်သည် BBC News ကဲ့သို့သော ကမ္ဘာ့အဆင့်မီ သတင်းအယ်ဒီတာတစ်ဦးဖြစ်သည်။ 
            ယခုပေးထားသော ခေါင်းစဉ်နှင့်ပတ်သက်၍ Modern UI (Tailwind CSS) ဖြင့် သတင်း Website အပြည့်အစုံကို ရေးသားပေးပါ။
            
            သတ်မှတ်ချက်များ:
            ၁။ <head> ထဲတွင် Tailwind CSS CDN ထည့်ပါ။
            ၂။ Navigation Bar တွင် (Home, အားကစား, နည်းပညာ, စီးပွားရေး) Menu များထည့်ပါ။
            ၃။ Website အပေါ်ဆုံးတွင် USD ဒေါ်လာဈေးနှင့် ရွှေဈေးကို Scrolling Ticker ဖြင့် ပြပါ။
            ၄။ Main Content တွင် ${headline} ကို သတင်းအပြည့်အစုံ (စာလုံးရေ ၄၀၀ ကျော်) ရေးပါ။
            ၅။ ပုံများအတွက် <img src="https://images.unsplash.com/photo-1585829365234-78d9b8129f50?q=80&w=800" class="w-full h-96 object-cover rounded-xl my-6"> ကဲ့သို့သော Direct Link များ သုံးပါ။
            ၆။ မြန်မာစာ Font ကို ရှင်းလင်းအောင် Style ထည့်ပါ။
            
            Response ONLY with the full valid HTML code.` 
          },
          { role: "user", content: `Create a professional, image-rich news portal in Burmese about: ${headline}. Use a dark/light modern theme.` }
        ],
        model: "gpt-4o"
      }
    });

    if (response.body && response.body.choices) {
      let htmlContent = response.body.choices[0].message.content;
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      fs.writeFileSync("index.html", htmlContent);
      console.log("SUCCESS: Professional Website Created!");
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

buildWebsite();
