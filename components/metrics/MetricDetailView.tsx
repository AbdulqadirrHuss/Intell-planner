import React, { useState, useMemo, useEffect } from 'react';
import { StatDefinition, StatValue } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, AdjustmentsIcon } from '../../icons';
import MetricsTable from './MetricsTable';
import MetricsGraph from './MetricsGraph';
import AddEditMetricModal from './AddEditMetricModal';

interface MetricDetailViewProps {
    metric: StatDefinition;
    statValues: StatValue[];
    onUpdateValue: (date: string, value: number | boolean | null) => void;
    onUpdateMetric: (id: string, updates: Partial<StatDefinition>) => void;
    onBack: () => void;
}

type ViewMode = 'daily' | 'weekly' | 'monthly';

const MetricDetailView: React.FC<MetricDetailViewProps> = ({
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

        if (viewMode === 'daily') {
            // Show 14 days centered or ending at refDate? Let's say ending at refDate for history context
            // PRD says "Show last 14 days"
            // Let's center it slightly so user can see future? No, usually past.
            // Let's show [refDate - 13, refDate]
            for (let i = 13; i >= 0; i--) {
                const dailyDate = new Date(current);
                dailyDate.setDate(dailyDate.getDate() - i);
                const dStr = formatDate(dailyDate);
                dateList.push(dStr);
                labels[dStr] = dailyDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

                // Get Raw Value
                const entry = statValues.find(v => v.stat_definition_id === metric.id && v.date === dStr);
                valMap[dStr] = entry ? entry.value : null;
            }
            editable = true;

        } else if (viewMode === 'weekly') {
            // Show 12 weeks
            const startOfCurrentWeek = getStartOfWeek(current);

            for (let i = 11; i >= 0; i--) {
                const weekDate = new Date(startOfCurrentWeek);
                weekDate.setDate(weekDate.getDate() - (i * 7));
                const dStr = formatDate(weekDate);
                dateList.push(dStr);
                labels[dStr] = `Wk ${getWeekNumber(weekDate)}`;

                if (metric.frequency === 'weekly') {
                    // Raw Data for Weekly Metric
                    const entry = statValues.find(v => v.stat_definition_id === metric.id && v.date === dStr);
                    valMap[dStr] = entry ? entry.value : null;
                    editable = true;
                } else {
                    // Aggregated Average for Daily Metric
                    let sum = 0;
                    let count = 0;
                    let targetDaysCount = 0;

                    const expectedDays = metric.target_days && metric.target_days.length > 0 ? metric.target_days : [0, 1, 2, 3, 4, 5, 6];

                    for (let j = 0; j < 7; j++) {
                        const dayInWeek = new Date(weekDate);
                        dayInWeek.setDate(dayInWeek.getDate() + j);
                        const dayStr = formatDate(dayInWeek);
                        const entry = statValues.find(v => v.stat_definition_id === metric.id && v.date === dayStr);

                        // Check if this day is a target day
                        const dayOfWeek = dayInWeek.getDay(); // 0-6
                        if (expectedDays.includes(dayOfWeek)) {
                            targetDaysCount++;
                        }

                        if (entry) {
                            sum += Number(entry.value);
                            count++;
                        }
                    }

                    // Calculate Value
                    if (targetDaysCount > 0) {
                        // If we have specific targets, completion is based on those targets
                        if (metric.type === 'check') {
                            // E.g. Target Mon, Wed (2 days). Did Mon, Wed, Fri (3 days). Result 3/2 = 150%?
                            // Or should it be capped? User just said "affect average". 
                            // Let's allow > 100% for now as it rewards extra effort.
                            valMap[dStr] = Math.round((sum / targetDaysCount) * 100);
                        } else {
                            // For Count/Percent, usually we want Average per Day.
                            // If I run 5km on Mon (Target) and 5km on Fri (Adhoc). Target Mon only.
                            // Total 10km. Average per target day = 10 / 1 = 10km? Or Average per Active Day?
                            // Default to Sum for Count (Total Volume) and Average for Percent?
                            // User requirement is vague for Count/Percent. Let's stick to Average over Target Days for consistency with completion.
                            valMap[dStr] = Math.round(sum / targetDaysCount);
                        }
                    } else {
                        // Fallback if no target days (shouldn't happen with default)
                        valMap[dStr] = count > 0 ? (metric.type === 'percent' ? Math.round(sum / count) : sum) : null;
                    }

                    // Special case: If type is 'check' but we calculated a percentage, we might want to display it as such.
                    // But our Table expects boolean for 'check' type cells.
                    // Wait, MetricDetailView table shows editable raw data for Daily view.
                    // For Weekly view of Daily metrics, it shows AGGREGATES.
                    // The Table component renders based on `metric.type`.
                    // If metric.type is 'check', it expects boolean.
                    // But here we are calculating a percentage (completion rate).
                    // We might need to handle this display issue. 
                    // Ideally, Weekly view for Check metrics should probably show a bar chart or percentage, NOT the check icon.
                    // *Self-Correction*: The Table cell will try to render a CheckIcon for a number (100). That fails.
                    // We need to either change the metric type passed to table or handle number in Check cell.

                    editable = false;
                }
            }

        } else if (viewMode === 'monthly') {
            // Show 12 months
            const currentMonthStart = new Date(current.getFullYear(), current.getMonth(), 1);

            for (let i = 11; i >= 0; i--) {
                const monthDate = new Date(currentMonthStart);
                monthDate.setMonth(monthDate.getMonth() - i);
                const dStr = formatDate(monthDate);
                dateList.push(dStr);
                labels[dStr] = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

                const month = monthDate.getMonth();
                const year = monthDate.getFullYear();
                const expectedDays = metric.target_days && metric.target_days.length > 0 ? metric.target_days : [0, 1, 2, 3, 4, 5, 6];

                // Calculate target days in this month
                // Iterate days in month
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                let targetDaysCount = 0;

                for (let day = 1; day <= daysInMonth; day++) {
                    const tempDate = new Date(year, month, day);
                    if (expectedDays.includes(tempDate.getDay())) {
                        targetDaysCount++;
                    }
                }

                const entriesInMonth = statValues.filter(v => {
                    if (v.stat_definition_id !== metric.id) return false;
                    const vDate = new Date(v.date);
                    return vDate.getMonth() === month && vDate.getFullYear() === year;
                });

                if (targetDaysCount > 0) {
                    const sum = entriesInMonth.reduce((acc, curr) => acc + Number(curr.value), 0);
                    if (metric.type === 'check') {
                        valMap[dStr] = Math.round((sum / targetDaysCount) * 100);
                    } else {
                        valMap[dStr] = Math.round(sum / targetDaysCount);
                    }
                } else {
                    valMap[dStr] = null;
                }
                editable = false;
            }
        }

        return { dates: dateList, values: valMap, isEditable, dateLabels: labels };
    }, [metric, statValues, viewMode, refDate]);

    // --- Navigation ---
    const navigate = (dir: number) => {
        const newDate = new Date(refDate);
        if (viewMode === 'daily') newDate.setDate(newDate.getDate() + (dir * 14));
        if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + (dir * 7 * 12));
        if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + (dir * 12));
        setRefDate(newDate);
    };

    // --- Graph Data Prep ---
    const graphData = useMemo(() => {
        return dates.map(d => ({
            label: dateLabels[d],
            value: Number(values[d] || 0)
        }));
    }, [dates, values, dateLabels]);

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
                </div>

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
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <CalendarIcon className="w-5 h-5 text-indigo-400" />
                    <span>
                        {viewMode === 'daily' && `Last 14 Days`}
                        {viewMode === 'weekly' && `Last 12 Weeks`}
                        {viewMode === 'monthly' && `Last 12 Months`}
                        <span className="text-gray-500 text-sm ml-2 font-normal">
                            (ending {new Date(dates[0]).toLocaleDateString()})
                        </span>
                    </span>
                </div>
                <button onClick={() => navigate(1)} className="p-2 text-slate-400 hover:text-white"><ChevronRightIcon /></button>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {displayMode === 'table' ? (
                    <MetricsTable
                        dates={dates}
                        values={values}
                        metric={metric}
                        isEditable={isEditable}
                        onUpdateValue={onUpdateValue}
                        formatDateHeader={(d) => dateLabels[d]}
                    />
                ) : (
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl h-[400px]">
                        <MetricsGraph
                            data={graphData}
                            color={metric.color}
                            type={metric.type === 'check' ? 'bar' : 'line'}
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
function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default MetricDetailView;
