import React, { useState, useEffect, useMemo } from 'react';
import { StatDefinition, StatValue, Category, DailyLog, Task, TrackerType } from './types';
import { PlusIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, AdjustmentsIcon, CalendarIcon, CheckIcon } from './icons';

// ... (Keep the rest of the file exactly the same as previous turn, just ensures imports are './types' and './icons')
// ... (Copy content from previous turn's Statistics.tsx, it is correct, just verify the first line imports)

// Since I cannot provide partials, here is the full file again with correct imports:

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface StatisticsProps {
  categories: Category[];
  dailyLogs: { [date: string]: DailyLog };
  statDefinitions: StatDefinition[];
  statValues: StatValue[];
  onOpenTrackerManager: () => void;
  onUpdateStatValue: (date: string, definitionId: string, value: number | boolean | null) => void;
}

type TimeView = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const MIN_DATE = new Date('2025-01-01');

const formatDate = (d: Date) => d.toISOString().split('T')[0];

const calculateCompletion = (tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const valuePerTask = 100 / tasks.length;
    let totalPercentage = 0;
    tasks.forEach(task => {
        if (task.subtasks && task.subtasks.length > 0) {
            const completedSubtasks = task.subtasks.filter(st => st.completed).length;
            totalPercentage += (completedSubtasks / task.subtasks.length) * valuePerTask;
        } else if (task.completed) {
            totalPercentage += valuePerTask;
        }
    });
    return Math.round(totalPercentage);
};

const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0,0,0,0);
    return start;
};

const Statistics: React.FC<StatisticsProps> = ({ 
    categories, dailyLogs, statDefinitions, statValues, onOpenTrackerManager, onUpdateStatValue
}) => {
  const [tableView, setTableView] = useState<TimeView>('weekly');
  const [tableRefDate, setTableRefDate] = useState(formatDate(new Date())); 
  const [graphView, setGraphView] = useState<TimeView>('daily');
  const [graphCustomStart, setGraphCustomStart] = useState(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [graphCustomEnd, setGraphCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const [trendMetricIndex, setTrendMetricIndex] = useState(0);
  const [isTrendOpen, setIsTrendOpen] = useState(true);
  const [isComparativeOpen, setIsComparativeOpen] = useState(true);

  const getGlobalCompletion = (date: string): number => {
    const log = dailyLogs[date];
    return log ? calculateCompletion(log.tasks) : 0;
  };

  const getCellValue = (date: string, def: StatDefinition): number | boolean | null => {
    const override = statValues.find(v => v.date === date && v.stat_definition_id === def.id);
    if (override) {
        if (def.type === 'check') return override.value === 1;
        return override.value;
    }

    if (def.linked_category_id) {
        const log = dailyLogs[date];
        if (!log) return null;
        const tasks = def.linked_category_id === 'all' 
            ? log.tasks 
            : log.tasks.filter(t => t.categoryId === def.linked_category_id);
        if (tasks.length === 0) return null;
        return calculateCompletion(tasks);
    }
    return null;
  };

  const generateTableColumns = () => {
    const current = new Date(tableRefDate);
    const cols: string[] = [];
    if (tableView === 'daily') {
        cols.push(tableRefDate);
    } else if (tableView === 'weekly') {
        const start = getStartOfWeek(current);
        for (let i = 0; i < 5; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + (i * 7));
            if (d >= MIN_DATE) cols.push(formatDate(d));
        }
    } else if (tableView === 'monthly') {
        const year = current.getFullYear();
        for (let i = 0; i < 12; i++) cols.push(`${year}-${String(i+1).padStart(2, '0')}`);
    } else if (tableView === 'yearly') {
        const startYear = 2025;
        const endYear = new Date().getFullYear() + 1;
        for (let y = startYear; y <= endYear; y++) cols.push(y.toString());
    }
    return cols;
  };

  const tableColumns = useMemo(generateTableColumns, [tableView, tableRefDate]);

  const navigateTable = (direction: number) => {
    const d = new Date(tableRefDate);
    if (tableView === 'daily') d.setDate(d.getDate() + direction);
    else if (tableView === 'weekly') d.setDate(d.getDate() + (direction * 35));
    else if (tableView === 'monthly') d.setFullYear(d.getFullYear() + direction);
    setTableRefDate(formatDate(d));
  };

  const generateGraphDates = () => {
    let start = new Date();
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (graphView === 'daily') start.setDate(end.getDate() - 29);
    else if (graphView === 'weekly') start.setDate(end.getDate() - (12 * 7));
    else if (graphView === 'monthly') { start.setMonth(end.getMonth() - 11); start.setDate(1); }
    else if (graphView === 'yearly') { start.setFullYear(end.getFullYear() - 2); start.setMonth(0, 1); }
    else { start = new Date(graphCustomStart); end = new Date(graphCustomEnd); }

    if (start < MIN_DATE) start = new Date(MIN_DATE);
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }
    return dates.reverse();
  };

  const graphDates = useMemo(generateGraphDates, [graphView, graphCustomStart, graphCustomEnd]);

  const getAggregatedValue = (dates: string[], def?: StatDefinition) => {
      if (dates.length === 0) return 0;
      let sum = 0;
      let count = 0;
      dates.forEach(d => {
          if (!def) { // Global
              const val = getGlobalCompletion(d);
              if (val > 0) { sum += val; count++; }
          } else {
              const val = getCellValue(d, def);
              if (val !== null) {
                  if (typeof val === 'boolean') { if(val) sum++; count++; }
                  else { sum += val; count++; }
              }
          }
      });
      if (count === 0) return 0;
      if (!def || def.type === 'percent') return Math.round(sum / count);
      return sum; 
  };

  const groupGraphDates = () => {
      if (graphView === 'daily' || graphView === 'custom') return graphDates;
      const groups: { [key: string]: string[] } = {};
      graphDates.forEach(date => {
          const d = new Date(date);
          let key = '';
          if (graphView === 'weekly') key = `Week ${getWeekNumber(d)[1]}, ${getWeekNumber(d)[0]}`;
          else if (graphView === 'monthly') key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
          else if (graphView === 'yearly') key = d.getFullYear().toString();
          if (!groups[key]) groups[key] = [];
          groups[key].push(date);
      });
      return Object.keys(groups);
  };
  const graphGroups = useMemo(groupGraphDates, [graphDates, graphView]);

  const trendMetrics = useMemo(() => [
      { id: 'global', name: 'Global Todos', type: 'percent' as TrackerType, color: '#818cf8' },
      ...statDefinitions.filter(t => t.type !== 'check')
  ], [statDefinitions]);

  const currentTrendMetric = trendMetrics[trendMetricIndex] || trendMetrics[0];

  const trendData = useMemo(() => {
      const groups = [...graphGroups].reverse();
      return groups.map(group => {
          const datesInGroup = graphDates.filter(d => {
              if (graphView === 'daily' || graphView === 'custom') return d === group;
              const dObj = new Date(d);
              if (graphView === 'weekly') return `Week ${getWeekNumber(dObj)[1]}, ${getWeekNumber(dObj)[0]}` === group;
              if (graphView === 'monthly') return dObj.toLocaleString('default', { month: 'short', year: 'numeric' }) === group;
              return dObj.getFullYear().toString() === group;
          });
          
          const def = currentTrendMetric.id === 'global' ? undefined : statDefinitions.find(s => s.id === currentTrendMetric.id);
          return { label: group, value: getAggregatedValue(datesInGroup, def) };
      });
  }, [graphGroups, graphDates, currentTrendMetric, statDefinitions, dailyLogs, statValues]);

  const comparativeData = useMemo(() => {
      return statDefinitions.map(def => {
          if (def.type === 'check') return null;
          const val = getAggregatedValue(graphDates, def);
          return { name: def.name, value: val, type: def.type, color: def.color };
      }).filter(Boolean) as any[];
  }, [statDefinitions, graphDates, dailyLogs, statValues]);

  // --- Render Helpers ---
  const renderControls = (currentMode: string, setMode: (m: any) => void) => (
    <div className="flex bg-gray-800 rounded-lg p-1 gap-1 inline-flex">
        {VIEW_OPTIONS.map(opt => (
            <button
                key={opt}
                onClick={() => setMode(opt)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currentMode === opt 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
  );

  const renderDateNavigator = (date: string, setDate: (d: string) => void) => {
      const d = new Date(date);
      const prev = () => {
          const newD = new Date(d); newD.setDate(d.getDate() - 1);
          setDate(newD.toISOString().split('T')[0]);
      };
      const next = () => {
        const newD = new Date(d); newD.setDate(d.getDate() + 1);
        setDate(newD.toISOString().split('T')[0]);
      };

      return (
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button onClick={prev} className="p-2 hover:text-indigo-400 text-gray-400"><ChevronLeftIcon /></button>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-white text-sm font-medium focus:ring-0 w-28 text-center"
              />
              <button onClick={next} className="p-2 hover:text-indigo-400 text-gray-400"><ChevronRightIcon /></button>
          </div>
      )
  }

  return (
    <div className="space-y-12 pb-24 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Performance Scorecard</h2>
            <p className="text-slate-400 mt-1 text-sm">Detailed breakdown of your habits and goals</p>
        </div>
        <button onClick={onOpenTrackerManager} className="bg-indigo-600/80 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all backdrop-blur-sm ring-1 ring-indigo-400/50">
            <AdjustmentsIcon className="w-5 h-5" /> <span className="font-medium">Manage Metrics</span>
        </button>
      </div>

      <section>
         <div className="flex flex-col gap-6">
             <div className="flex justify-between">{renderControls(tableView, setTableView)}</div>
             <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <button onClick={() => navigateTable(-1)} className="p-2 text-slate-400 hover:text-white"><ChevronLeftIcon/></button>
                    <div className="flex items-center gap-3"><CalendarIcon className="w-5 h-5 text-indigo-400"/><span className="text-lg font-bold text-slate-200">{tableRefDate}</span></div>
                    <button onClick={() => navigateTable(1)} className="p-2 text-slate-400 hover:text-white"><ChevronRightIcon/></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead>
                            <tr className="bg-slate-900/80">
                                <th className="px-6 py-4 font-bold text-white border-r border-white/5 w-56 sticky left-0 bg-slate-900">Metric</th>
                                {tableColumns.map(col => <th key={col} className="px-6 py-4 text-center border-b border-white/5 min-w-[100px]">{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                             <tr className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5 font-medium text-white border-r border-white/5 sticky left-0 bg-slate-900">Global Todos</td>
                                {tableColumns.map(col => <td key={col} className="text-center px-4 py-3 border-r border-white/5 font-bold text-indigo-300">{tableView === 'daily' ? getGlobalCompletion(col) : '-'}%</td>)}
                             </tr>
                             {statDefinitions.map(def => (
                                 <tr key={def.id} className="group hover:bg-white/[0.02] transition-colors border-t border-white/5">
                                     <td className="px-6 py-5 font-medium text-white border-r border-white/5 sticky left-0 bg-slate-900">
                                         <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 rounded-full opacity-80" style={{ backgroundColor: def.color || '#6366f1' }}></div>
                                            {def.name}
                                         </div>
                                     </td>
                                     {tableColumns.map(col => {
                                         const val = tableView === 'daily' ? getCellValue(col, def) : '-';
                                         return (
                                             <td key={col} className="px-4 py-3 text-center border-r border-white/5">
                                                 {tableView === 'daily' ? (
                                                     <EditableCell value={val} type={def.type} onSave={(v) => onUpdateStatValue(col, def.id, v)} />
                                                 ) : val}
                                             </td>
                                         )
                                     })}
                                 </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
             </div>
         </div>
      </section>
      
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 pt-8 border-t border-white/10">
             <h2 className="text-2xl font-bold text-white">Performance Graphs</h2>
             {renderControls(graphView, setGraphView)}
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
             <div className="flex justify-between items-center p-4 bg-white/5 border-b border-white/5">
                 <h3 className="text-lg font-semibold text-slate-200">Trend: <span style={{color: currentTrendMetric.color}}>{currentTrendMetric.name}</span></h3>
                 <div className="flex gap-2">
                    <button onClick={() => setTrendMetricIndex(prev => (prev - 1 + trendMetrics.length) % trendMetrics.length)} className="p-1.5 bg-white/5 hover:text-white text-slate-400 rounded-full"><ChevronLeftIcon/></button>
                    <button onClick={() => setTrendMetricIndex(prev => (prev + 1) % trendMetrics.length)} className="p-1.5 bg-white/5 hover:text-white text-slate-400 rounded-full"><ChevronRightIcon/></button>
                 </div>
             </div>
             <div className="p-6 h-[300px]">
                 <ImprovedLineChart data={trendData} color={currentTrendMetric.color} />
             </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
             <div className="p-4 bg-white/5 border-b border-white/5"><h3 className="text-lg font-semibold text-slate-200">Comparisons</h3></div>
             <div className="p-6 h-[300px]">
                 <ImprovedBarChart data={comparativeData} />
             </div>
        </div>
      </section>

    </div>
  );
};

// --- Sub-components ---
const ImprovedLineChart = ({ data, color = '#818cf8' }: any) => {
     if (!data || data.length === 0) return null;
     const WIDTH = 1000, HEIGHT = 300, PAD = 40;
     const maxY = 100;
     const getX = (i: number) => PAD + (i / (data.length - 1)) * (WIDTH - PAD * 2);
     const getY = (v: number) => HEIGHT - PAD - (v / maxY) * (HEIGHT - PAD * 2);
     const points = data.map((d: any, i: number) => `${getX(i)},${getY(d.value)}`).join(' ');
     return (
         <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full overflow-visible">
             <polyline points={points} fill="none" stroke={color} strokeWidth="3" />
             {data.map((d: any, i: number) => (i % Math.ceil(data.length/10) === 0) && (
                 <text key={i} x={getX(i)} y={HEIGHT - 10} textAnchor="middle" fill="#94a3b8" fontSize="12">{d.label}</text>
             ))}
         </svg>
     );
};

const ImprovedBarChart = ({ data }: any) => {
    if (!data || data.length === 0) return null;
    const WIDTH = 1000, HEIGHT = 300, PAD = 40;
    const maxVal = Math.max(...data.map((d: any) => d.value), 10) * 1.1;
    const barW = (WIDTH - PAD * 2) / data.length * 0.6;
    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full overflow-visible">
            {data.map((d: any, i: number) => {
                const h = (d.value / maxVal) * (HEIGHT - PAD * 2);
                const x = PAD + i * ((WIDTH - PAD * 2) / data.length) + 20;
                const y = HEIGHT - PAD - h;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barW} height={h} fill={d.color || '#6366f1'} rx="4" />
                        <text x={x + barW/2} y={HEIGHT - 10} textAnchor="middle" fill="#94a3b8" fontSize="12">{d.name}</text>
                        <text x={x + barW/2} y={y - 5} textAnchor="middle" fill="white" fontSize="12">{d.value}</text>
                    </g>
                );
            })}
        </svg>
    );
};

const EditableCell = ({ value, type, onSave }: any) => {
    const [val, setVal] = useState(value);
    useEffect(() => setVal(value), [value]);
    if (type === 'check') {
        return <div onClick={() => onSave(!val)} className="cursor-pointer flex justify-center">{val ? <CheckIcon className="text-emerald-400 w-5 h-5"/> : <div className="w-4 h-4 border border-slate-600 rounded"/>}</div>;
    }
    return (
        <input 
            type="number" 
            className="bg-transparent text-center w-full text-slate-200 outline-none" 
            value={val ?? ''} 
            onChange={e => setVal(e.target.value)} 
            onBlur={() => onSave(val === '' ? null : Number(val))} 
            placeholder="-"
        />
    );
}

export default Statistics;
