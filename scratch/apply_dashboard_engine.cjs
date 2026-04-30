const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../TrackerBuckets.tsx');
let content = fs.readFileSync(file, 'utf8');

const returnStatement = '    return (\n        <div className="tracker-detail-page">';
if (!content.includes('const renderCategoryCard = (catId: string')) {

const renderLogic = `    const renderCategoryCard = (catId: string, rowId: string, slotIdx: number) => {
        const group = effectiveCatGroups.find(g => g.cat.id === catId);
        if (!group) return null;
        const { cat, catTasks } = group;
        const allTasksInCat = catTasks;
        const catLinkedToBucket = (bucket.categoryIds || []).includes(cat.id);
        const catLinkedToPB = activeLinkPB ? activeLinkPB.categoryIds.includes(cat.id) : false;

        let totalCatAtoms = 0;
        let doneCatAtoms = 0;
        allTasksInCat.forEach(t => {
            const hasSubtasks = t.subtasks && t.subtasks.length > 0;
            if (hasSubtasks) {
                t.subtasks.forEach(st => {
                    if (activeLinkPBId || editMode || isSubAnyTracked(t, st) || isAnyTracked(t)) {
                        totalCatAtoms++;
                        if (st.completed) doneCatAtoms++;
                    }
                });
            } else {
                totalCatAtoms++;
                if (t.completed) doneCatAtoms++;
            }
        });
        const catPct = totalCatAtoms === 0 ? 0 : Math.round((doneCatAtoms / totalCatAtoms) * 100);

        return (
            <div key={cat.id} 
                 className={\`td-cat-card \${draggedItem?.id === cat.id ? 'dragging' : ''} \${dragOverTarget?.rowId === rowId && dragOverTarget?.slotIdx === slotIdx ? 'drag-over' : ''}\`}
                 style={{ '--cat-color': cat.color, padding: cardPad } as any}
                 draggable={!activeLinkPBId && !editMode && layoutEditMode}
                 onDragStart={e => handleDragStart(e, cat.id, rowId, slotIdx)}
                 onDragOver={e => handleDragOver(e, rowId, slotIdx)}
                 onDragLeave={() => setDragOverTarget(null)}
                 onDrop={e => handleDrop(e, rowId, slotIdx)}
                 onDragEnd={() => { setDraggedItem(null); setDragOverTarget(null); }}
            >
                <div className="td-cat-header-new">
                    <div className="td-cat-title-new" style={{ fontSize: titleSize }}>{cat.name}</div>
                    <div className="td-cat-stats-new">
                        <div className="td-cat-stats-pct" style={{ color: cat.color, fontSize: pctSize }}>{catPct}%</div>
                        <div className="td-cat-stats-frac">{doneCatAtoms}/{totalCatAtoms}</div>
                    </div>
                </div>
                
                {activeLinkPB && (
                    <button
                        onClick={() => toggleCatInPB(activeLinkPB, cat.id)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 5, padding: '6px 12px', borderRadius: 8,
                            fontSize: '0.72rem', fontWeight: 700, marginBottom: 12,
                            background: catLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.06)',
                            color: catLinkedToPB ? 'white' : '#a1a1aa',
                            border: \`1px solid \${catLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.1)'}\`,
                            transition: 'all 0.15s',
                        }}
                    >
                        {catLinkedToPB ? '✓ Entire Category Linked' : '+ Link Entire Category'}
                    </button>
                )}

                <div className="td-cat-divider" />

                <div className="td-task-list">
                    {allTasksInCat.map(t => {
                        const taskLinkedToPB = activeLinkPB ? isTaskLinkedToPB(activeLinkPB, t) : false;
                        const catLinkedToPBForTask = activeLinkPB ? activeLinkPB.categoryIds.includes(t.categoryId) : false;
                        const hasSubtasks = t.subtasks && t.subtasks.length > 0;
                        const isExpanded = expandedTasks.includes(t.id);

                        return (
                            <div key={t.id}>
                                <div 
                                    className={\`td-task-pill \${hasSubtasks && isExpanded ? 'expanded' : ''}\`} 
                                    onClick={() => {
                                        if (hasSubtasks) {
                                            setExpandedTasks(prev => isExpanded ? prev.filter(id => id !== t.id) : [...prev, t.id]);
                                        } else {
                                            onToggleTask(t.id, t.completed, t.isRecurring);
                                        }
                                    }}
                                >
                                    <button
                                        className="td-task-toggle"
                                        onClick={(e) => { e.stopPropagation(); onToggleTask(t.id, t.completed, t.isRecurring); }}
                                        title={t.completed ? 'Mark incomplete' : 'Mark complete'}
                                    >
                                        <CheckCircleIcon className="w-5 h-5" checked={t.completed} style={{ color: t.completed ? cat.color : 'rgba(255,255,255,0.2)' } as any} />
                                    </button>
                                    <span className={\`td-task-pill-text \${t.completed ? 'done' : ''}\`}>{t.text}</span>
                                    
                                    {hasSubtasks && (
                                        <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, paddingRight: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {t.subtasks.filter(st => st.completed).length}/{t.subtasks.length}
                                            <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.65rem' }}>▶</span>
                                        </span>
                                    )}
                                    
                                    {activeLinkPB && !catLinkedToPBForTask && (
                                        <button
                                            onClick={(e) => toggleTaskInPB(activeLinkPB, t, e)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                                                borderRadius: 8, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8,
                                                background: taskLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.05)',
                                                color: taskLinkedToPB ? 'white' : '#71717a',
                                                border: \`1px solid \${taskLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.08)'}\`,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {taskLinkedToPB ? '✓' : '+'}
                                        </button>
                                    )}
                                    {activeLinkPB && catLinkedToPBForTask && (
                                        <span style={{ fontSize: '0.68rem', color: activeLinkPB.color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>via category</span>
                                    )}
                                </div>

                                {hasSubtasks && isExpanded && (
                                    <div className="td-subtasks-container">
                                        {t.subtasks.map(st => {
                                            const stLinkedToPB = activeLinkPB ? isSubtaskLinkedToPB(activeLinkPB, t, st) : false;
                                            const stViaParentPB = activeLinkPB ? (catLinkedToPBForTask || taskLinkedToPB) : false;
                                            
                                            if (!activeLinkPBId && !editMode && !isSubAnyTracked(t, st) && !isAnyTracked(t)) return null;

                                            return (
                                                <div 
                                                    key={st.id} 
                                                    className="td-subtask-item"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => onToggleSubtask(t.id, st.id, st.completed, st.isRecurring)}
                                                >
                                                    <button
                                                        className="td-task-toggle"
                                                        style={{ opacity: 0.7 }}
                                                        onClick={(e) => { e.stopPropagation(); onToggleSubtask(t.id, st.id, st.completed, st.isRecurring); }}
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" checked={st.completed} style={{ color: st.completed ? cat.color : 'rgba(255,255,255,0.15)' } as any} />
                                                    </button>
                                                    <span className={\`td-subtask-item-text \${st.completed ? 'done' : ''}\`}>{st.text}</span>
                                                    
                                                    {activeLinkPB && !stViaParentPB && (
                                                        <button
                                                            onClick={(e) => toggleSubtaskInPB(activeLinkPB, t, st, e)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                                                                borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                                                                background: activeLinkPB.subtaskTexts.includes(\`\${t.categoryId}::\${t.text}::\${st.text}\`) || activeLinkPB.subtaskTexts.includes(st.text) ? activeLinkPB.color : 'rgba(255,255,255,0.04)',
                                                                color: activeLinkPB.subtaskTexts.includes(\`\${t.categoryId}::\${t.text}::\${st.text}\`) || activeLinkPB.subtaskTexts.includes(st.text) ? 'white' : '#71717a',
                                                                border: \`1px solid \${activeLinkPB.subtaskTexts.includes(\`\${t.categoryId}::\${t.text}::\${st.text}\`) || activeLinkPB.subtaskTexts.includes(st.text) ? activeLinkPB.color : 'rgba(255,255,255,0.06)'}\`,
                                                                transition: 'all 0.15s',
                                                            }}
                                                        >
                                                            {activeLinkPB.subtaskTexts.includes(\`\${t.categoryId}::\${t.text}::\${st.text}\`) || activeLinkPB.subtaskTexts.includes(st.text) ? '✓' : '+'}
                                                        </button>
                                                    )}
                                                    {activeLinkPB && stViaParentPB && (
                                                        <span style={{ fontSize: '0.65rem', color: activeLinkPB.color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>inherited</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

`;

content = content.replace(returnStatement, renderLogic + returnStatement);
}

const renderReplacement = `            {/* ══════════ CATEGORY TASK CARDS ══════════ */}
            <div className="td-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p className="td-section-title" style={{ margin: 0 }}>
                        {activeLinkPB ? \`Tap tasks to link → \${activeLinkPB.label}\` : 'Dashboard Layout'}
                    </p>
                    {(!activeLinkPBId && !editMode) && (
                        <button 
                            onClick={() => setLayoutEditMode(!layoutEditMode)}
                            style={{ 
                                padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, border: 'none',
                                background: layoutEditMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: layoutEditMode ? '#ef4444' : 'white', transition: 'all 0.2s' 
                            }}
                        >
                            {layoutEditMode ? 'Close Editor' : 'Edit Layout'}
                        </button>
                    )}
                </div>

                {effectiveCatGroups.length === 0 ? (
                    <div className="tile-empty">No items tracked yet. Tap the Gear icon or "Add Progress Bar" to link tasks.</div>
                ) : (
                    <div className="td-dashboard-engine">
                        {dashboardRows.map((row) => (
                            <div key={row.id} className="td-dash-row-container" style={{ marginBottom: 24 }}>
                                {layoutEditMode && (
                                     <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                         <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase' }}>Row Config</span>
                                         <button onClick={() => {
                                             const newRows = [...dashboardRows];
                                             const r = newRows.find(x => x.id === row.id)!;
                                             r.columns = Math.min(6, r.columns + 1);
                                             r.slots.push(null);
                                             saveDashboardRows(newRows);
                                         }} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem' }}>+ Column</button>
                                         <button onClick={() => {
                                             const newRows = [...dashboardRows];
                                             const r = newRows.find(x => x.id === row.id)!;
                                             if (r.columns > 1) { r.columns--; r.slots.pop(); }
                                             saveDashboardRows(newRows);
                                         }} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem' }}>- Column</button>
                                         <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', marginLeft: 16 }}>
                                             <input type="checkbox" checked={row.matchHeight} onChange={e => {
                                                 const newRows = [...dashboardRows];
                                                 newRows.find(x => x.id === row.id)!.matchHeight = e.target.checked;
                                                 saveDashboardRows(newRows);
                                             }} />
                                             Match Heights
                                         </label>
                                         <button onClick={() => {
                                             saveDashboardRows(dashboardRows.filter(x => x.id !== row.id));
                                         }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', marginLeft: 'auto' }}>Remove Row</button>
                                     </div>
                                )}
                                
                                <div style={{ 
                                    display: 'grid', gap: compactView ? 12 : 20, 
                                    gridTemplateColumns: \`repeat(\${row.columns}, 1fr)\`,
                                    alignItems: row.matchHeight ? 'stretch' : 'start'
                                }}>
                                     {row.slots.map((slottedCatId, slotIdx) => {
                                          if (!slottedCatId) {
                                              return (
                                                  <div key={\`empty-\${slotIdx}\`} 
                                                       className={\`td-empty-slot \${dragOverTarget?.rowId === row.id && dragOverTarget?.slotIdx === slotIdx ? 'drag-over' : ''}\`}
                                                       style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: 'rgba(0,0,0,0.1)' }}
                                                       onDragOver={e => handleDragOver(e, row.id, slotIdx)}
                                                       onDragLeave={() => setDragOverTarget(null)}
                                                       onDrop={e => handleDrop(e, row.id, slotIdx)}
                                                  >
                                                      <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Empty Slot</span>
                                                  </div>
                                              )
                                          }
                                          return renderCategoryCard(slottedCatId, row.id, slotIdx);
                                     })}
                                </div>
                            </div>
                        ))}
                        
                        {layoutEditMode && (
                             <button onClick={() => {
                                 saveDashboardRows([...dashboardRows, { id: \`r-\${Date.now()}\`, columns: 3, matchHeight: false, slots: [null, null, null] }]);
                             }} style={{ width: '100%', padding: '12px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 700, marginBottom: 32 }}>+ Add New Row</button>
                        )}
                        
                        {(unassignedCatGroups.length > 0 || layoutEditMode) && (
                            <div className="td-unassigned-pool" style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }} 
                                 onDragOver={e => handleDragOver(e, 'unassigned', 0)}
                                 onDragLeave={() => setDragOverTarget(null)}
                                 onDrop={e => {
                                      // Native drop into unassigned area logic natively resets via handleDrop checking 'unassigned'
                                      handleDrop(e, 'unassigned', 0);
                                 }}
                            >
                                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: 16 }}>Unassigned Categories Pool</p>
                                <div style={{ display: 'grid', gridTemplateColumns: \`repeat(auto-fill, minmax(240px, 1fr))\`, gap: 16, minHeight: 120, border: dragOverTarget?.rowId === 'unassigned' ? '1px dashed #a1a1aa' : 'none', padding: 8, borderRadius: 12 }}>
                                    {unassignedCatGroups.map((g, idx) => renderCategoryCard(g.cat.id, 'unassigned', idx))}
                                    {unassignedCatGroups.length === 0 && <div style={{ color: '#52525b', fontSize: '0.8rem' }}>Drag here to return to pool</div>}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}`;

const startReplace = content.indexOf('{/* ══════════ CATEGORY TASK CARDS ══════════ */}');
const endReplace = content.indexOf('// ═══════════════════════════════════════════════ Inline label editor for PB ══');

content = content.substring(0, startReplace) + renderReplacement + '\n\n' + content.substring(endReplace);

fs.writeFileSync(file, content);
console.log("Successfully re-engineered Dashboard into TrackerBuckets.tsx!");
