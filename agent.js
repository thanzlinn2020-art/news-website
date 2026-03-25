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
            ယခုပေးထားသော ခေါင်းစဉ်နှင့်ပတ်သက်၍ Modern UI (Tailwind CSS သုံးရန်) ဖြင့် သတင်း Website အပြည့်အစုံကို ရေးသားပေးပါ။
            
            Website တွင် အောက်ပါအချက်များ မဖြစ်မနေ ပါရမည်-
            ၁။ **Ticker/Banner (Top):** Website ရဲ့ အပေါ်ဆုံးမှာ 'USD ဒေါ်လာဈေး' နှင့် 'ရွှေဈေးနှုန်း' အတက်အကျ Update များကို စာလုံးအနီ/အစိမ်းဖြင့် အမြဲပေါ်နေအောင် ရေးပေးပါ။
            ၂။ **Navigation Menu:** အားကစား၊ နည်းပညာ၊ နိုင်ငံရေး၊ နိုင်ငံတကာ၊ စီးပွားရေး စသည့် Category များကို Menu Bar တွင် ထည့်ပါ။
            ၃။ **Main Content:** ခေါင်းစဉ်ဖြစ်သော ${headline} ကို အဓိကသတင်းကြီး (Main Story) အဖြစ် အကျယ်တဝင့် ရေးပေးပါ။
            ၄။ **Sidebar:** အခြားကဏ္ဍများမှ နောက်ဆုံးရ သတင်းတိုများကို Sidebar တွင် ပြသပါ။
            ၅။ **Style:** BBC ပုံစံ (Red, Black, White) ကို အခြေခံပြီး ခေတ်မီသော Font များနှင့် Responsive Design ဖြစ်ရမည်။
            
            Response ONLY with the full valid HTML code.` 
          },
          { role: "user", content: `Create a professional, multi-category news website about: ${headline}. Ensure live-looking gold/currency rates are at the top.` }
        ],
        model: "openai/gpt-5"
      }
    });

    if (response.body && response.body.choices) {
      let htmlContent = response.body.choices[0].message.content;
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      fs.writeFileSync("index.html", htmlContent);
      console.log("Website Updated Successfully!");
    }
  } catch (err) {
    console.error("AI Build Error:", err.message);
  }
}

buildWebsite();
