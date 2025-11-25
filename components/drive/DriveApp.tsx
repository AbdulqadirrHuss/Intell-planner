
import React, { useState, useEffect } from 'react';
import './drive.css';
import { Sidebar } from './Sidebar';
import { DriveItem, Breadcrumb } from '../../types';
import { supabase } from '../../supabaseClient';
import { SearchIcon, UploadIcon, FolderIcon, DocumentIcon, ChevronRightIcon } from '../../icons';

export default function DriveApp() {
    const [activeTab, setActiveTab] = useState('my-drive');
    const [items, setItems] = useState<DriveItem[]>([]);
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: 'root', name: 'My Drive' }]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchItems(currentFolder);
    }, [currentFolder]);

    const fetchItems = async (folderId: string | null) => {
        if (!supabase) return;
        let query = supabase.from('drive_items').select('*');
        if (folderId) {
            query = query.eq('parent_id', folderId);
        } else {
            query = query.is('parent_id', null);
        }
        const { data, error } = await query;
        if (data) setItems(data as DriveItem[]);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length || !supabase) return;
        setUploading(true);
        const file = e.target.files[0];
        const path = `${currentFolder || 'root'}/${file.name}`;

        // Upload to Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from('drive')
            .upload(path, file);

        if (storageData) {
            // Create DB Entry
            await supabase.from('drive_items').insert({
                name: file.name,
                type: 'file',
                parent_id: currentFolder,
                size: file.size,
                mime_type: file.type,
                url: storageData.path,
                owner_id: (await supabase.auth.getUser()).data.user?.id
            });
            fetchItems(currentFolder);
        } else {
            console.error(storageError);
            alert('Upload failed: ' + storageError?.message);
        }
        setUploading(false);
    };

    const createFolder = async () => {
        const name = prompt("Folder Name:");
        if (!name || !supabase) return;
        await supabase.from('drive_items').insert({
            name,
            type: 'folder',
            parent_id: currentFolder,
            owner_id: (await supabase.auth.getUser()).data.user?.id
        });
        fetchItems(currentFolder);
    };

    const navigateTo = (folder: DriveItem) => {
        if (folder.type !== 'folder') return;
        setCurrentFolder(folder.id);
        setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    };

    const navigateUp = (index: number) => {
        const newCrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newCrumbs);
        setCurrentFolder(newCrumbs[newCrumbs.length - 1].id === 'root' ? null : newCrumbs[newCrumbs.length - 1].id);
    };

    return (
        <div className="drive-wrapper">
            <div className="drive-layout">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} storageUsed={1024 * 1024 * 150} storageLimit={1024 * 1024 * 1024} />

                <div className="main-content">
                    <div className="drive-header">
                        <div className="search-bar">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search files..." className="search-input" />
                        </div>
                        <div className="flex gap-4">
                            <button className="btn-primary" onClick={createFolder}>
                                <FolderIcon className="w-5 h-5" /> New Folder
                            </button>
                            <label className="btn-primary">
                                {uploading ? 'Uploading...' : <><UploadIcon className="w-5 h-5" /> Upload</>}
                                <input type="file" hidden onChange={handleUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="breadcrumbs">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.id}>
                                {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-600" />}
                                <span className="breadcrumb-item" onClick={() => navigateUp(index)}>{crumb.name}</span>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="file-grid">
                        {items.map(item => (
                            <div key={item.id} className="file-card" onClick={() => navigateTo(item)}>
                                <div className="file-icon-wrapper">
                                    {item.type === 'folder' ? <FolderIcon className="w-10 h-10" /> : <DocumentIcon className="w-10 h-10" />}
                                </div>
                                <div className="file-name">{item.name}</div>
                                <div className="file-meta">{item.size ? (item.size / 1024).toFixed(1) + ' KB' : 'Folder'}</div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                This folder is empty.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
