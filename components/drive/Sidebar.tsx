
import React from 'react';
import { PlannerIcon, CheckIcon, StatsIcon, SettingsIcon } from '../../icons';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: 'planner' | 'tasks' | 'statistics') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <PlannerIcon className="w-5 h-5 text-white" />
                </div>
                <span>IntelliPlanner</span>
            </div>

            <div className="sidebar-nav">
                <div className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
                    <PlannerIcon className="w-5 h-5" />
                    <span>Planner</span>
                </div>
                <div className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    <CheckIcon className="w-5 h-5" />
                    <span>All Tasks</span>
                </div>
                <div className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>
                    <StatsIcon className="w-5 h-5" />
                    <span>Statistics</span>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-800">
                <div className="nav-item">
                    <SettingsIcon className="w-5 h-5" />
                    <span>Settings</span>
                </div>
            </div>
        </div>
    );
};
