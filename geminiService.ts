
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // Initialize the AI client before each call to ensure the latest API key is used.

  async analyzeRequestReason(reason: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza brevemente (máximo 20 palabras) si este motivo de permiso hospitalario parece urgente o estándar: "${reason}"`,
      });
      // FIX: Per Gemini API guidelines, `response.text` is a property, not a method.
      return response.text || "No se pudo analizar el motivo.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Análisis no disponible.";
    }
  }

  async generateHRReportSummary(data: any[]): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Como asistente de RH, resume estas métricas de personal de un hospital en 3 puntos clave: ${JSON.stringify(data)}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      // FIX: Per Gemini API guidelines, `response.text` is a property, not a method.
      return response.text || "Resumen no generado.";
    } catch (error) {
      return "Resumen de IA no disponible.";
    }
  }
}

export const gemini = new GeminiService();