"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanBoardingPass(base64Image: string, mimeType: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
        Look at this boarding pass image and extract the following details in JSON format:
        - origin: The starting city or airport (e.g., "Dubai" or "DXB")
        - destination: The arrival city or airport (e.g., "London" or "LHR")
        - date: The date of travel in YYYY-MM-DD format
        - flight_number: The flight number (e.g., "EK1")
        - airline: The name of the airline

        Return ONLY the JSON object. If you cannot find a detail, return null for that field.
    `;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image.split(',')[1] || base64Image, // Strip data:image/jpeg;base64, if present
                    mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up the response to extract only JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse AI response as JSON.");

        const data = JSON.parse(jsonMatch[0]);
        return data;
    } catch (error: any) {
        console.error("Gemini Scanning Error:", error);
        throw new Error("Failed to scan boarding pass: " + error.message);
    }
}
