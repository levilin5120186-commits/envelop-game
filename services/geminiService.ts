import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DreamResponse, RelativeQuestion, RelativeJudgeResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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

// --- Functions ---

export const judgeResponse = async (question: string, userAnswer: string): Promise<any> => {
  if (!apiKey) return { score: 50, comment: "API Key missing.", isPass: true };

  try {
    const prompt = `
      你現在扮演一位在農曆新年期間的「毒舌華人阿姨」。
      我問了使用者：「${question}」。
      使用者回答：「${userAnswer}」。
      請以 JSON 格式回覆評分、評論（繁體中文）與是否過關。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: auntieSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Auntie Error:", error);
    return { score: 0, comment: "阿姨聽不見！", isPass: false };
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dreamSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Dream Error:", error);
    return { type: 'BAD', explanation: "天機不可洩漏（連線失敗）。", multiplier: 0 };
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: relativeQuestionSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Relative Question Error:", error);
    return { description: "系統錯誤：未知的親戚" };
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: relativeJudgeSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Relative Judge Error:", error);
    return { isCorrect: false, correctAnswer: "未知", comment: "阿姨腦袋當機了" };
  }
};