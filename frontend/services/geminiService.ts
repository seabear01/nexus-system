import { GoogleGenAI } from "@google/genai";
import { User, Role } from '../types';

export const generateUserBio = async (user: User, roleName: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API Key available for Gemini.");
      return "AI bio generation requires a valid API key.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Write a professional, short (max 2 sentences) corporate biography for a user in a user management system.
      User Name: ${user.name}
      Role: ${roleName}
      Status: ${user.status}
      Joined: ${new Date(user.createdAt).toLocaleDateString()}
      
      Tone: Professional, concise, welcoming.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Bio generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate bio at this time.";
  }
};