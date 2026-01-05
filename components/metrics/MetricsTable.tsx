import React, { useState, useEffect } from 'react'; // Fix deployment trigger
import { StatDefinition, TrackerType } from '../../types';
import { CheckIcon } from '../../icons';

interface MetricsTableProps {
    dates: string[];
    values: { [date: string]: number | boolean | null };
    metric: StatDefinition;
    isEditable: boolean;
    onUpdateValue: (date: string, value: number | boolean | null) => void;
    formatDateHeader: (date: string) => string;
}

const MetricsTable: React.FC<MetricsTableProps> = ({
    dates,
    values,
    metric,
    isEditable,
    onUpdateValue,
    formatDateHeader
}) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead>
                        <tr className="bg-slate-900/80">
                            {dates.map(date => (
                                <th key={date} className="px-6 py-4 text-center border-b border-white/5 min-w-[120px] font-medium text-gray-300">
                                    {formatDateHeader(date)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="group hover:bg-white/[0.02] transition-colors">
                            {dates.map(date => (
                                <td key={date} className="px-4 py-6 text-center border-r border-white/5 last:border-r-0 relative">
                                    <EditableCell
                                        value={values[date]}
                                        type={metric.type}
                                        isEditable={isEditable}
                                        onSave={(v) => onUpdateValue(date, v)}
                                    />
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EditableCell = ({ value, type, isEditable, onSave }: { value: any, type: TrackerType, isEditable: boolean, onSave: (v: any) => void }) => {
    const [val, setVal] = useState(value);

    useEffect(() => {
        setVal(value);
    }, [value]);

    if (!isEditable) {
        if (value === null || value === undefined) return <span className="text-gray-600">-</span>;
        if (type === 'check') {
            if (typeof value === 'number') return <span className="font-mono text-gray-400">{value}%</span>;
            return <div className="flex justify-center">{value ? <CheckIcon className="text-emerald-500/50 w-5 h-5" /> : <span className="text-gray-600">NO</span>}</div>;
        }
        if (type === 'percent') return <span className="font-mono text-gray-400">{Math.round(Number(value))}%</span>;
        return <span className="font-mono text-gray-400">{Number(value)}</span>;
    }

    if (type === 'check') {
        return (
            <div
                onClick={() => onSave(!val)}
                className={`cursor-pointer flex justify-center items-center w-8 h-8 mx-auto rounded-lg transition-all ${val ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 border border-gray-700 hover:border-gray-500'}`}
            >
                {val && <CheckIcon className="w-5 h-5" />}
            </div>
        );
    }

    return (
        <div className="relative group/cell w-full h-full flex items-center justify-center">
            <input
                type="number"
                className="bg-transparent text-center w-full h-10 text-lg font-mono text-white outline-none placeholder-gray-700 
                          focus:placeholder-gray-500 focus:bg-white/5 rounded-md transition-all
                          group-hover/cell:bg-white/5 focus:ring-1 focus:ring-indigo-500/50"
                value={val ?? ''}
                onChange={e => setVal(e.target.value)}
                onBlur={() => onSave(val === '' ? null : Number(val))}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur();
                    }
                }}
                placeholder="-"
            />
        </div>
    );
};

export default MetricsTable;
