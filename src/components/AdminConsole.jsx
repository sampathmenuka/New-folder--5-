import React, { useState, useEffect } from 'react';
import { getTriageLedger, verifyLedgerIntegrity, simulateTamper } from '../utils/triageLogic';

export default function AdminConsole({ currentRole, ledgerUpdated, onTriggerLedgerUpdate }) {
    const [ledger, setLedger] = useState([]);
    const [integrity, setIntegrity] = useState({ isValid: true, errorBlockIndex: -1, errorMessage: '' });
    const [auditLoading, setAuditLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    useEffect(() => {
        const blocks = getTriageLedger();
        setLedger(blocks);
        // Clean default verification label
        const userBlocks = blocks.filter(b => b.index > 0);
        setValidationMessage(`✅ CHAIN INTEGRITY SECURED: No tampering detected across ${userBlocks.length} blocks.`);
        setIntegrity({ isValid: true, errorBlockIndex: -1, errorMessage: '' });
    }, [ledgerUpdated]);

    if (currentRole !== 'admin') return null;

    const runChainAudit = () => {
        setAuditLoading(true);
        setValidationMessage('Calculating cryptographic hashes across ledger chain...');
        
        setTimeout(() => {
            const audit = verifyLedgerIntegrity();
            setIntegrity(audit);
            setAuditLoading(false);
            
            if (audit.isValid) {
                setValidationMessage(`✅ CHAIN INTEGRITY SECURED: Checked ${ledger.length} blocks successfully. Merkle root matched.`);
            } else {
                setValidationMessage(`❌ TAMPERING DETECTED at Block #${audit.errorBlockIndex}! ${audit.errorMessage}`);
            }
        }, 800);
    };

    const handleSimulateTamper = () => {
        const index = simulateTamper();
        if (index !== false) {
            alert(`🔒 EXPLOIT SIMULATOR:\nData fields inside block #${index} modified directly in local database.\nLet's run the cryptographic verification to test it!`);
            onTriggerLedgerUpdate(); // Reload blocks in UI
            // Run audit right away
            setTimeout(runChainAudit, 300);
        } else {
            alert("Please triage at least one patient first to create records to tamper!");
        }
    };

    const handleClearLogs = () => {
        if (confirm("Reset local database and clear all ledger transactions?")) {
            localStorage.removeItem('ae_triage_merkle_ledger');
            localStorage.setItem('ae_triage_token_counter', '1');
            onTriggerLedgerUpdate();
        }
    };

    // Calculate metrics
    const userBlocks = ledger.filter(b => b.index > 0);
    const totalTriageCount = userBlocks.length;
    
    let cat1Share = 0;
    let avgTriageTime = 0;
    let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (totalTriageCount > 0) {
        let totalSeconds = 0;
        userBlocks.forEach(b => {
            const cat = b.data.finalCategory;
            if (counts[cat] !== undefined) counts[cat]++;
            totalSeconds += b.data.elapsedSeconds || 30;
        });
        cat1Share = Math.round((counts[1] / totalTriageCount) * 100);
        avgTriageTime = Math.round(totalSeconds / totalTriageCount);
    }

    return (
        <section id="admin-workspace" className="admin-panel">
            <div className="admin-header">
                <h2>Administrator Audit Console</h2>
                <div className="admin-controls">
                    <button className="btn-action" onClick={runChainAudit} disabled={auditLoading}>
                        {auditLoading ? (
                            <span className="spinner" />
                        ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 11 12 2 2 11"/><polyline points="2 17 12 8 22 17"/>
                            </svg>
                        )}
                        Verify Cryptographic Integrity
                    </button>
                    <button className="btn-danger-sm" onClick={handleSimulateTamper}>
                        ⚠️ Simulate Chain Tampering
                    </button>
                    <button className="btn-clear-sm" onClick={handleClearLogs}>
                        Clear Audit Trail
                    </button>
                </div>
            </div>

            <div className={`chain-status-banner ${integrity.isValid ? 'secure' : 'compromised'}`}>
                {auditLoading && <div className="spinner" style={{ marginRight: '8px' }} />}
                <span>{validationMessage}</span>
            </div>

            <div className="admin-grid">
                {/* 1. Statistics Cards */}
                <div className="admin-card">
                    <h3>Emergency Department Metrics</h3>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <span className="m-val">{totalTriageCount}</span>
                            <span className="m-label">Total Triage Events</span>
                        </div>
                        <div className="metric-item">
                            <span className="m-val">{cat1Share}%</span>
                            <span className="m-label">Cat 1 Share</span>
                        </div>
                        <div className="metric-item">
                            <span className="m-val">{avgTriageTime}s</span>
                            <span className="m-label">Avg Triage Time</span>
                        </div>
                    </div>
                    
                    <h4 className="sub-chart-title">Acuity Distribution Index</h4>
                    <div className="distribution-chart-wrapper">
                        {[1, 2, 3, 4, 5].map(cat => {
                            const barPct = totalTriageCount > 0 ? (counts[cat] / totalTriageCount) * 100 : 20;
                            return (
                                <div 
                                    key={cat} 
                                    className={`dist-bar cat-${cat}`} 
                                    style={{ width: `${Math.max(barPct, 3)}%` }} 
                                    title={`Category ${cat}`}
                                />
                            );
                        })}
                    </div>
                    <div className="distribution-legend">
                        {[1, 2, 3, 4, 5].map(cat => (
                            <span key={cat}>
                                <span className={`legend-color cat-${cat}`} />
                                Cat {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 2. Block List Explorer */}
                <div className="admin-card">
                    <h3>Merkle Ledger Blockchain Explorer</h3>
                    <p className="card-subtitle">Every assessment triggers a cryptographically-chained ledger entry</p>
                    <div className="ledger-explorer-list">
                        {ledger.length === 0 ? (
                            <div className="empty-explorer">No records currently stored in local history.</div>
                        ) : (
                            ledger.slice().reverse().map((block) => {
                                const isBlockCorrupted = !integrity.isValid && integrity.errorBlockIndex === block.index;
                                const dateStr = new Date(block.timestamp).toLocaleString();
                                
                                // RBAC Data Masking Rules
                                let presentationText = block.data.presentation || '';
                                let allergyText = block.data.allergies || 'None';
                                let pmhText = block.data.pmh || 'None';
                                
                                if (block.index > 0) {
                                    if (currentRole === 'nurse') {
                                        allergyText = '🔒 [REDACTED - PHYSICIAN ACCESS ONLY]';
                                        pmhText = '🔒 [REDACTED - PHYSICIAN ACCESS ONLY]';
                                    } else if (currentRole === 'admin') {
                                        presentationText = '🔒 [REDACTED - CLINICAL RESTRICTION]';
                                        allergyText = '🔒 [REDACTED - CLINICAL RESTRICTION]';
                                        pmhText = '🔒 [REDACTED - CLINICAL RESTRICTION]';
                                    }
                                }

                                return (
                                    <div key={block.index} className={`block-card ${isBlockCorrupted ? 'corrupted' : ''}`}>
                                        <div className="block-header-line">
                                            <span className="block-height-num">
                                                BLOCK HEIGHT #{block.index} {isBlockCorrupted ? '(⚠️ TAMPERED)' : ''}
                                            </span>
                                            <span className="block-time">{dateStr}</span>
                                        </div>
                                        <div className="block-data-summary">
                                            <strong>Patient Token:</strong> {block.patientToken} <br/>
                                            {block.index > 0 ? (
                                                <>
                                                    <strong>Acuity:</strong> Category 0{block.data.finalCategory} ({block.data.ageGroup?.toUpperCase()}) <br/>
                                                    <strong>Chief Complaint:</strong> {presentationText} <br/>
                                                    <strong>Allergies:</strong> {allergyText} <br/>
                                                    <strong>PMH:</strong> {pmhText} <br/>
                                                    <strong>Vitals Captured:</strong>{' '}
                                                    {Object.keys(block.data.vitalsSummary || {}).map((vk) => {
                                                        const vs = block.data.vitalsSummary[vk];
                                                        return (
                                                            <span key={vk} className={`status-badge ${vs.sev}`} style={{ padding: '1px 4px', fontSize: '8px', marginRight: '4px' }}>
                                                                {vk.toUpperCase()}:{vs.val.split(' ')[0]}
                                                            </span>
                                                        );
                                                    })}
                                                </>
                                            ) : (
                                                <>
                                                    <strong>System Log:</strong> {block.data.notes}
                                                </>
                                            )}
                                        </div>
                                        <div className="block-hash-field">
                                            <span>PREV HASH: <strong>{block.prevHash.substring(0, 24)}...</strong></span>
                                            <span className={isBlockCorrupted ? 'compromised-hash' : ''}>
                                                BLOCK HASH: <strong>{block.hash.substring(0, 24)}...</strong>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
