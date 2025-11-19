import React, { useState, useEffect } from 'react';
import { TelegramBot } from './types';
import BotForm from './components/BotForm';
import { Plus, Bot, Menu, X, Settings, MessageSquare, Github, AlertTriangle, Copy, Check } from 'lucide-react';

const STORAGE_KEY = 'telebot_manager_data';

const App: React.FC = () => {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setBots(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load bots", e);
      }
    }
    setHasLoaded(true);
  }, []);

  // Save to localStorage whenever bots change
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
    }
  }, [bots, hasLoaded]);

  // Reset copied state when bot changes
  useEffect(() => {
    setCopiedField(null);
  }, [selectedBotId]);

  const handleSaveBot = (bot: TelegramBot) => {
    if (selectedBotId && bots.find(b => b.id === bot.id)) {
      // Update existing
      setBots(bots.map(b => b.id === bot.id ? bot : b));
    } else {
      // Create new
      setBots([...bots, bot]);
    }
    setSelectedBotId(bot.id);
    setIsEditing(false);
  };

  const handleDeleteBot = (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого бота из списка?")) {
      setBots(bots.filter(b => b.id !== id));
      if (selectedBotId === id) {
        setSelectedBotId(null);
        setIsEditing(false);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedBotId(null);
    setIsEditing(true);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const selectedBot = bots.find(b => b.id === selectedBotId);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-200">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-md border border-slate-700 shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-700 flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Bot className="text-white" size={24} />
            </div>
          <h1 className="text-xl font-bold text-white">TeleBot</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {bots.length === 0 && (
             <div className="text-center py-10 text-slate-500 text-sm">
                Нет добавленных ботов.
             </div>
          )}
          
          {bots.map(bot => (
            <button
              key={bot.id}
              onClick={() => {
                setSelectedBotId(bot.id);
                setIsEditing(false);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 group
                ${selectedBotId === bot.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                  : 'hover:bg-slate-700 text-slate-300'
                }
              `}
            >
              <div className={`w-2 h-2 rounded-full ${selectedBotId === bot.id ? 'bg-white' : 'bg-slate-500 group-hover:bg-slate-400'}`}></div>
              <span className="font-medium truncate">{bot.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            Добавить бота
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full w-full relative">
        
        <div className="max-w-4xl mx-auto p-6 md:p-10 pt-16 md:pt-10">
            
          {/* CORS Warning Banner */}
          <div className="mb-6 bg-blue-900/20 border border-blue-800 p-4 rounded-lg flex items-start gap-3">
             <Settings className="text-blue-400 flex-shrink-0 mt-1" size={18} />
             <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Browser Environment Note</p>
                <p className="opacity-80">
                    Прямые запросы к Telegram API из браузера могут блокироваться (CORS). 
                    Если функции поиска ID или отправки сообщений не работают, убедитесь, что у вас установлено расширение для обхода CORS, или используйте этот инструмент локально с отключенной веб-защитой.
                </p>
             </div>
          </div>

          {isEditing || (!selectedBot && bots.length === 0) ? (
            <BotForm 
              bot={isEditing && selectedBot ? selectedBot : undefined}
              onSave={handleSaveBot}
              onDelete={handleDeleteBot}
              onCancel={() => {
                setIsEditing(false);
                if (bots.length === 0) setIsEditing(true); // Force edit if empty
              }}
            />
          ) : !selectedBot ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
               <Bot size={64} className="mb-4 opacity-20" />
               <p className="text-lg">Выберите бота из меню слева или создайте нового.</p>
            </div>
          ) : (
            <div className="space-y-8">
                {/* Bot Dashboard Header */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bot size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-4">
                                <h1 className="text-3xl font-bold text-white mb-3">{selectedBot.name}</h1>
                                
                                <div className="space-y-2">
                                  {/* Token Display */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs uppercase font-bold w-16 tracking-wider">Token</span>
                                    <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-md px-3 py-2 w-fit max-w-full group hover:border-slate-700 transition-colors">
                                        <code className="text-slate-400 text-sm font-mono break-all select-all">
                                            {selectedBot.token}
                                        </code>
                                        <button 
                                            onClick={() => handleCopy(selectedBot.token, 'token')}
                                            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 flex-shrink-0"
                                            title="Скопировать токен"
                                        >
                                            {copiedField === 'token' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                  </div>

                                  {/* Chat ID Display */}
                                  {selectedBot.chatId && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-xs uppercase font-bold w-16 tracking-wider">Chat ID</span>
                                        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-md px-3 py-1.5 w-fit group hover:border-slate-700 transition-colors">
                                            <code className="text-blue-300 text-sm font-mono select-all">
                                                {selectedBot.chatId}
                                            </code>
                                            <button 
                                                onClick={() => handleCopy(selectedBot.chatId!, 'chatId')}
                                                className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 flex-shrink-0"
                                                title="Скопировать ID"
                                            >
                                                {copiedField === 'chatId' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                  )}
                                </div>

                            </div>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
                            >
                                <Settings size={16} />
                                Настроить
                            </button>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                             <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 ${selectedBot.chatId ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-yellow-900/30 border-yellow-700 text-yellow-400'}`}>
                                {selectedBot.chatId ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Подключен к чату
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={12} />
                                        Нет подключения к чату
                                    </>
                                )}
                             </div>
                             
                             {!selectedBot.chatId && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
                                >
                                    Подключить сейчас
                                </button>
                             )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="text-blue-400" />
                            Тестовое сообщение
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Отправить проверочное сообщение, чтобы убедиться, что бот работает.
                        </p>
                        
                        {selectedBot.chatId ? (
                             <button 
                                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                onClick={() => {
                                    if (selectedBot.chatId && selectedBot.token) {
                                        import('./services/telegramService').then(mod => {
                                            mod.sendMessage(selectedBot.token, selectedBot.chatId!, "👋 Привет! Я на связи.");
                                            alert("Отправлено!");
                                        }).catch(() => alert("Ошибка отправки"));
                                    }
                                }}
                            >
                                Отправить "Привет"
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="w-full py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-200 border border-yellow-700/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Settings size={16} />
                                Настроить Chat ID
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                         <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Github size={20} className="text-purple-400" />
                            Полезные ссылки
                        </h3>
                        <div className="space-y-2">
                             <a 
                                href={`https://t.me/${selectedBot.name.replace(' ', '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block w-full py-2 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors text-center"
                             >
                                Открыть в Telegram
                             </a>
                             <a 
                                href="https://core.telegram.org/bots/api" 
                                target="_blank" 
                                rel="noreferrer"
                                className="block w-full py-2 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors text-center"
                             >
                                API Документация
                             </a>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;