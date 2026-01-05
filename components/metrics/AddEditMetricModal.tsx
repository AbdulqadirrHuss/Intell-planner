import React, { useState, useEffect } from 'react';
import { TrackerType } from '../../types';
import { PlusIcon, CheckIcon } from '../../icons';

interface AddEditMetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, type: TrackerType, frequency: 'daily' | 'weekly', color: string, target?: number) => void;
    initialData?: {
        name: string;
        type: TrackerType;
        frequency: 'daily' | 'weekly';
        color: string;
        target?: number;
    };
}

const AddEditMetricModal: React.FC<AddEditMetricModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<TrackerType>('percent');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [color, setColor] = useState('#6366f1');
    const [target, setTarget] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setType(initialData.type);
                setFrequency(initialData.frequency);
                setColor(initialData.color);
                setTarget(initialData.target ? String(initialData.target) : '');
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData]);

    const resetForm = () => {
        setName('');
        setType('percent');
        setFrequency('daily');
        setColor('#6366f1');
        setTarget('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), type, frequency, color, target ? parseFloat(target) : undefined);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[70] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-xl font-bold text-white">{initialData ? 'Edit Metric' : 'Add New Metric'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

                        {/* Frequency */}
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
                    <div className="pt-4 flex gap-3">
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
                </form>
            </div>
        </div>
    );
};

export default AddEditMetricModal;
