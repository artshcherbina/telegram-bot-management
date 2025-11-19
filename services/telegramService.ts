import { TelegramResponse, TelegramUpdate, UserMe } from '../types';

const API_BASE = 'https://api.telegram.org/bot';

/**
 * Validates the bot token by calling getMe.
 */
export const getBotMe = async (token: string): Promise<UserMe> => {
  try {
    const response = await fetch(`${API_BASE}${token}/getMe`);
    const data: TelegramResponse<UserMe> = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Invalid Token');
    }
    
    return data.result;
  } catch (error: any) {
    console.error("Telegram API Error:", error);
    throw new Error(error.message || 'Network error. Check CORS or Token.');
  }
};

/**
 * Fetches updates to find chat IDs.
 */
export const getUpdates = async (token: string, offset: number = 0): Promise<TelegramUpdate[]> => {
  try {
    const response = await fetch(`${API_BASE}${token}/getUpdates?offset=${offset}&limit=10&timeout=0`);
    const data: TelegramResponse<TelegramUpdate[]> = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Failed to get updates');
    }
    
    return data.result;
  } catch (error) {
    console.error("Polling Error:", error);
    return []; // Return empty on error to not break polling loop completely
  }
};

/**
 * Sends a message to a specific chat.
 */
export const sendMessage = async (token: string, chatId: string | number, text: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      }),
    });
    
    const data: TelegramResponse<any> = await response.json();
    if (!data.ok) {
        throw new Error(data.description);
    }
    return true;
  } catch (error) {
    console.error("Send Message Error:", error);
    throw error;
  }
};