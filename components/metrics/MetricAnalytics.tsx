import React, { useState, useMemo, useEffect } from 'react';
import { StatDefinition, StatValue } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, AdjustmentsIcon } from '../../icons';
import MetricsTable from './MetricsTable';
import MetricsGraph from './MetricsGraph';
import AddEditMetricModal from './AddEditMetricModal';
import SingleMetricInput from './SingleMetricInput';

interface MetricAnalyticsProps {
    metric: StatDefinition;
    statValues: StatValue[];
    onUpdateValue: (date: string, value: number | boolean | null) => void;
    onUpdateMetric: (id: string, updates: Partial<StatDefinition>) => void;
    onBack: () => void;
}

// UK Date Formatter
const formatDateUK = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
const formatMonthUK = (date: Date) => date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

const MetricAnalytics: React.FC<MetricAnalyticsProps> = ({
    metric,
    statValues,
    onUpdateValue,
    onUpdateMetric,
    onBack
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>(metric.frequency === 'weekly' ? 'weekly' : 'daily');
    const [refDate, setRefDate] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState<'table' | 'graph'>('table');

    // Reset view mode if metric frequency changes
    useEffect(() => {
        if (metric.frequency === 'weekly' && viewMode === 'daily') {
            setViewMode('weekly');
        }
    }, [metric.frequency]);

    // --- Date Helpers ---
    const getStartOfWeek = (dateParam: Date) => {
        const date = new Date(dateParam);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        const start = new Date(date.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return start;
    };

    const formatDate = (dateParam: Date) => dateParam.toISOString().split('T')[0];

    // --- Data Generation ---
    const { dates, values, isEditable, dateLabels } = useMemo(() => {
        const dateList: string[] = [];
        const valMap: { [date: string]: number | boolean | null } = {};
        const labels: { [date: string]: string } = {};
        let editable = false;

        const current = new Date(refDate);

        // Helper for aggregation
        const calculateAggregate = (startDate: Date, endDate: Date): number | null => {
            let sum = 0;
            let count = 0;
            const expectedDays = metric.target_days && metric.target_days.length > 0 ? metric.target_days : [0, 1, 2, 3, 4, 5, 6];

            // Iterate through every day in the range
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dayStr = formatDate(d);
                const entry = statValues.find(v => v.stat_definition_id === metric.id && v.date === dayStr);

                // If it's a target day
                if (expectedDays.includes(d.getDay())) {
                    // Check if entry exists and is NOT null (we ignore nulls)
                    if (entry && entry.value !== null && entry.value !== undefined) {
                        let numVal = Number(entry.value);

                        // Sanitize Check metrics: legacy data might be >1. 
                        // We want 1 for Tick, 0 for Cross.
                        if (metric.type === 'check') {
                            numVal = numVal > 0 ? 1 : 0;
                        }

                        // For numbers: Just add the value.
                        sum += numVal;
                        count++;
                    }
                }
            }

            if (count === 0) return null;

            if (metric.type === 'check') {
                return Math.round((sum / count) * 100); // Percentage of Ticks vs (Ticks + Crosses)
            } else {
                return Math.round(sum / count); // Average value
            }
        };

        if (viewMode === 'daily') {
            const range = displayMode === 'table' ? 0 : 6; // Show 7 days (Mon-Sun or just last 7)
            // User requested "7 days a week monday tuesday...". Let's show last 7 days ending on refDate.

            for (let i = range; i >= 0; i--) {
                const d = new Date(current);
                d.setDate(d.getDate() - i);
                const dStr = formatDate(d);
                dateList.push(dStr);
                // "Monday", "Tuesday" etc.
                labels[dStr] = d.toLocaleDateString('en-GB', { weekday: 'long' });

                const entry = statValues.find(v => v.stat_definition_id === metric.id && v.date === dStr);
                let val = entry ? entry.value : null;

                // Normalize Daily Check values to 0-100 scale for consistency with other views
                if (metric.type === 'check' && val !== null && val !== undefined) {
                    val = Number(val) > 0 ? 100 : 0;
                }

                valMap[dStr] = val;
            }
            editable = true;

        } else if (viewMode === 'weekly') {
            const range = displayMode === 'table' ? 0 : 11; // 12 weeks
            const startOfCurrentWeek = getStartOfWeek(current);

            for (let i = range; i >= 0; i--) {
                const weekStart = new Date(startOfCurrentWeek);
                weekStart.setDate(weekStart.getDate() - (i * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                const dStr = formatDate(weekStart);
                dateList.push(dStr);
                // "Wk 1 2026"
                labels[dStr] = `Wk ${getWeekNumber(weekStart)} ${weekStart.getFullYear().toString().slice(-2)}`;

                if (metric.frequency === 'weekly') {
                    const entry = statValues.find(v => v.stat_definition_id === metric.id && v.date === dStr);
                    valMap[dStr] = entry ? entry.value : null;
                    editable = true;
                } else {
                    valMap[dStr] = calculateAggregate(weekStart, weekEnd);
                    editable = false;
                }
            }

        } else if (viewMode === 'monthly') {
            const range = displayMode === 'table' ? 0 : 11; // 12 months
            const currentMonthStart = new Date(current.getFullYear(), current.getMonth(), 1);

            for (let i = range; i >= 0; i--) {
                const monthStart = new Date(currentMonthStart);
                monthStart.setMonth(monthStart.getMonth() - i);
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

                const dStr = formatDate(monthStart);
                dateList.push(dStr);
                // "Jan", "Feb" etc.
                labels[dStr] = monthStart.toLocaleDateString('en-GB', { month: 'short' });

                valMap[dStr] = calculateAggregate(monthStart, monthEnd);
                editable = false;
            }
        } else if (viewMode === 'yearly') {
            // Show last 5 years?
            const range = displayMode === 'table' ? 0 : 4;
            const currentYearStart = new Date(current.getFullYear(), 0, 1);

            for (let i = range; i >= 0; i--) {
                const yearStart = new Date(currentYearStart);
                yearStart.setFullYear(yearStart.getFullYear() - i);
                const yearEnd = new Date(yearStart.getFullYear(), 11, 31);

                const dStr = formatDate(yearStart);
                dateList.push(dStr);
                // "2024", "2025"
                labels[dStr] = yearStart.getFullYear().toString();

                valMap[dStr] = calculateAggregate(yearStart, yearEnd);
                editable = false;
            }
        }

        return { dates: dateList, values: valMap, isEditable: editable, dateLabels: labels };
    }, [metric, statValues, viewMode, refDate, displayMode]);

    // --- Navigation ---
    const navigate = (dir: number) => {
        const newDate = new Date(refDate);
        if (displayMode === 'table') {
            if (viewMode === 'daily') newDate.setDate(newDate.getDate() + dir);
            if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + (dir * 7));
            if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + dir);
            if (viewMode === 'yearly') newDate.setFullYear(newDate.getFullYear() + dir);
        } else {
            if (viewMode === 'daily') newDate.setDate(newDate.getDate() + (dir * 7));
            if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + (dir * 7 * 12));
            if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + (dir * 12));
            if (viewMode === 'yearly') newDate.setFullYear(newDate.getFullYear() + (dir * 5));
        }
        setRefDate(newDate);
    };

    const jumpToToday = () => {
        setRefDate(new Date());
    };

    // --- Graph Data Prep ---
    const graphData = useMemo(() => {
        return dates.map(dateStr => ({
            label: dateLabels[dateStr],
            value: Number(values[dateStr] || 0)
        }));
    }, [dates, values, dateLabels]);

    // Force view mode to match frequency when in table mode
    useEffect(() => {
        if (displayMode === 'table') {
            setViewMode(metric.frequency as ViewMode);
        }
    }, [displayMode, metric.frequency]);

    // --- Input Label Helpers ---
    const currentInputDate = new Date(dates[0] || refDate);
    let inputTitle = '';
    let inputSubtitle = '';

    if (viewMode === 'daily') {
        inputTitle = currentInputDate.toLocaleDateString('en-GB', { weekday: 'long' });
        inputSubtitle = formatDateUK(currentInputDate);
    } else if (viewMode === 'weekly') {
        // We need the week number and year
        // We can re-use the getWeekNumber helper or just display start date
        // User asked for "Week 1 2026"
        const weekNum = getWeekNumber(currentInputDate);
        inputTitle = `Week ${weekNum} ${currentInputDate.getFullYear()}`;

        const start = getStartOfWeek(currentInputDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        inputSubtitle = `${formatDateUK(start)} - ${formatDateUK(end)}`;
    } else if (viewMode === 'monthly') { // monthly
        inputTitle = currentInputDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        // Subtitle can be blank or range
        inputSubtitle = '';
    } else { // yearly
        inputTitle = currentInputDate.getFullYear().toString();
        inputSubtitle = '';
    }

    return (
        <div className="space-y-6 pb-24 min-h-[80vh]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{metric.name}</h2>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-gray-400 border border-white/5 uppercase">
                            {metric.frequency}
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm">Detailed breakdown and history</p>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                >
                    <AdjustmentsIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-2 rounded-xl border border-white/5">
                {/* View Mode */}
                {displayMode === 'graph' ? (
                    <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
                        {metric.frequency === 'daily' && (
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                Daily
                            </button>
                        )}
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('yearly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Yearly
                        </button>
                    </div>
                ) : (
                    <div className="px-4 py-1.5 text-sm font-medium text-gray-400">
                        {metric.frequency === 'daily' ? 'Daily Log' : 'Weekly Log'}
                    </div>
                )}

                {/* Display Mode */}
                <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setDisplayMode('table')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${displayMode === 'table' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Table
                    </button>
                    <button
                        onClick={() => setDisplayMode('graph')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${displayMode === 'graph' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Graph
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between px-4">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white"><ChevronLeftIcon /></button>

                <div className="flex flex-col items-center">
                    {/* The date label is now inside SingleMetricInput for Table mode, but we keep the range for Graph mode?
                        Actually, user wants to see "Today" button.
                        Let's put the Today button here in the middle or next to arrows.
                    */}
                    {displayMode === 'graph' && (
                        <div className="flex items-center gap-2 text-slate-200 font-medium mb-1">
                            <CalendarIcon className="w-5 h-5 text-indigo-400" />
                            <span>
                                {viewMode === 'daily' && `Last 7 Days`}
                                {viewMode === 'weekly' && `Last 12 Weeks`}
                                {viewMode === 'monthly' && `Last 12 Months`}
                                {viewMode === 'yearly' && `Last 5 Years`}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={jumpToToday}
                        className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600/30 transition-colors uppercase tracking-wide border border-indigo-500/30"
                    >
                        Jump to Today
                    </button>
                </div>

                <button onClick={() => navigate(1)} className="p-2 text-slate-400 hover:text-white"><ChevronRightIcon /></button>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {displayMode === 'table' ? (
                    <div className="max-w-xl mx-auto py-8">
                        <SingleMetricInput
                            date={dates[0] || refDate.toISOString().split('T')[0]}
                            title={inputTitle}
                            subtitle={inputSubtitle}
                            value={values[dates[0]]}
                            metric={metric}
                            onUpdate={(val) => onUpdateValue(dates[0], val)}
                        />
                    </div>
                ) : (
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl h-[400px]">
                        <MetricsGraph
                            data={graphData}
                            color={metric.color}
                            type={metric.type === 'check' ? 'bar' : 'line'}
                            maxValue={metric.type === 'check' ? 100 : undefined}
                        />
                    </div>
                )}
            </div>

            <AddEditMetricModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={(name, type, frequency, color, target, targetDays) => onUpdateMetric(metric.id, { name, type, frequency, color, target, target_days: targetDays })}
                initialData={metric}
            />
        </div>
    );
};

// Helper
function getWeekNumber(dateParam: Date) {
    const targetDate = new Date(Date.UTC(dateParam.getFullYear(), dateParam.getMonth(), dateParam.getDate()));
    targetDate.setUTCDate(targetDate.getUTCDate() + 4 - (targetDate.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1));
    return Math.ceil((((targetDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default MetricAnalytics;
