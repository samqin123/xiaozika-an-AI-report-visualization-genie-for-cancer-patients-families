import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiService {
  private static initAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async parseReport(fileBase64: string, mimeType: string) {
    try {
      const ai = this.initAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [
            { text: `作为医疗数据专家，请精确解析检查报告。
            
识别清单：
1. 血常规(细分): WBC, LYM_P, MONO_P, NEU_P, LYM_N, MONO_N, NEU_N, RBC, HGB, HCT, MCV, MCH, MCHC, PLT, MPV, PLT_PCT, PDW, EOS_N, EOS_P, BASO_N, BASO_P, RDW_SD, RDW_CV, NLR。
2. 免疫亚群: T_CELL_P, CD4_P, CD8_P, CD4_CD8_RATIO, CD4_NAIVE_P, CD8_NAIVE_P, CD4_EM_P, CD4_CM_P, CD8_EM_P, CD8_CM_P, CD4_ACT_EM_P, TREG_P, CD8_PD1_P, CD8_CD39_P, CD8_CD40L_P, CD8_OX40_P, CD8_CD226_P。
3. 生化/肝肾: ALT, AST, ALP, GGT, TBIL, DBIL, IBIL, TP, ALB, GLO, AG_RATIO, PA, UREA, CREA, UA, GLU, LDH, FFA, GLDH。
4. 肿瘤/感染: CA199, CEA, AFP, CRP, PCT。

输出严格 JSON：
{
  "indicators": {"编码": 数值},
  "type": "报告类型",
  "date": "YYYY-MM-DD",
  "hospital": "医院"
}
注意：仅提取数值。比例类(如 A/G, CD4/CD8)保留数值。忽略参考范围和星号标记。` },
            { inlineData: { data: fileBase64, mimeType } }
          ]
        }],
        config: { 
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("识别失败");
      return JSON.parse(text);
    } catch (e) {
      console.error('Gemini OCR Error:', e);
      throw e;
    }
  }

  static async connectLive(callbacks: any, systemInstruction: string, voice: 'Kore' | 'Puck' | 'Zephyr' = 'Kore') {
    const ai = this.initAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
        },
        systemInstruction: `${systemInstruction}\n重点关注：白细胞动态、肝功能代谢平衡及免疫微环境变化（如 CD4/CD8 比值）。`,
      }
    });
  }
}