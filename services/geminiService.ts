import { GoogleGenAI } from "https://esm.sh/@google/genai@1.34.0";
import { UserProfile, ChatMessage } from "../types";

/**
 * Generates a response from the Gemini assistant based on user query and profile.
 * Follows the latest @google/genai guidelines.
 */
export const getAssistantResponse = async (
  query: string,
  category: string,
  userProfile: UserProfile,
  history: ChatMessage[]
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const userContext = `用户昵称: ${userProfile.name}, 诊断: ${userProfile.diagnosis || '未知'}, 病史: ${userProfile.medical_history || '未知'}, 咨询专题: ${category}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: `${userContext}\n提问内容: ${query}` }] },
      config: {
        systemInstruction: "你是一位专业且充满同理心的抗癌管家。请始终使用中文，语调要温暖而坚定。回答结构：【核心结论】、【深度解析】、【温情寄语】。严禁使用 Markdown。",
        temperature: 0.7,
      },
    });

    return {
      text: response.text || "抱歉，我现在思绪有点乱，能请您换个方式问我吗？",
      sources: []
    };
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    const errorMsg = error.message?.includes('fetch') ? "网络连接不太顺畅，请检查您的网络设置后再试。" : "AI 服务暂时休眠中，请稍后再试。";
    return { text: errorMsg, sources: [] };
  }
};