import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StatDefinition, StatValue, Category } from './types';
import { PlusIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

// Supabase Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const VIEW_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'];

interface StatisticsProps {
  categories: Category[];
}

const Statistics: React.FC<StatisticsProps> = ({ categories }) => {
  const [statDefinitions, setStatDefinitions] = useState<StatDefinition[]>([]);
  const [statValues, setStatValues] = useState<StatValue[]>([]);
  
  const [tableViewMode, setTableViewMode] = useState('Daily');
  const [tableDate, setTableDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [graphViewMode, setGraphViewMode] = useState('Daily');
  const [isGraphExpanded, setIsGraphExpanded] = useState(true);

  const [isAddStatModalOpen, setIsAddStatModalOpen] = useState(false);
  const [newStatName, setNewStatName] = useState('');
  const [newStatType, setNewStatType] = useState<'percent' | 'count' | 'check'>('percent');
  const [newStatLink, setNewStatLink] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: defs } = await supabase.from('stat_definitions').select('*');
    const { data: vals } = await supabase.from('stat_values').select('*');
    if (defs) setStatDefinitions(defs);
    if (vals) setStatValues(vals);
  };

  const getCellValue = (statId: string, date: string) => {
    const val = statValues.find(v => v.stat_definition_id === statId && v.date === date);
    return val ? val.value : null;
  };

  const handleValueChange = async (statId: string, date: string, newValue: string | number | boolean) => {
    let numVal = 0;
    if (typeof newValue === 'boolean') numVal = newValue ? 1 : 0;
    else numVal = Number(newValue);

    const existingIdx = statValues.findIndex(v => v.stat_definition_id === statId && v.date === date);
    if (existingIdx >= 0) {
      const newVals = [...statValues];
      newVals[existingIdx] = { ...newVals[existingIdx], value: numVal, is_manual: true };
      setStatValues(newVals);
      
      await supabase.from('stat_values').update({ value: numVal, is_manual: true }).eq('id', statValues[existingIdx].id);
    } else {
      const tempId = crypto.randomUUID();
      setStatValues([...statValues, { id: tempId, date, stat_definition_id: statId, value: numVal, is_manual: true }]);
      
      await supabase.from('stat_values').insert({ date, stat_definition_id: statId, value: numVal, is_manual: true });
      loadStats(); 
    }
  };

  const handleAddStat = async () => {
    if (!newStatName) return;
    const payload = { 
        name: newStatName, 
        type: newStatType, 
        linked_category_id: newStatLink || null 
    };
    await supabase.from('stat_definitions').insert(payload);
    setIsAddStatModalOpen(false);
    setNewStatName('');
    loadStats();
  };

  const renderControls = (currentMode: string, setMode: (m: string) => void) => (
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
    <div className="space-y-10 pb-20">
      <section>
        <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-white">Data Log</h2>
            <div className="flex gap-4">
                {renderControls(tableViewMode, setTableViewMode)}
            </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                {renderDateNavigator(tableDate, setTableDate)}
                <div className="text-gray-400 text-xs uppercase tracking-wide font-semibold">
                     {new Date(tableDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-white w-32 border-r border-gray-700">Date</th>
                            {statDefinitions.map(stat => (
                                <th key={stat.id} className="px-6 py-4 font-medium text-center border-r border-gray-700 min-w-[120px]">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={stat.linked_category_id ? 'text-green-400' : 'text-white'}>
                                            {stat.linked_category_id ? '⚡ ' : '# '}{stat.name}
                                        </span>
                                        <span className="text-[10px] text-gray-600">{stat.type === 'percent' ? '%' : stat.type}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-4 text-center w-16">
                                <button onClick={() => setIsAddStatModalOpen(true)} className="text-gray-500 hover:text-indigo-400 transition-colors">
                                    <PlusIcon className="w-5 h-5 mx-auto"/>
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-700 hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-white border-r border-gray-700">
                                {new Date(tableDate).toLocaleDateString(undefined, { weekday: 'short' })} <br/>
                                <span className="text-xs text-gray-500">{tableDate}</span>
                            </td>
                            {statDefinitions.map(stat => {
                                const val = getCellValue(stat.id, tableDate);
                                return (
                                    <td key={stat.id} className="px-4 py-3 text-center border-r border-gray-700">
                                        {stat.type === 'check' ? (
                                            <input 
                                                type="checkbox" 
                                                checked={!!val} 
                                                onChange={(e) => handleValueChange(stat.id, tableDate, e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <input 
                                                type="number" 
                                                value={val ?? ''} 
                                                placeholder="-"
                                                onChange={(e) => handleValueChange(stat.id, tableDate, e.target.value)}
                                                className="w-full bg-transparent text-center text-white placeholder-gray-600 focus:ring-0 border-none p-0"
                                            />
                                        )}
                                    </td>
                                );
                            })}
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-white">Performance Graphs</h2>
            <div className="flex gap-4">
                {renderControls(graphViewMode, setGraphViewMode)}
            </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <button 
                onClick={() => setIsGraphExpanded(!isGraphExpanded)}
                className="w-full p-4 flex justify-between items-center bg-gray-800/80 hover:bg-gray-700/50 transition-colors"
            >
                <span className="font-bold text-indigo-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    Completion Trend
                </span>
                <ChevronDownIcon isOpen={isGraphExpanded} className="text-gray-400" />
            </button>

            {isGraphExpanded && (
                <div className="p-6 h-64 flex items-end justify-between gap-2 relative">
                    <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                        {[100, 75, 50, 25, 0].map(tick => (
                            <div key={tick} className="w-full border-b border-gray-700/50 h-0 flex items-center">
                                <span className="text-[10px] text-gray-600 -ml-6 absolute">{tick}%</span>
                            </div>
                        ))}
                    </div>
                    
                    {[40, 60, 30, 80, 50, 90, 100, 20, 40, 60, 80, 30, 50, 70].map((h, i) => (
                        <div key={i} className="w-full bg-gray-700/30 hover:bg-indigo-500/20 rounded-t-sm relative group transition-all h-full flex items-end">
                             <div style={{ height: `${h}%` }} className="w-full bg-indigo-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all"></div>
                             <div className="absolute -bottom-6 text-[9px] text-gray-500 w-full text-center">D{i+1}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {isAddStatModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6">Add New Statistic Column</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Column Name</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-2.5 focus:ring-indigo-500" 
                            placeholder="e.g. Gym, Calories, Mood"
                            value={newStatName}
                            onChange={e => setNewStatName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Data Type</label>
                          <div className="flex bg-gray-700 rounded-lg p-1">
                              {['percent', 'count', 'check'].map(type => (
                                  <button 
                                    key={type}
                                    onClick={() => setNewStatType(type as any)}
                                    className={`flex-1 py-2 text-sm rounded-md capitalize ${newStatType === type ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                  >
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Link to Category? (Optional)</label>
                          <select 
                            className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-2.5"
                            value={newStatLink}
                            onChange={e => setNewStatLink(e.target.value)}
                          >
                              <option value="">Manual Entry (No Link)</option>
                              {categories.filter(c => c.id !== 'uncategorized').map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                          </select>
                          <p className="text-[10px] text-gray-500 mt-1">Linked columns calculate automatically from your planner but can be overridden manually.</p>
                      </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                      <button onClick={() => setIsAddStatModalOpen(false)} className="flex-1 py-2.5 bg-transparent border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700">Cancel</button>
                      <button onClick={handleAddStat} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium">Add Column</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Statistics;
