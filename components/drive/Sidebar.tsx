
import React from 'react';
import { CloudIcon, TrashIcon, FolderIcon, SettingsIcon } from '../../icons';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    storageUsed: number;
    storageLimit: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, storageUsed, storageLimit }) => {
    const usagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <CloudIcon className="w-8 h-8 text-indigo-500" />
                <span>AI Drive</span>
            </div>

            <div className="sidebar-nav">
                <div className={`nav-item ${activeTab === 'my-drive' ? 'active' : ''}`} onClick={() => setActiveTab('my-drive')}>
                    <FolderIcon className="w-5 h-5" />
                    <span>My Drive</span>
                </div>
                <div className={`nav-item ${activeTab === 'trash' ? 'active' : ''}`} onClick={() => setActiveTab('trash')}>
                    <TrashIcon className="w-5 h-5" />
                    <span>Trash</span>
                </div>
                <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <SettingsIcon className="w-5 h-5" />
                    <span>Settings</span>
                </div>
            </div>

            <div className="storage-info">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Storage</span>
                    <span>{usagePercent.toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${usagePercent}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    {(storageUsed / 1024 / 1024).toFixed(1)} MB of {(storageLimit / 1024 / 1024).toFixed(0)} MB used
                </div>
            </div>
        </div>
    );
};
