import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceArea
} from 'https://esm.sh/recharts@3.6.0';
import { 
  Trash2, Plus, TrendingUp, ChevronRight, Activity, 
  ShieldAlert, Thermometer, Droplet, Stethoscope, Maximize2 
} from 'https://esm.sh/lucide-react@0.562.0';
import { DashboardWidget, MedicalRecord, MonitoringScenario, TreatmentPhase } from '../types';

const SCENARIOS: MonitoringScenario[] = [
  { id: 'tumor', label: '肿瘤标志物趋势', metrics: ['CA199', 'CEA'], description: '动态观察肿瘤负荷变化', icon: 'Activity', color: '#7C3AED' },
  { id: 'chemo', label: '化疗健康监测', metrics: ['HGB', 'WBC', 'NEUT'], description: '骨髓抑制与耐受性评估', icon: 'ShieldAlert', color: '#EC4899' },
  { id: 'cholestasis', label: '胆汁淤积预警', metrics: ['ALP', 'GGT'], description: 'ALP + GGT 联合诊断', icon: 'Droplet', color: '#3B82F6' },
  { id: 'infection', label: '感染指标预警', metrics: ['CRP', 'PCT'], description: 'C反应蛋白与降钙素原监控', icon: 'Thermometer', color: '#F59E0B' },
  { id: 'renal', label: '肾功能安全', metrics: ['UA', 'CREA'], description: '代谢产物排泄能力监测', icon: 'Stethoscope', color: '#10B981' },
];

interface DashboardProps {
  widgets: DashboardWidget[];
  records: MedicalRecord[];
  phases: TreatmentPhase[];
  onDeleteWidget: (id: string) => void;
  onAddWidget: () => void;
  seniorMode: boolean;
  onOpenAI: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ 
  widgets, records, phases, onDeleteWidget, onAddWidget, seniorMode, onOpenAI 
}) => {
  const [activeScenario, setActiveScenario] = useState<string>('tumor');

  const filteredWidgets = React.useMemo(() => {
    const scenario = SCENARIOS.find(s => s.id === activeScenario);
    if (!scenario) return widgets;
    return [{
      id: scenario.id,
      title: scenario.label,
      type: 'line' as const,
      metrics: scenario.metrics,
      isPinned: true
    }];
  }, [activeScenario, widgets]);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className={`${seniorMode ? 'text-4xl' : 'text-3xl'} font-black text-gray-900 tracking-tight`}>指标监测</h2>
          <p className="text-purple-600 font-bold text-[10px] mt-1 uppercase tracking-[0.2em]">Personal Health Radar</p>
        </div>
        <button 
          onClick={onAddWidget}
          className="bg-purple-600 text-white w-14 h-14 rounded-3xl shadow-2xl shadow-purple-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>
      </div>

      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">预设监测方案</h3>
          <span className="flex items-center gap-1 text-[10px] text-purple-400 font-bold"><Maximize2 size={10} /> 建议横屏查看详情</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`flex-shrink-0 px-6 py-5 rounded-[2.2rem] border-2 transition-all duration-500 flex flex-col gap-3 min-w-[150px] ${
                activeScenario === s.id 
                ? 'bg-purple-600 text-white border-purple-600 shadow-[0_15px_30px_-5px_rgba(124,58,237,0.4)]' 
                : 'bg-white text-gray-500 border-gray-50 hover:border-purple-100 hover:shadow-lg'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeScenario === s.id ? 'bg-white/20' : 'bg-purple-50 text-purple-600'}`}>
                {s.id === 'tumor' && <Activity size={20} />}
                {s.id === 'chemo' && <ShieldAlert size={20} />}
                {s.id === 'cholestasis' && <Droplet size={20} />}
                {s.id === 'infection' && <Thermometer size={20} />}
                {s.id === 'renal' && <Stethoscope size={20} />}
              </div>
              <div>
                <span className={`${seniorMode ? 'text-lg' : 'text-sm'} font-black whitespace-nowrap block`}>{s.label}</span>
                <span className="text-[9px] opacity-60 font-medium truncate w-24 block mt-0.5">{s.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredWidgets.map(w => (
          <WidgetCard key={w.id} widget={w} records={records} phases={phases} onDelete={onDeleteWidget} seniorMode={seniorMode} />
        ))}
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-purple-50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
           <TrendingUp size={140} />
        </div>
        <div className="flex items-center gap-3 mb-6">
           <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl"><Stethoscope size={22} /></div>
           <h3 className="font-black text-xl text-gray-900">AI 趋势分析</h3>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm mb-8">
          基于您近期上传的报告，CA19-9 呈显著下降趋势。目前中性粒细胞处于安全范围，建议维持当前营养支持，保持良好心态。
        </p>
        <button onClick={onOpenAI} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-purple-100 active:scale-95 transition-all">
          对话深度讨论 <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const WidgetCard: React.FC<{ 
  widget: DashboardWidget, 
  records: MedicalRecord[], 
  phases: TreatmentPhase[],
  onDelete: (id: string) => void,
  seniorMode: boolean 
}> = ({ widget, records, phases, onDelete, seniorMode }) => {
  const sortedData = React.useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({ 
        name: r.date.slice(5), 
        fullDate: r.date,
        ...r.indicators 
      }));
  }, [records]);

  const colors = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="bg-white p-8 rounded-[2.8rem] shadow-sm border border-purple-50 group transition-all duration-500 hover:shadow-2xl hover:shadow-purple-50/50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className={`${seniorMode ? 'text-2xl' : 'text-lg'} font-black text-gray-900 tracking-tight`}>{widget.title}</h3>
        </div>
        <button onClick={() => onDelete(widget.id)} className="opacity-0 group-hover:opacity-100 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className={`${seniorMode ? 'h-[320px]' : 'h-[260px]'} w-full -ml-4 pr-2`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="8 8" stroke="#f8f8f8" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 800, fill: '#cbd5e1'}} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{fontSize: 10, fontWeight: 800, fill: '#cbd5e1'}} axisLine={false} tickLine={false} hide={seniorMode} />
            <Tooltip 
              contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(124,58,237,0.15)', fontSize: '12px', fontWeight: 'bold', padding: '16px' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold'}} />
            
            {phases.map((p) => (
              <ReferenceArea 
                key={p.id}
                x1={p.start_date.slice(5)} 
                x2={p.end_date ? p.end_date.slice(5) : sortedData[sortedData.length - 1]?.name} 
                fill={p.color} 
                fillOpacity={0.06}
              />
            ))}

            {widget.metrics.map((m, i) => (
              <Line 
                key={m} 
                name={m}
                type="monotone" 
                dataKey={m} 
                stroke={colors[i % colors.length]} 
                strokeWidth={seniorMode ? 6 : 4} 
                dot={{r: 6, fill: '#fff', strokeWidth: 4, stroke: colors[i % colors.length]}} 
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};