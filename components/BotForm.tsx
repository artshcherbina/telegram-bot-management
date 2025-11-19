import React, { useState, useEffect } from 'react';
import { TelegramBot } from '../types';
import { Save, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import ChatIdFinder from './ChatIdFinder';
import { sendMessage, getBotMe } from '../services/telegramService';

interface BotFormProps {
  bot?: TelegramBot;
  onSave: (bot: TelegramBot) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

const BotForm: React.FC<BotFormProps> = ({ bot, onSave, onDelete, onCancel }) => {
  const [name, setName] = useState(bot?.name || '');
  const [username, setUsername] = useState(bot?.username || '');
  const [token, setToken] = useState(bot?.token || '');
  const [chatId, setChatId] = useState(bot?.chatId || '');
  
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setUsername(bot.username || '');
      setToken(bot.token);
      setChatId(bot.chatId || '');
    }
  }, [bot]);

  // Automatically fetch bot name when token changes
  useEffect(() => {
    const fetchBotName = async () => {
      if (!token || token.length < 20) {
         if (!bot) {
             setName('');
             setUsername('');
         }
         return;
      }

      if (bot && token === bot.token && name) return;

      setIsLoadingInfo(true);
      try {
        const info = await getBotMe(token);
        if (info.first_name) {
          setName(info.first_name);
        }
        if (info.username) {
          setUsername(info.username);
        }
      } catch (e) {
        setName('');
        setUsername('');
      } finally {
        setIsLoadingInfo(false);
      }
    };

    const timeout = setTimeout(fetchBotName, 800);
    return () => clearTimeout(timeout);
  }, [token, bot]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
        alert("Не удалось определить имя бота. Пожалуйста, проверьте токен.");
        return;
    }
    
    const newBot: TelegramBot = {
      id: bot?.id || crypto.randomUUID(),
      name,
      username,
      token,
      description: '', 
      chatId: chatId || undefined,
      createdAt: bot?.createdAt || Date.now(),
    };
    onSave(newBot);
  };

  const handleTestMessage = async () => {
    if (!chatId || !token) return;
    try {
        await sendMessage(token, chatId, "*Тестовое сообщение*\n\nВаш бот работает исправно!");
        alert("Сообщение отправлено!");
    } catch (e) {
        alert("Ошибка отправки. Проверьте токен и Chat ID.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {bot ? 'Настройки бота' : 'Добавить нового бота'}
        </h2>
        {bot && onDelete && (
          <button 
            onClick={() => onDelete(bot.id)}
            className="text-red-400 hover:text-red-300 transition-colors p-2"
            title="Удалить бота"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Token Field */}
        <div>
          <label className="block text-slate-400 text-sm font-medium mb-1">Bot Token (из @BotFather)</label>
          <div className="relative">
            <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="123456789:ABCdefGhIJKlmNoPQRstUvwxyz"
                required
            />
            {isLoadingInfo && (
                <div className="absolute right-3 top-2.5">
                    <RefreshCw size={16} className="animate-spin text-slate-400" />
                </div>
            )}
          </div>
          
          <div className="mt-2 min-h-[20px]">
             {name ? (
               <div className="text-sm flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Имя бота: <span className="font-bold text-slate-200">{name}</span>
                 </div>
                 {username && (
                     <div className="text-slate-500 text-xs ml-3.5">@{username}</div>
                 )}
               </div>
             ) : (token.length > 20 && !isLoadingInfo) ? (
               <div className="text-sm text-red-400">
                 Неверный токен или ошибка сети
               </div>
             ) : null}
          </div>
          
          <p className="text-xs text-slate-500 mt-1">Токен хранится только в вашем браузере.</p>
        </div>

        {/* Chat ID Section */}
        <div className="border-t border-slate-700 pt-4">
          <label className="block text-slate-400 text-sm font-medium mb-1">Ваш Chat ID</label>
          <div className="flex gap-2">
            <input
                type="text"
                value={chatId}
                readOnly
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-400 font-mono focus:outline-none cursor-not-allowed opacity-80"
                placeholder={token && name ? "Ожидается автопоиск..." : "Требуется токен"}
            />
            <button
                type="button"
                onClick={handleTestMessage}
                disabled={!chatId || !token}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md disabled:opacity-50 transition-colors"
                title="Отправить тест"
            >
                <ExternalLink size={18} />
            </button>
          </div>

          {/* Only show scanner if we have a valid token/name AND no chatId yet (or we want to update it) */}
          {token && name && !chatId && (
             <ChatIdFinder 
                bot={{ id: bot?.id || '', name, username, token, description: '', createdAt: 0 }} 
                onChatFound={(id) => setChatId(id)} 
             />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!name || isLoadingInfo}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
};

export default BotForm;