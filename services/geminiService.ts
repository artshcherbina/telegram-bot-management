import { GoogleGenAI } from "@google/genai";

export const generateBotContent = async (botName: string, niche: string): Promise<{ description: string; welcomeMessage: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Я создаю Telegram бота.
    Имя бота: "${botName}"
    Тематика/Ниша: "${niche}"
    
    Мне нужно:
    1. Краткое, привлекательное описание для профиля бота (макс 100 символов).
    2. Приветственное сообщение для команды /start (макс 300 символов), которое вовлекает пользователя.
    
    Верни ответ строго в JSON формате:
    {
      "description": "текст",
      "welcomeMessage": "текст"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Не удалось сгенерировать контент.");
  }
};