import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

async function buildWebsite() {
  const token = process.env["GH_MODELS_TOKEN"];
  const headline = process.env["NEWS_HEADLINE"] || "နောက်ဆုံးရ မြန်မာသတင်းများ";
  const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));

  console.log("Starting AI build with images for:", headline);

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: `သင်သည် BBC News ကဲ့သို့သော ကမ္ဘာ့အဆင့်မီ သတင်းအယ်ဒီတာတစ်ဦးဖြစ်သည်။ 
            Modern UI (Tailwind CSS သုံးရန်) ဖြင့် သတင်း Website အပြည့်အစုံကို ရေးသားပေးပါ။
            
            Website တွင် အောက်ပါအချက်များ မဖြစ်မနေ ပါရမည်-
            ၁။ **Ticker/Banner (Top):** Website ရဲ့ အပေါ်ဆုံးမှာ 'USD ဒေါ်လာဈေး' နှင့် 'ရွှေဈေးနှုန်း' အတက်အကျ Update များကို စာလုံးအနီ/အစိမ်းဖြင့် အမြဲပေါ်နေအောင် ရေးပေးပါ။
            ၂။ **Navigation Menu:** အားကစား၊ နည်းပညာ၊ နိုင်ငံရေး၊ နိုင်ငံတကာ၊ စီးပွားရေး စသည့် Category များကို Menu Bar တွင် ထည့်ပါ။
            ၃။ **Main Content & Images:** ခေါင်းစဉ်ဖြစ်သော ${headline} ကို အဓိကသတင်းကြီး (Main Story) အဖြစ် အကျယ်တဝင့် ရေးပေးပါ။ သတင်းနှင့်လိုက်ဖက်သော ပုံရိပ်များကို <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000" class="w-full h-96 object-cover rounded-lg"> ကဲ့သို့သော ဥပမာပုံများ သုံးပါ။
            ၄။ **Sidebar:** အခြားကဏ္ဍများမှ နောက်ဆုံးရ သတင်းတိုများကို Sidebar တွင် ပြသပါ။ သတင်းတစ်ခုချင်းစီအတွက် ပုံငယ်လေးများ (<img src="...">) ပါအောင် ထည့်ပါ။
            ၅။ **Style:** BBC ပုံစံ (Red, Black, White) ကို အခြေခံပြီး ခေတ်မီသော Font များနှင့် Responsive Design ဖြစ်ရမည်။
            
            Response ONLY with the full valid HTML code.` 
          },
          { role: "user", content: `Create a professional, full-length news website about: ${headline}. Integrate relevant, beautiful images throughout the page.` }
        ],
        model: "openai/gpt-5"
      }
    });

    if (response.body && response.body.choices && response.body.choices.length > 0) {
      let htmlContent = response.body.choices[0].message.content;
      htmlContent = htmlContent.replace(/```html|```/g, "").trim();
      fs.writeFileSync("index.html", htmlContent);
      console.log("SUCCESS: index.html with images has been created successfully!");
    } else {
      throw new Error("AI did not return any content.");
    }
  } catch (err) {
    console.error("AI Build Error:", err.message);
    // Error ဖြစ်ခဲ့ရင်တောင် Action မရပ်သွားအောင် ရိုးရိုးဖိုင်လေးတစ်ခု ဆောက်ပေးထားခြင်း
    fs.writeFileSync("index.html", "<h1>Website is updating with images... Please refresh in 1 minute.</h1>");
    process.exit(1);
  }
}

buildWebsite();
