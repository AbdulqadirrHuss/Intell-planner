const fs = require('fs');

const file = 'TrackerBuckets.tsx';
let c = fs.readFileSync(file, 'utf8');

const target = `                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Color</label>
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={\`tile-swatch \${bucket.color === c ? 'sel' : ''}\`} style={{ background: c }} onClick={() => onUpdate({ color: c })} />)}
                        </div>
                    </div>`;

const replacement = `                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Color</label>
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={\`tile-swatch \${bucket.color === c ? 'sel' : ''}\`} style={{ background: c }} onClick={() => onUpdate({ color: c })} />)}
                        </div>
                    </div>

                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Dashboard Styling</label>
                        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Card Padding</span>
                                <select 
                                    value={cardPad} 
                                    onChange={e => setCardPad(saveStyle(\`td_pad_\${bucket.id}\`, e.target.value))}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', outline: 'none' }}
                                >
                                    <option value="12px 14px" style={{ background: '#2a2640' }}>Compact</option>
                                    <option value="16px 20px" style={{ background: '#2a2640' }}>Normal</option>
                                    <option value="24px 30px" style={{ background: '#2a2640' }}>Spacious</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Title Font</span>
                                <select 
                                    value={titleSize} 
                                    onChange={e => setTitleSize(saveStyle(\`td_tsz_\${bucket.id}\`, e.target.value))}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', outline: 'none' }}
                                >
                                    <option value="0.65rem" style={{ background: '#2a2640' }}>Small</option>
                                    <option value="0.72rem" style={{ background: '#2a2640' }}>Medium</option>
                                    <option value="0.85rem" style={{ background: '#2a2640' }}>Large</option>
                                    <option value="0.95rem" style={{ background: '#2a2640' }}>Extra Large</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Percentage Font</span>
                                <select 
                                    value={pctSize} 
                                    onChange={e => setPctSize(saveStyle(\`td_psz_\${bucket.id}\`, e.target.value))}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', outline: 'none' }}
                                >
                                    <option value="1.5rem" style={{ background: '#2a2640' }}>Small</option>
                                    <option value="1.8rem" style={{ background: '#2a2640' }}>Medium</option>
                                    <option value="2.2rem" style={{ background: '#2a2640' }}>Prominent</option>
                                    <option value="2.8rem" style={{ background: '#2a2640' }}>Massive</option>
                                </select>
                            </div>
                        </div>
                    </div>`;

if (c.includes(target)) {
    console.log("Found target! Replacing...");
    fs.writeFileSync(file, c.replace(target, replacement));
} else {
    // try looser match
    console.log("Strict match failed... Trying substring.");
    const tk1 = '<label className="tile-edit-label">Color</label>';
    const end = '</div>\n                    </div>';
    const sIdx = c.indexOf(tk1);
    if (sIdx !== -1) {
        const eIdx = c.indexOf(end, sIdx);
        if (eIdx !== -1) {
           const before = c.substring(0, sIdx - 24); // grab the parent <div className="tile-edit-section">
           const after = c.substring(eIdx + end.length);
           fs.writeFileSync(file, before + replacement + after);
           console.log("Substring replaced.");
        }
    } else {
        console.log("Could not find start token.");
    }
}
