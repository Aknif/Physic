
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSentenceStarters = async (): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 5 scientific sentence starters in Thai for explaining why an egg doesn't cook on an induction stove without a pan. Focus on induction, metal vs non-metal, and heat generation. Format as a simple list.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text?.trim();
    if (!text) throw new Error("Empty response from AI");
    
    const starters = JSON.parse(text);
    return Array.isArray(starters) && starters.length > 0 ? starters : [
      "จากหลักการทำงานของเตาแม่เหล็กไฟฟ้า...",
      "สาเหตุที่ไข่ไม่สุกเนื่องจาก...",
      "ความร้อนจะเกิดขึ้นได้ก็ต่อเมื่อ...",
      "การที่ไข่ไม่ใช่โลหะส่งผลให้...",
      "สรุปได้ว่ากระแสไฟฟ้าเหนี่ยวนำ..."
    ];
  } catch (error) {
    console.error("Error fetching sentence starters:", error);
    return [
      "จากหลักการทำงานของเตาแม่เหล็กไฟฟ้า...",
      "สาเหตุที่ไข่ไม่สุกเนื่องจาก...",
      "ความร้อนจะเกิดขึ้นได้ก็ต่อเมื่อ...",
      "การที่ไข่ไม่ใช่โลหะส่งผลให้...",
      "สรุปได้ว่ากระแสไฟฟ้าเหนี่ยวนำ..."
    ];
  }
};

export const evaluateReasoning = async (reasoning: string): Promise<string> => {
  if (!reasoning) return "กรุณาระบุเหตุผลของคุณ";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are PhyEM, a high-school physics AI assistant. Evaluate this student's reasoning in Thai about an egg not cooking on an induction stove without a pan: "${reasoning}". 
      Requirements:
      1. Provide a short, vibrant, and encouraging feedback.
      2. Mention if they used concepts like Eddy Current or Induction correctly.
      3. Give one tip for improvement.`,
    });
    return response.text || "เยี่ยมมาก! อย่าลืมเน้นย้ำเรื่องความแตกต่างระหว่างตัวนำโลหะและไข่นะ";
  } catch (error) {
    console.error("Error evaluating reasoning:", error);
    return "กำลังตรวจสอบเหตุผลของคุณ...";
  }
};
