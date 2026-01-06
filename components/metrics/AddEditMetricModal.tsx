```typescript
import React, { useState, useEffect } from 'react';
import { TrackerType } from '../../types';
import { PlusIcon, CheckIcon } from '../../icons';

interface AddEditMetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (metric: { name: string; type: TrackerType; frequency: 'daily' | 'weekly'; target?: number; target_days?: number[]; color: string; }) => void;
    initialData?: { id: string; name: string; type: TrackerType; frequency: 'daily' | 'weekly'; target?: number; target_days?: number[]; color: string; };
    onDelete?: () => void;
}

const AddEditMetricModal: React.FC<AddEditMetricModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<TrackerType>('count');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [target, setTarget] = useState<string>('');
    const [targetDays, setTargetDays] = useState<number[]>([]); // 0=Sun, 1=Mon, ..., 6=Sat
    const [color, setColor] = useState('#6366F1'); // Default Indigo-500

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setFrequency(initialData.frequency);
            setTarget(initialData.target !== undefined ? String(initialData.target) : '');
            setTargetDays(initialData.target_days || []);
            setColor(initialData.color);
        } else if (isOpen) {
            // Reset form for new metric
            setName('');
            setType('count');
            setFrequency('daily');
            setTarget('');
            setTargetDays([]);
            setColor('#6366F1');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: name.trim(),
            type,
            frequency,
            target: target ? Number(target) : undefined,
            target_days: targetDays.length > 0 ? targetDays : undefined,
            color
        });
        onClose();
if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                <h3 className="text-xl font-bold text-white">{initialData ? 'Edit Metric' : 'Add New Metric'}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* ... fields ... */}
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Metric Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Morning Run"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Data Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value as TrackerType)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="percent">Percent (%)</option>
                            <option value="count">Count (#)</option>
                            <option value="check">Check (✓)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Frequency</label>
                        <select
                            value={frequency}
                            onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    {frequency === 'daily' && (
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-300">Target Days (Optional)</label>
                            <div className="flex justify-between gap-1">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            const newDays = targetDays.includes(i)
                                                ? targetDays.filter(dayIdx => dayIdx !== i)
                                                : [...targetDays, i];
                                            setTargetDays(newDays);
                                        }}
                                        className={`w - 10 h - 10 rounded - lg font - bold transition - all ${ targetDays.includes(i) ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600' } `}
                                    >
                                        {dayChar}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500">Leaving all unchecked means "Every Day". Checks affect completion stats.</p>
                        </div>
                    )}
                </div>

                {/* Target (Conditional) */}
                {type === 'count' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Daily Target (Optional)</label>
                        <input
                            type="number"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            placeholder="e.g. 10000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                {/* Color */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Accent Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                        <span className="text-gray-400 text-sm">{color}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-indigo-900/20 transition-all flex justify-center items-center gap-2"
                        >
                            {initialData ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                            {initialData ? 'Save Changes' : 'Create Metric'}
                        </button>
                    </div>

                    {initialData && onDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                        >
                            Delete Metric
                        </button>
                    )}
                </div>
            </form>
        </div>
    </div>
);
};

export default AddEditMetricModal;
