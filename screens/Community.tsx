
import React from 'react';

interface CommunityProps {
  // Added isDarkMode to match props passed from App.tsx
  isDarkMode: boolean;
}

const Community: React.FC<CommunityProps> = ({ isDarkMode }) => {
  const communityLinks = [
    {
      name: 'Line OpenChat Community',
      desc: 'ศูนย์แลกเปลี่ยนเรียนรู้ฟิสิกส์และแม่เหล็กไฟฟ้า ร่วมพูดคุยกับเพื่อนๆ ทั่วประเทศ',
      url: 'https://line.me/ti/g2/7tQ1k5WFj7Nx2bcFQOdnEW5qza1j5t3Bkt_83g?utm_source=invitation&utm_medium=link_copy&utm_campaign=default',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-600',
      label: 'OpenChat'
    },
    {
      name: 'Contact Instructor',
      desc: 'ปรึกษาข้อสงสัยโดยตรงกับอาจารย์ผู้สอนผ่าน Line Official Support',
      url: 'https://line.me/ti/p/fQDodwOJBv',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-cyan-500 to-blue-500',
      label: 'Direct Support'
    },
    {
      name: 'Facebook Fanpage',
      desc: 'ติดตามข่าวสาร กิจกรรม และความรู้ฟิสิกส์ใหม่ๆ ได้ที่หน้าเพจของเรา',
      url: 'https://www.facebook.com/share/184zFDe4XE/?mibextid=wwXIfr',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: 'from-blue-600 to-indigo-700',
      label: 'Facebook'
    }
  ];

  return (
    <div className={`h-full overflow-y-auto p-8 md:p-12 pb-32 scrollbar-hide ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center space-x-3 px-6 py-2 border rounded-full ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-950'}`}>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className={`text-xs font-chakra font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-slate-400' : 'text-slate-900'}`}>Connect & Support</span>
          </div>
          <h2 className={`text-5xl md:text-6xl font-chakra font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
            PhyEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Community</span>
          </h2>
          <p className={`max-w-2xl mx-auto font-chakra text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>
            พื้นที่แลกเปลี่ยนเรียนรู้และขอรับคำปรึกษา เพื่อความสำเร็จในภารกิจฟิสิกส์ของคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {communityLinks.map((link, idx) => (
            <a 
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative border rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl ${isDarkMode ? 'bg-slate-900/40 border-white/5 hover:border-white/20' : 'bg-white border-slate-950/10 hover:border-slate-950 shadow-slate-200'}`}
            >
              <div className={`w-24 h-24 shrink-0 bg-gradient-to-br ${link.color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform`}>
                {link.icon}
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                   <h3 className={`font-chakra font-black text-2xl uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{link.name}</h3>
                   <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-900 border-slate-950/10'}`}>
                      {link.label}
                   </span>
                </div>
                <p className={`font-chakra text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{link.desc}</p>
              </div>
              <div className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-full border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white group-hover:bg-white group-hover:text-slate-950' : 'bg-slate-100 border-slate-950/10 text-slate-950 group-hover:bg-slate-950 group-hover:text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div className={`border rounded-[3.5rem] p-12 text-center space-y-6 ${isDarkMode ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border-indigo-500/20' : 'bg-white border-slate-950/10 shadow-xl'}`}>
           <h4 className={`font-chakra font-black text-2xl uppercase ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>ต้องการความช่วยเหลือเพิ่มเติม?</h4>
           <p className={`font-chakra max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              หากคุณพบปัญหาในการใช้งานระบบหรือมีข้อเสนอแนะเกี่ยวกับการเรียนการสอน สามารถติดต่อทีมงานได้ตลอดเวลาผ่านช่องทางด้านบน
           </p>
        </div>
      </div>
    </div>
  );
};

export default Community;
