import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

const token = process.env["GH_MODELS_TOKEN"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));

async function buildWebsite() {
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "သင်သည် ကျွမ်းကျင်သော Web Developer ဖြစ်သည်။ သတင်း Website တစ်ခုအတွက် HTML code ကိုသာ သီးသန့် ထုတ်ပေးပါ။" },
        { role: "user", content: "မြန်မာသတင်းများအတွက် ခေတ်မီသော News Portal တစ်ခုကို Tailwind CSS သုံးပြီး HTML file တစ်ခုတည်းဖြင့် ရေးပေးပါ။" }
      ],
      model: "openai/gpt-5"
    }
  });

  const htmlContent = response.body.choices[0].message.content;
  // Code ထဲက HTML စာသားတွေကို index.html အဖြစ် သိမ်းဆည်းခြင်း
  fs.writeFileSync("index.html", htmlContent);
  console.log("Website Created Successfully!");
}

buildWebsite();
