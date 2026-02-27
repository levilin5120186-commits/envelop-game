import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DreamResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Configuration ---
// Fixed model as requested: Gemini 2.5 Flash for speed
const MODEL_NAME = 'gemini-2.5-flash';

// --- Schemas ---

const auntieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 based on how satisfactory the user's answer is to a traditional Chinese auntie.",
    },
    comment: {
      type: Type.STRING,
      description: "The auntie's verbal response to the answer in Traditional Chinese. Should be sassy, judgmental, or surprisingly approving.",
    },
    isPass: {
      type: Type.BOOLEAN,
      description: "True if the score is greater than or equal to 60, False otherwise.",
    },
  },
  required: ["score", "comment", "isPass"],
};

const dreamSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: ["GOOD", "BAD"],
      description: "Whether the omen is good (wealth/luck coming) or bad (money loss).",
    },
    explanation: {
      type: Type.STRING,
      description: "A creative, slightly superstitious, and humorous interpretation of the input relating to the Year of the Horse (2026) and wealth. In Traditional Chinese.",
    },
    multiplier: {
      type: Type.NUMBER,
      description: "If GOOD, a multiplier between 1.5 and 3.0. If BAD, return 0.",
    },
  },
  required: ["type", "explanation", "multiplier"],
};

// --- Helper Functions ---

async function generateContent(prompt: string, schema: Schema): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from AI.");
    }
    return text;
  } catch (error) {
    console.error(`Gemini Model [${MODEL_NAME}] failed:`, error);
    throw error;
  }
}

// --- Exported Functions ---

export const judgeResponse = async (question: string, userAnswer: string): Promise<any> => {
  if (!apiKey) return { score: 50, comment: "API Key missing.", isPass: true };

  try {
    const prompt = `
      你現在扮演一位在農曆新年期間的「毒舌華人阿姨」。
      我問了使用者：「${question}」。
      使用者回答：「${userAnswer}」。
      請以 JSON 格式回覆評分、評論（繁體中文）與是否過關。
      評論請在 200 字以內。
    `;

    const jsonText = await generateContent(prompt, auntieSchema);
    return JSON.parse(jsonText);
  } catch (error) {
    return { score: 0, comment: "阿姨忙線中，聽不見你說什麼！(連線失敗)", isPass: false };
  }
};

export const interpretDream = async (input: string): Promise<DreamResponse> => {
  if (!apiKey) return { type: 'BAD', explanation: "沒付錢解什麼夢？", multiplier: 0 };

  try {
    const prompt = `
      你是「2026 馬年新春解夢大師」。
      使用者輸入夢境或物品：「${input}」。
      請根據「馬年」、「發財」、「諧音梗」、「馬到成功」或「民俗迷信」進行幽默解讀。
      判定是吉（賺錢）還是凶（賠錢）。
      如果是吉，給予 1.5 到 3.0 的倍率。如果是凶，倍率為 0。
      解釋請簡短有力，200 字以內。
    `;

    const jsonText = await generateContent(prompt, dreamSchema);
    return JSON.parse(jsonText);
  } catch (error) {
    return { type: 'BAD', explanation: "天機不可洩漏（連線逾時，請稍後再試）。", multiplier: 0 };
  }
};
