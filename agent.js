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
            content: `သင်သည် ကမ္ဘာ့အဆင့်မီ သတင်းအယ်ဒီတာတစ်ဦးဖြစ်သည်။ 
            ယခုပေးထားသော ခေါင်းစဉ်နှင့်ပတ်သက်၍ လှပသော သတင်း Website တစ်ခုကို HTML/CSS ဖြင့် ရေးသားပေးပါ။
            
            သတ်မှတ်ချက်များ (Strict Rules):
            ၁။ Background ကို White သို့မဟုတ် Light Gray သုံးပါ။ စာသားများကို Black သုံးပါ။
            ၂။ Website အပေါ်ဆုံးတွင် အပြာရောင် Header နှင့် "USD ဒေါ်လာဈေး၊ ရွှေဈေး" များပါသော Scrolling Ticker ထည့်ပါ။
            ၃။ သတင်းခေါင်းစဉ်ကို အကြီးဆုံးပြပြီး ၎င်းအောက်တွင် <img src="https://images.unsplash.com/photo-1585829365234-78d9b8129f50?w=800" style="width:100%; max-height:400px; object-fit:cover; border-radius:10px;"> ကို ထည့်ပါ။
            ၄။ သတင်းအကြောင်းအရာကို စာလုံးရေ ၅၀၀ ကျော်အောင် အကျယ်တဝင့် ရေးပေးပါ။
            ၅။ Navigation Menu (ပင်မစာမျက်နှာ၊ အားကစား၊ နည်းပညာ၊ စီးပွားရေး) ပါရမည်။
            
            Response ONLY with the full valid HTML/CSS code.` 
          },
          { role: "user", content: `Create a professional news portal in Burmese: ${headline}. Make it look like a real news site with a white background.` }
        ],
        model: "gpt-4o"
      }
    });

    if (response.body && response.body.choices) {
      let htmlContent = response.body.choices[0].message.content;
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      fs.writeFileSync("index.html", htmlContent);
      console.log("SUCCESS: Clean Website Created!");
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

buildWebsite();
