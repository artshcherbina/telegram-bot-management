import React, { useState, useEffect, useRef } from 'react';
import { getUpdates, sendMessage } from '../services/telegramService';
import { TelegramBot } from '../types';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ChatIdFinderProps {
  bot: TelegramBot;
  onChatFound: (chatId: string) => void;
}

const ChatIdFinder: React.FC<ChatIdFinderProps> = ({ bot, onChatFound }) => {
  const [status, setStatus] = useState<string>('Ожидание сообщения...');
  const [error, setError] = useState<string | null>(null);
  const [isFound, setIsFound] = useState(false);
  const pollingRef = useRef<boolean>(true);

  useEffect(() => {
    pollingRef.current = true;
    setIsFound(false);
    setStatus('Ожидание сообщения...');
    setError(null);

    let offset = 0;

    const poll = async () => {
      if (!pollingRef.current) return;

      try {
        const updates = await getUpdates(bot.token, offset);
        
        if (updates && updates.length > 0) {
          // Get the latest update ID to offset next call
          offset = updates[updates.length - 1].update_id + 1;

          // Find the first message from a user
          const messageUpdate = updates.find(u => u.message && u.message.chat);
          
          if (messageUpdate && messageUpdate.message) {
            const foundChatId = messageUpdate.message.chat.id.toString();
            const userName = messageUpdate.message.from.first_name;
            
            setStatus(`Найдено! Чат с ${userName}`);
            setIsFound(true);
            pollingRef.current = false;
            
            // Send a confirmation back
            try {
              await sendMessage(bot.token, foundChatId, "🤖 Система управления: Chat ID успешно подключен!");
            } catch (e) {
              console.warn("Could not send confirmation message", e);
            }

            onChatFound(foundChatId);
            return;
          }
        }
        
        // Continue polling if no relevant message found
        if (pollingRef.current) {
          setTimeout(poll, 2000); 
        }

      } catch (err) {
        console.error(err);
        // Don't show error immediately to UI to avoid flickering, just retry silently unless it's persistent
        // But if we want to stop on critical auth error:
        // pollingRef.current = false;
        // setError("Ошибка доступа к API");
        if (pollingRef.current) setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      pollingRef.current = false;
    };
  }, [bot.token, onChatFound]);

  if (isFound) return null; // Hide component once found to clean up UI

  return (
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 mt-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
         <div className="relative">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full relative"></div>
         </div>
         <div className="text-sm text-slate-300">
            <span className="font-medium text-blue-400">Автопоиск:</span> Отправьте боту любое сообщение...
         </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle size={14} />
          Ошибка соединения
        </div>
      )}
    </div>
  );
};

export default ChatIdFinder;