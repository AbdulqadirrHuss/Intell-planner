import React, { useState } from 'react';
import { StatDefinition, StatValue } from '../../types';
import { PlusIcon, AdjustmentsIcon, CheckIcon } from '../../icons';
import AddEditMetricModal from './AddEditMetricModal';

interface MetricsDashboardProps {
    statDefinitions: StatDefinition[];
    statValues: StatValue[];
    onAddMetric: (name: string, type: any, frequency: 'daily' | 'weekly', color: string, target?: number) => void;
    onUpdateMetric: (id: string, updates: Partial<StatDefinition>) => void;
    onDeleteMetric: (id: string) => void;
    onOpenDetail: (metric: StatDefinition) => void;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
    statDefinitions,
    statValues,
    onAddMetric,
    onUpdateMetric,
    onDeleteMetric,
    onOpenDetail
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getLatestValue = (metric: StatDefinition) => {
        // For now, just getting the value for today. 
        // In a real implementation, this might need to be smarter about "latest available" or specific to frequency.
        const today = new Date().toISOString().split('T')[0];
        const val = statValues.find(v => v.stat_definition_id === metric.id && v.date === today);

        if (!val) return '--';
        if (metric.type === 'check') return val.value ? 'YES' : 'NO';
        return val.value;
    };

    return (
        <div className="space-y-8 pb-24 min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Your Metrics</h2>
                    <p className="text-slate-400 mt-1 text-sm">Track your habits and goals</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600/80 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all backdrop-blur-sm ring-1 ring-indigo-400/50"
                >
                    <PlusIcon className="w-5 h-5" /> <span className="font-medium">Add Metric</span>
                </button>
            </div>

            {/* Empty State */}
            {statDefinitions.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/30">
                    <div className="p-4 bg-gray-800 rounded-full mb-4">
                        <AdjustmentsIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Metrics Yet</h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                        Start tracking your habits, goals, or anything else that matters to you.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                        Create your first metric &rarr;
                    </button>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statDefinitions.map(metric => (
                    <div
                        key={metric.id}
                        onClick={() => onOpenDetail(metric)}
                        className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: metric.color || '#6366f1' }}></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/5">
                                    {metric.type === 'check' ? <CheckIcon className="w-5 h-5 text-gray-300" /> : <AdjustmentsIcon className="w-5 h-5 text-gray-300" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{metric.name}</h3>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{metric.frequency}</span>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-bold bg-white/5 text-gray-400 border border-white/5">
                                {metric.type.toUpperCase()}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-1">Latest Value</p>
                            <div className="text-3xl font-mono font-bold text-white">
                                {getLatestValue(metric)}
                                {metric.type === 'percent' && <span className="text-lg text-gray-500 ml-1">%</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AddEditMetricModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onAddMetric}
            />
        </div>
    );
};

export default MetricsDashboard;
