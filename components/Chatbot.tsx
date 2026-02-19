
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Screen } from '../types';

interface ChatbotProps {
  onNavigate?: (screen: Screen) => void;
  onQuestionLogged?: (q: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CHATGPT_PROJECT_URL = "https://chatgpt.com/g/g-p-6942c3f733948191b799de8d9a3f4cc2-phyem/project";
const EVALUATION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc1ohpVBkX6yaIDn6iuDduZPhysW0r6E3ET762C_TUd4ZVMVA/viewform";

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Chatbot: React.FC<ChatbotProps> = ({ onNavigate, onQuestionLogged, isOpen, setIsOpen }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'hub' | 'summary'>('chat');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'สวัสดีครับ! ผมคือ PhyEM ผู้นำทางด้านฟิสิกส์ของคุณ 🎯 มีจุดไหนที่ยังสงสัย หรืออยากให้ผมช่วยไกด์วิธีสังเกตในการทดลองไหมครับ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, activeTab]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    if (onQuestionLogged) {
      onQuestionLogged(textToSend.trim());
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: textToSend,
        config: {
          systemInstruction: `คุณคือ "PhyEM Guide" ผู้ช่วยสอนฟิสิกส์ที่ทำหน้าที่ "ผู้นำทาง" ห้ามเป็น "ผู้เฉลย" โดยเด็ดขาด
          
          เป้าหมายของคุณ: กระตุ้นให้นักเรียนคิดและค้นพบคำตอบด้วยตนเองผ่านการสังเกตและวิเคราะห์ทฤษฎี
          
          กฎเหล็กของการเป็นไกด์:
          1. ห้ามเฉลยคำตอบตรงๆ (NO DIRECT ANSWERS): แม้นักเรียนจะขอร้องหรือถามตรงๆ ว่า "ข้อนี้ตอบอะไร" หรือ "สรุปผลว่ายังไง" ให้ตอบเลี่ยงไปใช้การตั้งคำถามแทน
          2. ใช้การตั้งคำถามย้อนกลับ (Socratic Method): เมื่อนักเรียนถามคำตอบ ให้ถามเขากลับถึงสิ่งที่เขาเห็น เช่น "นักเรียนสังเกตเห็นอะไรใน Simulation ตอนปรับค่า N?" หรือ "ในวิดีโอตอนตอกไข่ลงหน้าเตาโดยตรง มีควันหรือความร้อนเกิดขึ้นที่ไข่ไหม?"
          3. การให้คำใบ้เป็นลำดับขั้น (Scaffolding):
             - ขั้นที่ 1: ให้สังเกตปรากฏการณ์ (เช่น การสั่น การเปลี่ยนสี หรืออุณหภูมิใน Sim)
             - ขั้นที่ 2: ให้ทบทวนหลักการพื้นฐาน (เช่น ความแตกต่างระหว่างตัวนำกับฉนวน, กฎของฟาราเดย์)
             - ขั้นที่ 3: ให้เชื่อมโยงความสัมพันธ์ (เช่น "ถ้าสนามแม่เหล็กเปลี่ยน แต่ไม่มีโลหะ จะเกิดกระแสไฟฟ้าได้ไหม?")
          4. สนับสนุนการเขียน CER: 
             - ช่วยไกด์วิธีหา Evidence จากวิดีโอ (สังเกตผลที่เกิดขึ้น)
             - ช่วยไกด์วิธีเขียน Reasoning (เชื่อมโยงหลักการ Eddy Current เข้ากับความร้อน) โดยไม่เขียนประโยคให้ทั้งหมด
          
          โทนเสียงและสไตล์:
          - ให้กำลังใจ สนุกสนาน และทำให้นักเรียนรู้สึกว่าเขากำลังทำภารกิจที่ท้าทาย
          - ใช้สัญลักษณ์: 🎯 (ภารกิจ/จุดสังเกต), 💡 (คำใบ้/ไอเดีย), 🧪 (การทดลอง), 📊 (หลักฐาน)`,
        },
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'ขออภัยครับ ลองถามใหม่อีกครั้งนะ' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อครับ' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string, index: number) => {
    if (isSpeakingId !== null) return;
    setIsSpeakingId(index);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO], 
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeakingId(null);
        source.start();
      } else {
        setIsSpeakingId(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeakingId(null);
    }
  };

  const handleQuickNav = (screen: Screen) => {
    if (onNavigate) {
      onNavigate(screen);
      if (window.innerWidth < 768) setIsOpen(false); 
    }
  };

  const conceptualSummaries = [
    { title: 'Electromagnetic Induction', desc: 'การสร้างกระแสไฟฟ้าในตัวนำโดยใช้สนามแม่เหล็กที่เปลี่ยนแปลงตามเวลา', icon: '🧲' },
    { title: 'Eddy Currents', desc: 'กระแสไฟฟ้าที่ไหลวนในตัวนำโลหะเมื่ออยู่ในสนามแม่เหล็กที่เปลี่ยนแปลง ก่อให้เกิดความร้อนสูง', icon: '🌀' },
    { title: 'Ferromagnetic Material', desc: 'วัสดุที่ตอบสนองต่อแม่เหล็กได้ดี (เช่น เหล็ก) จำเป็นต่อการทำงานของเตาเหนี่ยวนำ', icon: '🧱' },
    { title: 'Insulator Response', desc: 'วัสดุฉนวน (เช่น แก้ว, ไข่) ไม่มีอิเล็กตรอนอิสระเพียงพอที่จะเกิด Eddy Current จึงไม่ร้อน', icon: '🚫' }
  ];

  const navItems = [
    { screen: Screen.ENGAGEMENT, label: 'Engagement', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />, color: 'bg-orange-500' },
    { screen: Screen.CHALLENGE, label: 'Exploration', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, color: 'bg-emerald-500' },
    { screen: Screen.VIRTUAL_LAB, label: 'Explore', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.722 2.528a2 2 0 00.535 2.093l1.847 1.847a2 2 0 002.106.535L20.353 22a2 2 0 001.414-1.96l-.477-2.387a2 2 0 00-.547-1.022z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 12a3 3 0 100-6 3 3 0 000 6z" />, color: 'bg-cyan-500' },
    { screen: Screen.EXPLANATION, label: 'Explain', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />, color: 'bg-indigo-500' },
    { screen: Screen.RESOURCE_HUB, label: 'Elaborate', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />, color: 'bg-purple-500' }
  ];

  return (
    <div className={`fixed bottom-28 right-10 z-[120] transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
      <div className="w-[350px] md:w-[450px] bg-slate-900 border-2 border-indigo-500/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[75vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-chakra font-black text-xl italic shadow-lg">Phy</div>
            <div>
              <h3 className="text-white font-chakra font-black uppercase text-lg leading-none">PhyEM AI Guide</h3>
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">Advanced Learning Companion</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs Selection */}
        <div className="flex border-b border-white/5 shrink-0 bg-black/20 overflow-x-auto no-scrollbar">
          {[
            { id: 'chat', label: 'Support Chat' },
            { id: 'summary', label: 'สรุปแนวคิด' },
            { id: 'hub', label: 'Navigation' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 font-chakra font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap px-4 border-b-2 ${
                activeTab === tab.id 
                ? 'bg-white/5 text-indigo-400 border-indigo-500' 
                : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[350px] scroll-smooth bg-[#0a0a0c]">
          {activeTab === 'chat' && (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-chakra font-bold leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}`}>
                    {m.text}
                    {m.role === 'ai' && (
                      <button 
                        onClick={() => speakMessage(m.text, i)}
                        className={`ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors ${isSpeakingId === i ? 'animate-pulse text-cyan-400' : 'text-white/30'}`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* ChatGPT Quick Action */}
              <div className="pt-4">
                <a 
                  href={CHATGPT_PROJECT_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full p-4 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <div>
                       <p className="text-[10px] font-chakra font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Advanced AI Tutor</p>
                       <p className="text-xs font-bold text-white">Ask anything to ChatGPT</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/30 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" /></svg>
                </a>
              </div>
            </>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4 animate-in fade-in duration-500">
               <div className="flex items-center gap-3 px-2 mb-4">
                  <span className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                  <h4 className="text-white font-chakra font-black uppercase text-xs tracking-widest">Scientific Concepts Summary</h4>
               </div>
               {conceptualSummaries.map((s, idx) => (
                 <div key={idx} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex gap-5 group hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                       {s.icon}
                    </div>
                    <div>
                       <h5 className="font-chakra font-black text-xs text-indigo-400 uppercase mb-1 tracking-tight">{s.title}</h5>
                       <p className="text-[11px] font-chakra font-bold text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                 </div>
               ))}
               
               <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <p className="text-[10px] font-chakra font-bold text-cyan-200 uppercase tracking-widest leading-relaxed">
                     "ความลับคือ 'การสั่น' ของสนามแม่เหล็กที่ก่อให้เกิดพายุอิเล็กตรอน (Eddy Current) ในโลหะ"
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'hub' && (
            <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-500">
              <p className="text-[10px] font-chakra font-black uppercase text-slate-500 tracking-[0.2em] mb-2 px-2">Navigation Control</p>
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickNav(item.screen)}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                  </div>
                  <span className="font-chakra font-black uppercase text-[10px] text-white tracking-widest">{item.label}</span>
                  <svg className="w-4 h-4 ml-auto text-white/20 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Control */}
        {activeTab === 'chat' && (
          <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3 shrink-0">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ถามคำถามหรือขอคำใบ้..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-chakra font-bold text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-20 shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-black/60 flex justify-between items-center shrink-0 border-t border-white/5">
           <a href={CHATGPT_PROJECT_URL} target="_blank" rel="noopener noreferrer" className="text-[9px] font-chakra font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">ChatGPT Tutor</a>
           <a href={EVALUATION_URL} target="_blank" rel="noopener noreferrer" className="text-[9px] font-chakra font-black text-slate-500 uppercase tracking-widest hover:text-slate-400">Feedback Form</a>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
