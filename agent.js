import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";

// AI Endpoint Setting
const token = process.env["GH_MODELS_TOKEN"];
const client = new ModelClient("https://models.inference.ai.azure.com", new AzureKeyCredential(token));
const modelName = "gpt-4o"; 

async function askAI(messages) {
  try {
    const response = await client.path("/chat/completions").post({
      body: { messages, model: modelName }
    });
    return response.body.choices[0].message.content;
  } catch (err) {
    console.error("AI Error:", err.message);
    return null;
  }
}

async function runManusAgent() {
  const userHeadline = process.env["NEWS_HEADLINE"] || "ရန်ကုန် နောက်ဆုံးရသတင်း";
  console.log(`\n🤖 MANUS AGENT (Mini) STARTED for: ${userHeadline}\n`);

  // --- အဆင့် (၁): စီစဉ်ခြင်း (Planning) ---
  console.log("📝 STEP 1: Planning...");
  const planningPrompt = [
    { role: "system", content: "You are a planning assistant. Break down the task into steps." },
    { role: "user", content: `I want to build a professional Burmese news website about: "${userHeadline}". Create a step-by-step plan.` }
  ];
  const plan = await askAI(planningPrompt);
  console.log("--- Plan ---\n", plan, "\n");

  // --- အဆင့် (၂): အချက်အလက်ရှာဖွေခြင်း (Searching/Information Gathering) ---
  // (မှတ်ချက်: Tavily API မချိတ်ရသေးလို့ AI ရဲ့ Knowledge ပေါ်ပဲ အခြေခံပါမယ်)
  console.log("🔍 STEP 2: Gathering Information (Internal Knowledge)...");
  const gatheringPrompt = [
    { role: "system", content: "You are a senior news researcher. Write detailed, long-form news articles in Burmese." },
    { role: "user", content: `Write a 500+ word detailed news report in Burmese about "${userHeadline}". Based on your knowledge up to late 2023.` }
  ];
  const detailedNews = await askAI(gatheringPrompt);
  console.log("--- Content Generated (Truncated) ---\n", detailedNews.substring(0, 200) + "...\n");

  // --- အဆင့် (၃): Code ရေးခြင်း (Coding) ---
  console.log("💻 STEP 3: Coding (Writing index.html)...");
  const codingPrompt = [
    { role: "system", content: "You are a expert web developer. Use Tailwind CSS CDN for modern design. Use standard, white background theme. Response ONLY with full HTML code." },
    { role: "user", content: `Build a clean news website with a header, footer, and main section about "${userHeadline}". Integrate the following article content here: \n\n ${detailedNews}` }
  ];
  let htmlContent = await askAI(codingPrompt);
  htmlContent = htmlContent.replace(/```html|```/g, "").trim();

  // --- အဆင့် (၄): စစ်ဆေးခြင်းနှင့် အမှားပြင်ခြင်း (Reflection & Self-Correction) ---
  console.log("🧐 STEP 4: Reviewing and Self-Correction...");
  // HTML code ကောင်းမကောင်းကို AI ကိုယ်တိုင် ပြန်စစ်ခိုင်းခြင်း
  const reviewPrompt = [
    { role: "system", content: "You are a code reviewer. Check the HTML for bugs, missing tags, or non-Tailwind syntax. Suggest minimal, critical fixes. Response ONLY with the improved full HTML code." },
    { role: "user", content: `Review this HTML code and improve it. Ensure Burmese fonts are rendered correctly. \n\n ${htmlContent}` }
  ];
  const finalHtml = await askAI(reviewPrompt);
  
  // ဖိုင်သိမ်းခြင်း
  fs.writeFileSync("index.html", finalHtml.replace(/```html|```/g, "").trim());
  console.log("\n✅ SUCCESS: index.html has been generated with Self-Thinking!\n");
}

runManusAgent();
