import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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

export const judgeResponse = async (question: string, userAnswer: string): Promise<any> => {
  if (!apiKey) {
    // Fallback for demo if no key provided
    return {
      score: 50,
      comment: "唉呀，API 金鑰不見了！我沒辦法評斷你。錢拿回去吧。",
      isPass: true
    };
  }

  try {
    const prompt = `
      你現在扮演一位在農曆新年期間的「毒舌華人阿姨」。
      我問了使用者：「${question}」。
      使用者回答：「${userAnswer}」。
      
      請評斷他們的回應。
      - 如果他們有禮貌、機智，或是吹牛吹得很成功，給高分。
      - 如果他們無禮、含糊其辭或令人失望，給低分。
      - 如果他們巧妙地迴避問題，給中高分。
      
      請以 JSON 格式回覆。評論部分請使用繁體中文，語氣要像長輩（帶點「唉唷」、「嘖嘖嘖」或說教語氣）。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: auntieSchema,
        systemInstruction: "你是一位嚴格、傳統但內心其實關心晚輩的華人阿姨。請務必使用繁體中文回答。",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 0,
      comment: "唉唷！我的助聽器（伺服器）壞了，聽不清楚你說什麼。這局算你輸！",
      isPass: false
    };
  }
};