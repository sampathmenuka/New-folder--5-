import React, { useState } from 'react';

export default function LockScreen({ isLocked, onUnlock }) {
    const [pinInput, setPinInput] = useState('');
    const [errorMsg, setErrorMsg] = useState(false);
    
    if (!isLocked) return null;
    
    const handleKeyPress = (num) => {
        if (pinInput.length < 4) {
            setPinInput(prev => prev + num);
            setErrorMsg(false);
        }
    };
    
    const handleClear = () => {
        setPinInput('');
        setErrorMsg(false);
    };
    
    const handleEnter = () => {
        if (pinInput === '1234') {
            setPinInput('');
            onUnlock();
        } else {
            setPinInput('');
            setErrorMsg(true);
        }
    };
    
    return (
        <div className="lock-overlay">
            <div className="lock-card">
                <div className="lock-shield-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h2>Workstation Locked</h2>
                <p>Workstation locked automatically due to 90 seconds of inactivity. Enter clinical password/PIN to unlock.</p>
                
                <div className="lock-pin-display">
                    {[0, 1, 2, 3].map(i => (
                        <span key={i} className={`pin-dot ${i < pinInput.length ? 'filled' : ''}`} />
                    ))}
                </div>

                {errorMsg && (
                    <div className="lock-error">❌ Incorrect PIN. Please try again. (Hint: PIN is 1234)</div>
                )}

                <div className="lock-keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} className="keypad-btn" onClick={() => handleKeyPress(String(num))}>
                            {num}
                        </button>
                    ))}
                    <button className="keypad-btn text-warning" onClick={handleClear}>CLR</button>
                    <button className="keypad-btn" onClick={() => handleKeyPress('0')}>0</button>
                    <button className="keypad-btn text-success" onClick={handleEnter}>ENT</button>
                </div>
                
                <p className="keypad-hint">Simulated clinical override: enter code <strong>1 2 3 4</strong> or click clear.</p>
            </div>
        </div>
    );
}
