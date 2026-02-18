import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DreamResponse, RelativeQuestion, RelativeJudgeResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Configuration ---

// Models to try in order. If one fails (e.g., rate limit), the next will be used.
// Prioritizing Gemini 3 series (Pro then Flash), falling back to 2.5 series.
const MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro-latest',
  'gemini-2.5-flash-latest'
];

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

const relativeQuestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "The description of the relationship (e.g. '爸爸的哥哥').",
    },
  },
  required: ["description"],
};

const relativeJudgeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: {
      type: Type.BOOLEAN,
      description: "Whether the user's answer is correct.",
    },
    correctAnswer: {
      type: Type.STRING,
      description: "The correct relative title in Traditional Chinese.",
    },
    comment: {
      type: Type.STRING,
      description: "A brief comment on the answer.",
    },
  },
  required: ["isCorrect", "correctAnswer", "comment"],
};

// --- Helper Functions ---

/**
 * Attempts to generate content using a list of models.
 * If the primary model fails (e.g. rate limit), it tries the next one.
 */
async function generateWithFallback(prompt: string, schema: Schema): Promise<string> {
  let lastError: any = null;

  for (const modelName of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const text = response.text;
      if (text) {
        return text;
      }
    } catch (error) {
      console.warn(`Gemini Model [${modelName}] failed. Switching to next...`, error);
      lastError = error;
      // Continue loop to try next model
    }
  }

  // If we reach here, all models failed
  throw lastError || new Error("All AI models failed to respond.");
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
    `;

    const jsonText = await generateWithFallback(prompt, auntieSchema);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Auntie Error (All models failed):", error);
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
    `;

    const jsonText = await generateWithFallback(prompt, dreamSchema);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Dream Error (All models failed):", error);
    return { type: 'BAD', explanation: "天機不可洩漏（連線逾時，請稍後再試）。", multiplier: 0 };
  }
};

export const generateRelativeQuestion = async (): Promise<RelativeQuestion> => {
  if (!apiKey) return { description: "API Key Missing (爸爸的爸爸?)" };
  
  try {
    const prompt = `
      請隨機生成一個華人親戚稱謂的題目描述（繁體中文）。
      例如：「爸爸的弟弟的妻子」、「媽媽的姐姐的兒子」。
      請不要包含答案。
    `;

    const jsonText = await generateWithFallback(prompt, relativeQuestionSchema);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Relative Question Error (All models failed):", error);
    return { description: "系統忙碌中：暫時想不起親戚是誰" };
  }
};

export const judgeRelativeAnswer = async (question: string, userAnswer: string): Promise<RelativeJudgeResponse> => {
  if (!apiKey) return { isCorrect: false, correctAnswer: "未知", comment: "API Key Missing" };

  try {
    const prompt = `
      題目：${question}
      使用者的回答：${userAnswer}
      請判斷回答是否正確（繁體中文稱謂）。
      若是正確，isCorrect 為 true。
      若不正確，isCorrect 為 false，並提供正確稱謂。
      請給予一個簡短有趣的評論。
    `;

    const jsonText = await generateWithFallback(prompt, relativeJudgeSchema);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Relative Judge Error (All models failed):", error);
    return { isCorrect: false, correctAnswer: "未知", comment: "阿姨腦袋當機了（連線失敗）" };
  }
};