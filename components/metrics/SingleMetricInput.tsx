import React, { useState, useEffect } from 'react';
import { StatDefinition } from '../../types';
import { CheckIcon } from '../../icons';

interface SingleMetricInputProps {
    date: string;
    label: string;
    value: number | boolean | null;
    metric: StatDefinition;
    onUpdate: (value: number | boolean | null) => void;
}

const SingleMetricInput: React.FC<SingleMetricInputProps> = ({ date, label, value, metric, onUpdate }) => {
    const [localVal, setLocalVal] = useState<string | number | boolean | null>(value);

    useEffect(() => {
        setLocalVal(value);
    }, [value]);

    const handleBlur = () => {
        if (metric.type === 'check') return;
        if (localVal === '' || localVal === null) {
            onUpdate(null);
        } else {
            onUpdate(Number(localVal));
        }
    };

    if (metric.type === 'check') {
        const isChecked = localVal === true || localVal === 1; // Handle legacy 1/0 if needed, though usually boolean now
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner">
                <button
                    onClick={() => onUpdate(!isChecked)}
                    className={`w-32 h-32 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${isChecked
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-800 border-2 border-slate-600 hover:border-slate-500'
                        }`}
                >
                    {isChecked ? (
                        <CheckIcon className="w-16 h-16 text-emerald-500" />
                    ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-slate-700 dashed" />
                    )}
                </button>
                <div className="mt-6 text-xl font-medium text-slate-300">
                    {isChecked ? 'Completed' : 'Mark as Done'}
                </div>
                <div className="mt-2 text-slate-500 text-sm">{label}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner">
            <div className="relative group">
                <input
                    type="number"
                    value={localVal === null ? '' : localVal.toString()}
                    onChange={(e) => setLocalVal(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="-"
                    className="bg-transparent text-6xl font-bold text-center w-64 outline-none text-white placeholder-slate-700 border-b-2 border-slate-700 focus:border-indigo-500 transition-colors pb-2"
                    autoFocus
                />
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-slate-500 text-xl font-medium">
                    {metric.type === 'percent' ? '%' : ''}
                </span>
            </div>

            <div className="text-slate-400 text-lg font-medium mb-6">{label}</div>

            <div className="mt-2 text-slate-500 text-sm font-medium uppercase tracking-wider">
                {metric.type === 'percent' ? 'Percentage Score' : 'Count Value'}
            </div>
            {metric.target && (
                <div className="mt-2 text-indigo-400 text-sm">
                    Target: {metric.target}
                </div>
            )}
        </div>
    );
};

export default SingleMetricInput;
