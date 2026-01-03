import React, { useState, useEffect, useRef } from 'react';
import { Header, Dock, FullscreenLoader } from './components/Layout';
import { DashboardView } from './components/Dashboard';
import { ArchiveView } from './components/Archive';
import { AssistantModal } from './components/AssistantModal';
import { CategoryCard } from './components/CategoryCard';
import { AuthView } from './components/Auth';
import { GeminiService, DBService, MemoryService, supabase } from './services';
// Fixed: Removed missing exports CSV_TEMPLATE_HEADER and CSV_TEMPLATE_EXAMPLE which are not used in this file
import { INITIAL_RECORDS } from './constants';
import { MedicalRecord, DashboardWidget, HealthArchive, TreatmentPhase, UserProfile } from './types';
import { float32ToPcm, decodeAudioBuffer, decodeBase64 } from './utils';
import { BookOpen, Pill, Users, Calendar, ArrowRight, HeartPulse, LogOut, Download, Upload, FileSpreadsheet, RotateCcw } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [seniorMode, setSeniorMode] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isEditingArchive, setIsEditingArchive] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'Kore' | 'Puck' | 'Zephyr'>('Kore');
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [phases, setPhases] = useState<TreatmentPhase[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'w1', title: '核心指标趋势', type: 'line', metrics: ['CEA', 'CA199'], isPinned: true },
  ]);
  const [archive, setArchive] = useState<HealthArchive>({
    name: "加载中...",
    age: 0,
    gender: "保密",
    diagnosis: "尚未录入",
    medicalHistory: "请上传您的第一份报告开始建立档案。",
    doctors: [],
    emergency: { name: '尚未设置', relation: '-', phone: '-' }
  });

  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!supabase) {
      setSession({ user: { email: 'guest@preview.mode' } });
      setRecords(INITIAL_RECORDS);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async () => {
    try {
      const [dbRecords, dbPhases, profile] = await Promise.all([
        DBService.getRecords(),
        DBService.getTreatmentPhases(),
        DBService.getProfile()
      ]);
      
      if (dbRecords && dbRecords.length > 0) setRecords(dbRecords);
      setPhases(dbPhases);
      if (profile) {
        setSeniorMode(profile.senior_mode);
        setArchive(prev => ({
          ...prev,
          name: profile.name || prev.name,
          diagnosis: profile.diagnosis || prev.diagnosis,
          medicalHistory: profile.medical_history || prev.medicalHistory
        }));
      }
    } catch (e) {
      console.error("Failed to fetch user data:", e);
    }
  };

  const toggleSeniorMode = async () => {
    const newMode = !seniorMode;
    setSeniorMode(newMode);
    await DBService.updateProfile({ senior_mode: newMode });
  };

  const toggleLiveAI = async () => {
    if (isLiveActive) {
      if (sessionRef.current) sessionRef.current.close();
      setIsLiveActive(false);
      return;
    }
    try {
      const memory = await MemoryService.searchContext("总结用户近期的化验趋势和重点病情");
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = outCtx;

      const callbacks = {
        onopen: async () => {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = inCtx.createMediaStreamSource(stream);
          const processor = inCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const pcm = float32ToPcm(e.inputBuffer.getChannelData(0));
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: { data: pcm, mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(processor);
          processor.connect(inCtx.destination);
          setIsLiveActive(true);
        },
        onmessage: async (msg: any) => {
          const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            const buf = await decodeAudioBuffer(decodeBase64(audio), outCtx);
            const src = outCtx.createBufferSource();
            src.buffer = buf;
            src.connect(outCtx.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            src.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buf.duration;
          }
        },
        onclose: () => setIsLiveActive(false),
        onerror: () => setIsLiveActive(false)
      };

      const systemInstruction = `你是小紫卡AI助手。你拥有病人的历史化验数据记录。请作为专业且温柔的医生助理回答。记忆上下文：${memory}`;
      const promise = GeminiService.connectLive(callbacks, systemInstruction, voiceMode);
      sessionPromiseRef.current = promise;
      sessionRef.current = await promise;
    } catch (e) { 
      setIsLiveActive(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await GeminiService.parseReport(base64, file.type);
        const newRec: MedicalRecord = {
          id: Date.now().toString(),
          date: res.date || new Date().toISOString().split('T')[0],
          type: res.type || 'Blood',
          indicators: res.indicators || {}
        };
        await DBService.saveMedicalRecord(newRec);
        setRecords(prev => [newRec, ...prev]);
        setIsAiOpen(false);
        setActiveTab('monitoring');
        alert("化验单解析成功！已更新到您的雷达中。");
        setIsParsing(false);
      };
      reader.readAsDataURL(file);
    } catch (e) { 
      setIsParsing(false);
    }
  };

  if (!session && supabase) return <AuthView onSuccess={() => {}} />;

  return (
    <div className={`min-h-screen bg-[#FDFCFE] flex flex-col transition-all duration-300 ${seniorMode ? 'text-2xl' : 'text-base'}`} style={{ fontFamily: 'PingFang SC, -apple-system, sans-serif' }}>
      <Header seniorMode={seniorMode} />
      
      <main className={`flex-1 overflow-x-hidden pt-6 px-6 scroll-smooth ${seniorMode ? 'pb-40' : 'pb-24'}`}>
        {activeTab === 'monitoring' && (
          <DashboardView 
            widgets={widgets} 
            records={records} 
            phases={phases}
            seniorMode={seniorMode} 
            onDeleteWidget={(id) => setWidgets(widgets.filter(w => w.id !== id))}
            onAddWidget={() => setIsAiOpen(true)}
            onOpenAI={() => setIsAiOpen(true)}
          />
        )}
        {activeTab === 'archive' && (
          <ArchiveView 
            archive={archive} 
            isEditing={isEditingArchive}
            onToggleEdit={() => setIsEditingArchive(!isEditingArchive)}
            onUpdateArchive={setArchive}
          />
        )}
        {activeTab === 'tools' && (
          <div className="space-y-8 pb-40 animate-in fade-in duration-500">
             <div className="px-1">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">病情管理工具</h2>
             </div>
             <div className="grid grid-cols-1 gap-5">
                <CategoryCard icon={BookOpen} label="诊疗指南" desc="最新权威指南总结" color="bg-blue-50 text-blue-600" />
                <CategoryCard icon={Pill} label="用药管家" desc="副作用监测与提醒" color="bg-orange-50 text-orange-600" />
                <CategoryCard icon={Users} label="病友社区" desc="经验分享与互助" color="bg-green-50 text-green-600" />
             </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-8 pb-40 animate-in fade-in duration-500">
             <div className="px-1"><h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">设置中心</h2></div>
             <div className="space-y-5">
               <div className="bg-white p-8 rounded-[2.5rem] border border-purple-50 shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="bg-pink-50 text-pink-500 rounded-3xl w-14 h-14 flex items-center justify-center"><HeartPulse size={28} /></div>
                      <div><span className="text-lg font-black text-gray-800">适老关怀模式</span></div>
                   </div>
                   <button onClick={toggleSeniorMode} className={`rounded-full transition-all relative ${seniorMode ? 'bg-purple-600 w-28 h-14' : 'bg-gray-200 w-16 h-9'}`}>
                     <div className={`absolute top-1 bg-white rounded-full transition-all shadow-md ${seniorMode ? 'right-1 w-12 h-12' : 'left-1 w-7 h-7'}`} />
                   </button>
                 </div>
               </div>
               <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-3 py-6 text-red-500 font-black hover:bg-red-50 rounded-[2rem] transition-all"><LogOut size={24} /> 退出登录</button>
             </div>
          </div>
        )}
      </main>

      <Dock activeTab={activeTab} onTabChange={setActiveTab} onOpenAI={() => setIsAiOpen(true)} seniorMode={seniorMode} />
      <AssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} isLive={isLiveActive} onToggleLive={toggleLiveAI} onFileUpload={handleFileUpload} />
      {isParsing && <FullscreenLoader label="数据解析同步中..." />}
    </div>
  );
}