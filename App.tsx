
import React, { useState, useCallback, useEffect } from 'react';
import { Screen, VideoObservation, CERState, StudentReport } from './types';
import Login from './screens/Login';
import Engagement from './screens/Engagement';
import Challenge from './screens/Challenge';
import VirtualLab from './screens/VirtualLab';
import Explanation from './screens/Explanation';
import Collaboration from './screens/Collaboration';
import ResourceHub from './screens/ResourceHub';
import Community from './screens/Community';
import ThankYou from './screens/ThankYou';
import AdminReport from './screens/AdminReport';
import Chatbot from './components/Chatbot';
import { LMSService } from './services/lmsService';

// หมายเหตุ: วาง URL ของ Google Apps Script Web App ที่นี่
// ซึ่งเชื่อมต่อกับ Sheet: https://docs.google.com/spreadsheets/d/12lat2Ju6i0jpaQpkRbRFzuHTUN8nk-qwVpsdKJJIJVs/edit?gid=0#gid=0
const CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycby_placeholder/exec"; 

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [userInfo, setUserInfo] = useState<{name: string, id: string} | null>(null);
  const [observations, setObservations] = useState<VideoObservation[]>([]);
  const [cerState, setCerState] = useState<CERState>({
    claim: '',
    evidence: '',
    reasoning: '',
  });
  const [questionsTracked, setQuestionsTracked] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [materialsTested, setMaterialsTested] = useState<string[]>([]);
  const [collaborationBonus, setCollaborationBonus] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    LMSService.initialize();
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (name: string, unused: string, id: string) => {
    setUserInfo({ name, id });
    setCurrentScreen(Screen.ENGAGEMENT);
    setShowGuide(true);
  };

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const resetProject = useCallback(() => {
    setObservations([]);
    setCerState({ claim: '', evidence: '', reasoning: '' });
    setQuestionsTracked([]);
    setQuizScore(0);
    setMaterialsTested([]);
    setCollaborationBonus(0);
    navigateTo(Screen.CHALLENGE);
  }, [navigateTo]);

  const logQuestion = useCallback((q: string) => {
    setQuestionsTracked(prev => [...prev, q]);
  }, []);

  // ฟังก์ชันส่งข้อมูลไป Cloud (Google Sheet)
  const syncToCloud = async (report: StudentReport) => {
    if (!CLOUD_SYNC_URL || CLOUD_SYNC_URL.includes("placeholder")) {
      console.warn("Cloud Sync URL is not configured. Data saved locally only.");
      return;
    }
    
    try {
      // ใช้ fetch แบบ POST เพื่อส่งข้อมูลไปยัง Google Apps Script
      await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...report,
          action: 'submit_report'
        })
      });
      console.log("Cloud sync initiated for user:", report.userName);
    } catch (err) {
      console.error("Cloud sync failed:", err);
    }
  };

  const saveFinalReport = useCallback((rating: number, comment: string) => {
    if (!userInfo) return;
    
    const finalScore = 100 + collaborationBonus;
    
    const newReport: StudentReport = {
      id: Math.random().toString(36).substr(2, 9),
      userName: userInfo.name,
      studentId: userInfo.id,
      timestamp: new Date().toISOString(),
      cer: cerState,
      observationsCount: observations.length,
      observationNotes: observations.map(o => o.text),
      questionsAsked: questionsTracked,
      aiFeedback: "",
      lmsStatus: 'completed',
      score: finalScore,
      quizScore: quizScore,
      totalQuizQuestions: 5,
      materialsTested: Array.from(new Set(materialsTested)),
      collaborationBonus: collaborationBonus,
      starRating: rating,
      feedbackComment: comment
    };

    const existing = JSON.parse(localStorage.getItem('phyem_student_reports') || '[]');
    localStorage.setItem('phyem_student_reports', JSON.stringify([...existing, newReport]));
    
    // ส่งข้อมูลไป Cloud อัตโนมัติ
    syncToCloud(newReport);
    
    LMSService.reportScore(finalScore);
  }, [userInfo, cerState, observations, questionsTracked, quizScore, materialsTested, collaborationBonus]);

  const renderScreen = () => {
    const screenProps = { isDarkMode };
    switch (currentScreen) {
      case Screen.LOGIN:
        return <Login onLogin={handleLogin} {...screenProps} />;
      case Screen.ENGAGEMENT:
        return (
          <Engagement 
            onNext={(score) => {
              setQuizScore(score);
              navigateTo(Screen.CHALLENGE);
            }} 
            {...screenProps} 
          />
        );
      case Screen.CHALLENGE:
        return <Challenge onStart={() => navigateTo(Screen.VIRTUAL_LAB)} {...screenProps} />;
      case Screen.VIRTUAL_LAB:
        return (
          <VirtualLab 
            onRecord={(obs) => setObservations(prev => [...prev, obs])} 
            onMaterialTest={(mat) => setMaterialsTested(prev => [...prev, mat])}
            recordedData={observations}
            onNext={() => navigateTo(Screen.RESOURCE_HUB)}
            {...screenProps}
          />
        );
      case Screen.RESOURCE_HUB:
        return (
          <ResourceHub 
            onNavigate={navigateTo} 
            onNext={() => navigateTo(Screen.EXPLANATION)} 
            onOpenChat={() => setIsChatOpen(true)}
            {...screenProps} 
          />
        );
      case Screen.EXPLANATION:
        return (
          <Explanation 
            observations={observations}
            cerState={cerState}
            setCerState={setCerState}
            onNext={() => navigateTo(Screen.COLLABORATION)}
            onBack={() => navigateTo(Screen.RESOURCE_HUB)}
            {...screenProps}
          />
        );
      case Screen.COLLABORATION:
        return (
          <Collaboration 
            cerState={cerState}
            collaborationBonus={collaborationBonus}
            setCollaborationBonus={setCollaborationBonus}
            onBack={() => navigateTo(Screen.EXPLANATION)}
            onFinish={() => navigateTo(Screen.THANK_YOU)}
            {...screenProps}
          />
        );
      case Screen.COMMUNITY:
        return <Community {...screenProps} />;
      case Screen.THANK_YOU:
        return <ThankYou onRestart={resetProject} onFinalSubmit={saveFinalReport} {...screenProps} />;
      case Screen.ADMIN_REPORT:
        return <AdminReport {...screenProps} />;
      default:
        return <Login onLogin={handleLogin} {...screenProps} />;
    }
  };

  const getScreenLabel = (s: Screen) => {
    switch(s) {
      case Screen.ENGAGEMENT: return 'Engage';
      case Screen.CHALLENGE: return 'Explore';
      case Screen.VIRTUAL_LAB: return 'Explain';
      case Screen.EXPLANATION: return 'Evaluate';
      case Screen.RESOURCE_HUB: return 'Elaborate';
      case Screen.COLLABORATION: return 'Review';
      case Screen.COMMUNITY: return 'Community';
      case Screen.ADMIN_REPORT: return 'Report';
      default: return s;
    }
  };

  const menuOrder = [
    Screen.ENGAGEMENT,
    Screen.CHALLENGE,
    Screen.VIRTUAL_LAB,
    Screen.RESOURCE_HUB,
    Screen.EXPLANATION,
    Screen.COLLABORATION,
    Screen.COMMUNITY,
    Screen.ADMIN_REPORT
  ];

  const guideSteps = [
    { step: '01', title: 'Engage', desc: 'ทำแบบทดสอบความรู้เบื้องต้นเรื่องเตาชนิดต่างๆ', icon: '🎯' },
    { step: '02', title: 'Explore', desc: 'ทดลองในสถานการณ์ปัญหาและบันทึกผลลงในใบงาน', icon: '🔍' },
    { step: '03', title: 'Explain', desc: 'รับชมวิดีโอการทดลองจริงและบันทึกข้อสังเกต', icon: '📺' },
    { step: '04', title: 'Elaborate', desc: 'ศึกษาทฤษฎีเพิ่มเติมจาก Resource Hub และทดลอง Sim', icon: '💡' },
    { step: '05', title: 'Evaluate', desc: 'สร้างคำอธิบายทางวิทยาศาสตร์รูปแบบ CER (Claim-Evidence-Reasoning)', icon: '📝' },
    { step: '06', title: 'Review', desc: 'แลกเปลี่ยนความรู้กับเพื่อนในเว็บบอร์ด (โบนัส +2 ต่อการตอบ)', icon: '🤝' },
    { step: '07', title: 'Finish', desc: 'ประเมินความพึงพอใจและบันทึกรายงานฉบับสมบูรณ์', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-white dark:bg-black overflow-x-hidden">
      <header className={`backdrop-blur-2xl border-b p-4 md:p-6 sticky top-0 z-[60] transition-all duration-300 ${isDarkMode ? 'bg-black/80 border-white/5 shadow-none' : 'bg-white/95 border-slate-950 shadow-md'}`}>
        <div className="max-w-[1700px] mx-auto flex flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 md:p-3 rounded-xl shadow-lg">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden xl:block">
              <h1 className={`text-xl md:text-2xl font-chakra font-black tracking-tighter uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>PhyEM</h1>
            </div>
          </div>
          
          <nav className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 flex-nowrap scroll-smooth justify-start xl:justify-center">
            {menuOrder.map((s) => {
              if (!userInfo && s !== Screen.LOGIN) return null;
              
              return (
                <button
                  key={s}
                  onClick={() => navigateTo(s as Screen)}
                  className={`px-4 md:px-5 py-2.5 md:py-4 rounded-xl text-[14px] md:text-[20px] font-chakra font-black tracking-wider transition-all uppercase whitespace-nowrap border-2 ${
                    currentScreen === s 
                      ? isDarkMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-950 text-white border-slate-950 shadow-lg scale-105'
                      : isDarkMode ? 'text-slate-400 border-transparent hover:text-cyan-400 hover:bg-white/5' : 'text-slate-600 border-transparent hover:border-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {getScreenLabel(s as Screen)}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0 overflow-y-auto">
        {renderScreen()}
      </main>

      {/* Guide Modal Implementation */}
      {showGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 md:p-12 border-4 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-950 text-slate-950'}`}>
            <button 
              onClick={() => setShowGuide(false)}
              className="absolute top-8 right-8 p-3 hover:bg-red-500 hover:text-white rounded-full transition-all"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="space-y-10">
              <div className="text-center space-y-4">
                <span className="text-cyan-500 font-chakra font-black text-sm uppercase tracking-widest">PhyEM Mission Briefing</span>
                <h2 className="text-3xl md:text-5xl font-chakra font-black uppercase tracking-tighter">คู่มือการใช้งานระบบ</h2>
                <p className="font-chakra font-bold opacity-60">"ทำตามขั้นตอนเพื่อไขปริศนาพลังงานความร้อนเหนี่ยวนำ"</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {guideSteps.map((g, i) => (
                  <div key={i} className={`p-6 rounded-2xl border-2 flex items-center gap-6 transition-all hover:translate-x-2 ${isDarkMode ? 'bg-black/40 border-white/5 hover:bg-white/5' : 'bg-slate-50 border-slate-100 hover:bg-white shadow-sm'}`}>
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0">
                      {g.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{g.icon}</span>
                        <h4 className="font-chakra font-black text-lg uppercase leading-none">{g.title}</h4>
                      </div>
                      <p className="text-sm font-chakra font-bold opacity-70 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-chakra font-black uppercase text-xl rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
              >
                เข้าใจแล้ว! เริ่มภารกิจ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-10 right-10 flex flex-col gap-6 items-center z-[110]">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 border-2 ${isDarkMode ? 'bg-black border-white/10 text-amber-500 shadow-indigo-500/20' : 'bg-white border-slate-950 text-slate-950 shadow-slate-200'}`}
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={3}/></svg>
          ) : (
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth={3}/></svg>
          )}
        </button>

        <button 
          onClick={() => setShowGuide(true)}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-95 border-2 ${isDarkMode ? 'bg-black border-white/10 text-cyan-500 shadow-indigo-500/20' : 'bg-white border-slate-950 text-slate-950 shadow-slate-200'}`}
          title="Guide"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={3}/></svg>
        </button>

        <Chatbot onNavigate={navigateTo} onQuestionLogged={logQuestion} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      </div>
    </div>
  );
};

export default App;
