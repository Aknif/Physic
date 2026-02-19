
import React, { useState } from 'react';

interface EngagementProps {
  onNext: (score: number) => void;
  isDarkMode: boolean;
}

interface Option {
  id: string;
  label: string;
}

interface QuizStep {
  image: string;
  correctId: string;
  title: string;
  hint: string;
  explanation: string;
  videoEmbedId?: string;
  customOptions?: Option[];
}

const Engagement: React.FC<EngagementProps> = ({ onNext, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  const defaultOptions: Option[] = [
    { id: 'gas', label: 'เตาแก๊ส' },
    { id: 'electric', label: 'เตาไฟฟ้าเซรามิก' },
    { id: 'induction', label: 'เตาแม่เหล็กไฟฟ้า' },
    { id: 'infrared', label: 'เตาอินฟราเรด' }
  ];

  const quizSteps: QuizStep[] = [
    {
      image: "https://www.kitchen-form.com/wp-content/uploads/2014/11/%E0%B9%80%E0%B8%95%E0%B8%B2%E0%B9%81%E0%B8%81%E0%B9%8A%E0%B8%AA.jpg",
      correctId: 'gas',
      title: "ข้อ 1: เตานี้คือเตาอะไร?",
      hint: "สังเกตหัวเตาที่มีลักษณะยกสูงและมีช่องปล่อยแก๊สเพื่อจุดไฟ",
      explanation: "เตาแก๊ส (Gas Stove) ให้ความร้อนจากการเผาไหม้เชื้อเพลิงแก๊สโดยตรง เกิดเป็นเปลวไฟที่ถ่ายโอนความร้อนสู่ภาชนะ"
    },
    {
      image: "https://image.makewebcdn.com/makeweb/m_1200x600/Oj6g4XrJ0/GASINDUCTIONCOOKER/GS_892.png",
      correctId: 'infrared',
      title: "ข้อ 2: เตานี้คือเตาอะไร?",
      hint: "สังเกตแผ่นเซรามิกที่มีรูพรุนขนาดเล็กจำนวนมากเพื่อแผ่ความร้อนแบบอินฟราเรด",
      explanation: "เตาอินฟราเรด (Infrared Stove) ใช้การแผ่รังสีอินฟราเรดจากแผ่นเซรามิก ทำให้ไม่มีเปลวไฟพุ่งออกมาเหมือนเตาแก๊สปกติ แต่ให้ความร้อนสูง"
    },
    {
      image: "https://image.makewebcdn.com/makeweb/m_1920x0/MTA9mKOUO/DefaultData/70if_1_1.jpg",
      correctId: 'electric',
      title: "ข้อ 3: เตานี้คือเตาอะไร?",
      hint: "หน้าเตาแบนเรียบ มีวงกลมแสดงตำแหน่งขดลวดความร้อนใต้กระจกเซรามิก",
      explanation: "เตาไฟฟ้า (Electric Ceramic Stove) ใช้ความร้อนจากขดลวดไฟฟ้าใต้กระจก หน้าเตาจะร้อนจัดจนเป็นสีแดงเมื่อทำงาน"
    },
    {
      image: "https://majestic-home.co.th/wp-content/uploads/2021/08/SI964NM.jpg",
      correctId: 'induction',
      title: "ข้อ 4: เตานี้คือเตาอะไร?",
      hint: "ดีไซน์หรูหรา หน้าเตาไม่ร้อนจัดขณะทำงาน (ยกเว้นความร้อนสะท้อนจากภาชนะ)",
      explanation: "เตาแม่เหล็กไฟฟ้า (Induction Stove) ใช้สนามแม่เหล็กเหนี่ยวนำให้เกิดความร้อนในภาชนะโลหะโดยตรง หน้าเตาไม่ได้ร้อนด้วยตัวเอง"
    },
    {
      image: "https://techbox.techinfus.com/wp-content/uploads/2019/10/foto4.UOnxA_.jpg",
      correctId: 'induction_diff',
      title: "ข้อ 5: เตาแม่เหล็กไฟฟ้า กับ เตาไฟฟ้า ต่างกันอย่างไร?",
      hint: "", 
      explanation: "เตาไฟฟ้าใช้ 'การนำความร้อน' จากหน้าเตาที่ร้อนจัด ส่วนเตาแม่เหล็กไฟฟ้าใช้ 'การเหนี่ยวนำ' ให้เกิดความร้อนที่ก้นภาชนะโดยตรง ทำให้หน้าเตาไม่ร้อนและประหยัดพลังงานกว่า",
      videoEmbedId: "7431979001654119687", 
      customOptions: [
        { id: 'induction_diff', label: 'การนำความร้อน vs การเหนี่ยวนำ' },
        { id: 'gas_diff', label: 'การใช้แก๊ส vs การใช้ไฟฟ้า' },
        { id: 'temp_diff', label: 'การแผ่รังสี vs การพาความร้อน' },
        { id: 'no_diff', label: 'ไม่มีความแตกต่างกัน' }
      ]
    }
  ];

  const currentQuiz = quizSteps[currentStep];
  const activeOptions = currentQuiz.customOptions || defaultOptions;
  const trackingClass = "tracking-standard-15";

  const handleNextStep = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsRevealed(false);
      setSelectedOption(null);
    } else {
      onNext(totalScore);
    }
  };

  const handleReveal = () => {
    if (selectedOption) {
      if (selectedOption === currentQuiz.correctId) {
        setTotalScore(prev => prev + 1);
      }
      setIsRevealed(true);
    }
  };

  return (
    <div className="h-full relative flex flex-col items-center p-6 overflow-y-auto scrollbar-hide bg-transparent">
      <div className="max-w-4xl w-full relative z-10 space-y-8 flex flex-col items-center py-10">
        
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center space-x-3 px-6 py-2 border-2 rounded-full ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-950'}`}>
            <span className={`text-xs font-black uppercase ${isDarkMode ? 'text-cyan-400' : 'text-cyan-800'} ${trackingClass}`}>
              Question {currentStep + 1} of {quizSteps.length}
            </span>
          </div>
          <h2 className={`text-3xl md:text-5xl font-chakra font-black uppercase leading-tight text-center ${isDarkMode ? 'text-white' : 'text-slate-950'} ${trackingClass}`}>
             <span className={`text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600`}>{currentQuiz.title}</span>
          </h2>
        </div>

        <div className={`w-full rounded-[3.5rem] border-4 overflow-hidden flex flex-col shadow-2xl transition-all duration-700 ${
          isRevealed ? (selectedOption === currentQuiz.correctId ? 'border-emerald-500' : 'border-rose-500') : isDarkMode ? 'bg-slate-900 border-slate-950' : 'bg-white border-slate-950 shadow-[12px_12px_0px_#020617]'
        }`}>
          
          {!isRevealed ? (
            <div className="h-[300px] md:h-[450px] w-full bg-slate-950 relative overflow-hidden group">
              <img 
                key={currentQuiz.image}
                src={currentQuiz.image} 
                alt="Stove Quiz" 
                className={`w-full h-full object-cover transition-all duration-1000 animate-in fade-in opacity-90`}
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              <div className="absolute top-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-xl font-chakra font-black text-[10px] uppercase shadow-lg z-20">
                Visual Analysis
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-950 relative flex flex-col items-center py-8">
              {currentQuiz.videoEmbedId ? (
                <div className="w-full max-w-[325px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-500/30">
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${currentQuiz.videoEmbedId}`}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img 
                  src={currentQuiz.image} 
                  alt="Stove Reveal" 
                  className="w-full h-[300px] md:h-[450px] object-cover scale-105 animate-in zoom-in duration-500"
                />
              )}
              <div className="absolute top-6 right-6 px-4 py-2 bg-emerald-600 text-white rounded-xl font-chakra font-black text-[10px] uppercase shadow-lg z-20">
                Reveal Analysis
              </div>
            </div>
          )}

          <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-6">
              {currentQuiz.hint && (
                <p className={`text-lg font-chakra font-bold italic leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  💡 คำใบ้: {currentQuiz.hint}
                </p>
              )}

              {!isRevealed ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 font-chakra font-bold text-lg transition-all transform active:scale-95 ${
                        selectedOption === opt.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : isDarkMode ? 'bg-slate-950 border-white/5 text-slate-300 hover:border-cyan-500' : 'bg-slate-50 border-slate-950 text-slate-950 hover:border-indigo-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOption === opt.id ? 'border-white bg-white/20' : 'border-current'}`}>
                        {selectedOption === opt.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className={`p-6 rounded-3xl border-2 flex items-center gap-6 ${selectedOption === currentQuiz.correctId ? 'bg-emerald-500/10 border-emerald-500' : 'bg-rose-500/10 border-rose-500'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${selectedOption === currentQuiz.correctId ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                      {selectedOption === currentQuiz.correctId ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-2xl font-chakra font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                        {selectedOption === currentQuiz.correctId ? 'ถูกต้อง!' : 'ยังไม่ถูกนะ'}
                        <span className="ml-3 opacity-60">
                           {activeOptions.find(o => o.id === currentQuiz.correctId)?.label}
                        </span>
                      </h4>
                    </div>
                  </div>
                  
                  <div className={`p-8 rounded-[2.5rem] border-2 space-y-4 ${isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-950/10'}`}>
                    <h5 className="font-chakra font-black text-sm text-cyan-600 uppercase tracking-[0.2em]">Scientific Explanation:</h5>
                    <p className={`text-xl font-chakra font-bold leading-relaxed ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      “{currentQuiz.explanation}”
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isRevealed ? (
              <button 
                onClick={handleReveal}
                disabled={!selectedOption}
                className={`w-full py-7 rounded-[2rem] font-chakra font-black text-2xl uppercase transition-all shadow-xl ${
                  selectedOption 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95' 
                  : 'bg-slate-800 text-slate-600 opacity-20'
                } ${trackingClass}`}
              >
                ตรวจคำตอบ (Reveal Answer)
              </button>
            ) : (
              <button 
                onClick={handleNextStep}
                className={`w-full py-7 rounded-[2rem] font-chakra font-black text-2xl uppercase transition-all shadow-xl flex items-center justify-center gap-4 ${
                  isDarkMode ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
                } ${trackingClass}`}
              >
                <span>{currentStep < quizSteps.length - 1 ? 'ข้อถัดไป (Next Step)' : 'เข้าสู่บทเรียน (Start Mission)'}</span>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {quizSteps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${
                i === currentStep ? 'w-12 bg-cyan-500' : i < currentStep ? 'w-6 bg-emerald-500' : 'w-6 bg-slate-300 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Engagement;
