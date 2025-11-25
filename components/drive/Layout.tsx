
import React from 'react';
import './drive.css';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'planner' | 'tasks' | 'statistics';
    setActiveTab: (tab: 'planner' | 'tasks' | 'statistics') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="drive-wrapper">
            <div className="drive-layout">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="main-content relative">
                    {children}
                </div>
            </div>
        </div>
    );
};
