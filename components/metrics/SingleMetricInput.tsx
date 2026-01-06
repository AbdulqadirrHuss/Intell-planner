import React, { useState, useEffect } from 'react';
import { StatDefinition } from '../../types';
import { CheckIcon, XMarkIcon } from '../../icons';

interface SingleMetricInputProps {
    date: string;
    title: string;
    subtitle: string;
    value: number | boolean | null;
    metric: StatDefinition;
    onUpdate: (value: number | boolean | null) => void;
}

const SingleMetricInput: React.FC<SingleMetricInputProps> = ({ date, title, subtitle, value, metric, onUpdate }) => {
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

    const handleCheckToggle = () => {
        // Cycle: Null -> 1 (Check) -> 0 (Cross) -> Null
        // Treat true as 1, false as 0
        let current = localVal;
        if (current === true) current = 1;
        if (current === false) current = 0;

        let nextVal: number | null = null;

        if (current === null || current === undefined) {
             nextVal = 1;
        } else if (Number(current) === 1) {
             nextVal = 0;
        } else {
             nextVal = null;
        }
        
        setLocalVal(nextVal);
        onUpdate(nextVal);
    };

    if (metric.type === 'check') {
        // Determine state
        const isChecked = localVal === true || localVal === 1;
        const isCrossed = localVal === false || localVal === 0;
        const isNull = !isChecked && !isCrossed;

        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner">
                <button
                    onClick={handleCheckToggle}
                    className={`w-32 h-32 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                        isChecked 
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                        : isCrossed
                        ? 'bg-red-500/20 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                        : 'bg-slate-800 border-2 border-slate-600 hover:border-slate-500'
                    }`}
                >
                    {isChecked ? (
                        <CheckIcon className="w-16 h-16 text-emerald-500" />
                    ) : isCrossed ? (
                        <XMarkIcon className="w-16 h-16 text-red-500" />
                    ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-slate-700 dashed" />
                    )}
                </button>
                <div className="mt-6 text-xl font-medium text-slate-300">
                    {isChecked ? 'Completed' : isCrossed ? 'Missed' : 'Mark Status'}
                </div>
                <div className="mt-4 flex flex-col items-center">
                    <span className="text-slate-200 font-bold text-lg">{title}</span>
                    <span className="text-slate-500 text-sm">{subtitle}</span>
                </div>
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

            <div className="flex flex-col items-center mb-6">
                <span className="text-slate-200 font-bold text-2xl">{title}</span>
                <span className="text-slate-500 text-sm mt-1">{subtitle}</span>
            </div>

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
