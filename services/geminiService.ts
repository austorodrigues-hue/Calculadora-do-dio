
import { GoogleGenAI, Type } from "@google/genai";
import { AIExplanation } from "../types";

export const getMathExplanation = async (expression: string, result: string): Promise<AIExplanation> => {
  // Always initialize with apiKey from process.env.API_KEY using named parameter.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explain the mathematical expression "${expression}" which equals "${result}". Provide a step-by-step breakdown, the underlying concept, and a real-world application.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          stepByStep: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of steps to reach the result",
          },
          concept: {
            type: Type.STRING,
            description: "The mathematical concept involved",
          },
          realWorldUsage: {
            type: Type.STRING,
            description: "Where this math is used in the real world",
          },
        },
        required: ["stepByStep", "concept", "realWorldUsage"],
        propertyOrdering: ["stepByStep", "concept", "realWorldUsage"],
      },
    },
  });

  // Extracting text output from response.text property (not a method).
  const jsonStr = response.text?.trim() || '{}';
  try {
    return JSON.parse(jsonStr) as AIExplanation;
  } catch (error) {
    console.error("Failed to parse Gemini AI response:", error);
    return {
      stepByStep: ["Result calculated: " + result],
      concept: "General Mathematics",
      realWorldUsage: "Calculation performed via NovaCalc Pro."
    };
  }
};
