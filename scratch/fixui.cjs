const fs = require('fs');

// Patch index.css
let idx = fs.readFileSync('index.css', 'utf8');
idx = idx.replace('--bg-primary: #0f0e17;', '--bg-primary: #0b1120;');
idx = idx.replace('--bg-surface: #1a1830;', '--bg-surface: #111827;');
idx = idx.replace('--bg-raised: #231f40;', '--bg-raised: #1f2937;');
idx = idx.replace('--bg-card: #1e1c35;', '--bg-card: #1e293b;');
idx = idx.replace('--bg-input: #12101f;', '--bg-input: #0f172a;');
fs.writeFileSync('index.css', idx);

// Patch TrackerBuckets.tsx
let tb = fs.readFileSync('TrackerBuckets.tsx', 'utf8');
// Gap between PB cards
tb = tb.replace(`                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>`, `                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>`);

// Mini widget layout definition
tb = tb.replace(`                                <div key={pb.id} className="td-pb-mini-widget" style={{ \r
                                    display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', \r
                                    padding: '8px 12px 8px 8px', borderRadius: 30, border: isLinking ? \`1px solid \${pb.color}\` : '1px solid rgba(255,255,255,0.05)',\r
                                    boxShadow: isLinking ? \`0 0 12px \${pb.color}40\` : 'none', transition: 'all 0.2s', minWidth: 160\r
                                }}>`, `                                <div key={pb.id} className="td-pb-mini-widget" style={{ \r
                                    display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.02)', \r
                                    padding: '12px 18px 12px 12px', borderRadius: 30, border: isLinking ? \`1px solid \${pb.color}\` : '1px solid rgba(255,255,255,0.05)',\r
                                    boxShadow: isLinking ? \`0 0 12px \${pb.color}40\` : 'none', transition: 'all 0.2s', minWidth: 200\r
                                }}>`);

// Empty slot hiding when layoutEditMode is false
tb = tb.replace(`                                          if (!slottedCatId) {\r
                                              return (\r
                                                  <div key={\`empty-\${slotIdx}\`} \r
                                                       className={\`td-empty-slot \${dragOverTarget?.rowId === row.id && dragOverTarget?.slotIdx === slotIdx ? 'drag-over' : ''}\`}\r
                                                       style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: 'rgba(0,0,0,0.1)' }}\r
                                                       onDragOver={e => handleDragOver(e, row.id, slotIdx)}\r
                                                       onDragLeave={() => setDragOverTarget(null)}\r
                                                       onDrop={e => handleDrop(e, row.id, slotIdx)}\r
                                                  >\r
                                                      <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Empty Slot</span>\r
                                                  </div>\r
                                              )\r
                                          }`, `                                          if (!slottedCatId) {\r
                                              return layoutEditMode ? (\r
                                                  <div key={\`empty-\${slotIdx}\`} \r
                                                       className={\`td-empty-slot \${dragOverTarget?.rowId === row.id && dragOverTarget?.slotIdx === slotIdx ? 'drag-over' : ''}\`}\r
                                                       style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: 'rgba(0,0,0,0.1)' }}\r
                                                       onDragOver={e => handleDragOver(e, row.id, slotIdx)}\r
                                                       onDragLeave={() => setDragOverTarget(null)}\r
                                                       onDrop={e => handleDrop(e, row.id, slotIdx)}\r
                                                  >\r
                                                      <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Empty Slot</span>\r
                                                  </div>\r
                                              ) : (\r
                                                  <div key={\`empty-\${slotIdx}\`} style={{ visibility: 'hidden' }} />\r
                                              );\r
                                          }`);

fs.writeFileSync('TrackerBuckets.tsx', tb);
console.log('UI Patched!');
