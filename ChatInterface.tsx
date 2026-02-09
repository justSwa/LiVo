
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Memory, UserProfile } from '../types';
import { gemini } from '../services/geminiService';
import { db } from '../services/firebase';
import { ref, push, set } from 'firebase/database';

interface ChatInterfaceProps {
  history: ChatMessage[];
  user: UserProfile;
  memories: Memory[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, user, memories }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const currentInput = input;
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    const historyRef = ref(db, `users/${user.id}/history`);

    try {
      // 1. Add user message to Realtime Database
      await set(push(historyRef), {
        role: 'user',
        content: currentInput,
        type: currentImage ? 'image' : 'text',
        imageUrl: currentImage || null,
        timestamp: new Date().toISOString(),
      });

      // 2. Process with Gemini
      const responseText = await gemini.processInput(currentInput, history, memories, currentImage || undefined);
      
      // 3. Add assistant message to Realtime Database
      await set(push(historyRef), {
        role: 'assistant',
        content: responseText,
        type: 'text',
        timestamp: new Date().toISOString(),
      });
      
      // 4. Extract memories via Gemini service and save to Realtime Database
      const extracted = await gemini.extractMemories(currentInput, responseText, memories);
      if (extracted.length > 0) {
        const memoryRef = ref(db, `users/${user.id}/memories`);
        for (const item of extracted) {
          await set(push(memoryRef), {
            type: item.type || 'note',
            content: item.content || '',
            timestamp: new Date().toISOString(),
            metadata: item.type === 'goal' ? { progress: 0 } : {}
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      <header className="bg-white/90 backdrop-blur-md border-b border-stone-100 p-4 md:p-6 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-accent rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-md border border-white/10 overflow-hidden shrink-0">
            <i className="fas fa-gem text-xl md:text-2xl animate-pulse"></i>
          </div>
          <div>
            <h2 className="font-black text-stone-900 leading-tight text-base md:text-xl tracking-tight">LiVo Assistant</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] md:text-xs text-stone-900 font-black uppercase tracking-widest">Cloud Synced</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-10 pb-40">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-6 md:space-y-10 animate-fadeIn px-4">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-accent-light rounded-full flex items-center justify-center text-accent text-4xl md:text-5xl border border-accent/10">
              <i className="fas fa-gem"></i>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-stone-900 mb-4 tracking-tight">Welcome back, {user.name}</h3>
              <p className="text-stone-800 font-bold text-lg md:text-xl leading-relaxed">
                I've preserved our history. What's unfolding in your world today?
              </p>
            </div>
          </div>
        )}

        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[75%] rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-sm transition-all hover:shadow-md ${
              msg.role === 'user' 
                ? 'bg-accent text-white rounded-br-none' 
                : 'bg-white text-stone-900 rounded-bl-none border border-accent/10'
            }`}>
              {msg.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-2xl shadow-sm">
                  <img src={msg.imageUrl} className="max-h-64 md:max-h-96 w-full object-cover transition-transform hover:scale-105 duration-500" alt="Memory fragment" />
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed font-bold text-base md:text-xl">{msg.content}</p>
              <div className={`text-[10px] md:text-xs mt-4 md:mt-6 font-black uppercase tracking-widest opacity-70 ${msg.role === 'user' ? 'text-right text-white' : 'text-left text-stone-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white border border-accent/10 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 rounded-bl-none shadow-sm flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce delay-150"></div>
                <div className="w-2.5 h-2.5 bg-accent/30 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="text-xs md:text-sm text-accent font-black uppercase tracking-widest">LiVo is reflecting...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex flex-col items-center pointer-events-auto">
          {selectedImage && (
            <div className="mb-4 relative group">
              <img src={selectedImage} className="h-20 w-20 md:h-28 md:w-28 object-cover rounded-2xl border-4 border-white shadow-2xl" alt="Preview" />
              <button 
                type="button"
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-3 -right-3 bg-stone-900 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-accent transition-all"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          )}
          <div className="w-full bg-white border border-accent/10 rounded-[2rem] md:rounded-[3.5rem] p-2 md:p-3 flex items-center gap-2 md:gap-3 shadow-2xl focus-within:ring-4 focus-within:ring-accent-light transition-all">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-stone-500 hover:text-accent transition-colors rounded-full hover:bg-accent-light"
              title="Share visual fragment"
            >
              <i className="fas fa-image text-lg md:text-2xl"></i>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Exhale your thoughts here..."
              className="flex-1 px-2 md:px-4 py-3 md:py-4 focus:outline-none text-stone-900 font-black text-base md:text-xl placeholder:text-stone-300"
            />
            <button 
              type="submit" 
              disabled={isTyping || (!input.trim() && !selectedImage)} 
              className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-accent text-white rounded-full shadow-lg hover:brightness-110 disabled:bg-stone-100 transition-all active:scale-90"
              title="Send to LiVo"
            >
              <i className="fas fa-paper-plane text-base md:text-xl"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
