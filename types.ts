export interface TelegramBot {
  id: string;
  token: string;
  name: string;
  description: string;
  chatId?: string; // The chat ID for the owner/admin
  createdAt: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

export interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
}

export interface UserMe {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}