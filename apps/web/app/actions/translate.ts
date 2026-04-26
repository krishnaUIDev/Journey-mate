"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function translateText(text: string, targetLanguage: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
        Translate the following text to ${targetLanguage}. 
        Keep the tone natural for a travel companion chat.
        Return ONLY the translated text, no chatter.

        Text to translate: "${text}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error: any) {
        console.error("Translation Error:", error);
        throw new Error("Failed to translate text.");
    }
}
