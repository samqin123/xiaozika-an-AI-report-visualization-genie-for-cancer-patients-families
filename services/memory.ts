
import { MEMOS_CONFIG } from "../constants";

export class MemoryService {
  /**
   * 检查配置是否有效
   */
  private static isValidConfig() {
    return MEMOS_CONFIG.API_KEY && !MEMOS_CONFIG.API_KEY.includes('your-key');
  }

  static async saveToMemory(content: string) {
    if (!this.isValidConfig()) return;

    try {
      const response = await fetch(`${MEMOS_CONFIG.BASE_URL}/add/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${MEMOS_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          user_id: MEMOS_CONFIG.USER_ID,
          conversation_id: "health_context",
          messages: [{ role: "user", content }]
        })
      });
      if (!response.ok) {
        console.warn('Memory service error:', response.statusText);
      }
    } catch (e) { 
      console.error("Memory Save Fetch Error (likely connection issue):", e); 
    }
  }

  static async searchContext(query: string): Promise<string> {
    if (!this.isValidConfig()) return "尚无本地记忆，已进入纯净诊断模式。";

    try {
      const res = await fetch(`${MEMOS_CONFIG.BASE_URL}/search/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${MEMOS_CONFIG.API_KEY}`
        },
        body: JSON.stringify({ query, user_id: MEMOS_CONFIG.USER_ID, conversation_id: "global" })
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return data?.memory || "尚无匹配的历史记录。";
    } catch (e) { 
      console.error("Memory Search Fetch Error:", e);
      return "记忆检索暂时不可用，正在基于当前数据分析。"; 
    }
  }
}
