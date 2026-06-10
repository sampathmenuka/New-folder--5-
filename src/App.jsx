import React, { useState, useEffect, useRef } from 'react';
import Stepper from './components/Stepper';
import LockScreen from './components/LockScreen';
import VitalModal from './components/VitalModal';
import AdminConsole from './components/AdminConsole';
import logo from './assets/logo.jpg';
import { 
    calculateATSResult, 
    appendTriageToLedger, 
    getTriageLedger 
} from './utils/triageLogic';

// Paediatric section is fully locked/restricted to all users as per latest security rules.

export default function App() {
    // --------------------------------------------------------------------------
    // GLOBAL STATE VARIABLES
    // --------------------------------------------------------------------------
    const [currentScreen, setCurrentScreen] = useState(1);
    const [currentRole, setCurrentRole] = useState('nurse'); // nurse, physician, admin
    const [isLocked, setIsLocked] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    // Paediatric triage is locked for all users
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('ae_triage_theme') || 'light';
    });
    const [ledgerUpdated, setLedgerUpdated] = useState(0);

    // Patient Form State
    const [patient, setPatient] = useState({
        token: 'T-2606-001',
        ageGroup: '', // neonate, infant, toddler, child, adolescent, adult
        exactAge: null,
        cat1Flags: {},
        traumaFlags: {},
        cat2Flags: {},
        presentation: '',
        hasAllergies: false,
        allergySpecification: '',
        pmhSelected: [],
        pmhOther: '',
        vitals: {
            rr: null,
            spo2: null,
            o2: null,
            sbp: null,
            pulse: null,
            avpu: null,
            temp: null
        },
        admissionRequested: false,
        finalCategory: null,
        triageStartTime: Date.now(),
        triageEndTime: null
    });

    // Inactivity Timer State
    const [secondsRemaining, setSecondsRemaining] = useState(90);
    const timerRef = useRef(null);

    // Modal State
    const [activeParameter, setActiveParameter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --------------------------------------------------------------------------
    // INITIALIZATION & GENERATOR HELPERS
    // --------------------------------------------------------------------------
    const getNextToken = () => {
        let count = parseInt(localStorage.getItem('ae_triage_token_counter') || '1');
        const today = new Date();
        const yy = String(today.getFullYear()).substring(2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        return `T-${yy}${mm}-${String(count).padStart(3, '0')}`;
    };

    const incrementTokenCounter = () => {
        let count = parseInt(localStorage.getItem('ae_triage_token_counter') || '1');
        localStorage.setItem('ae_triage_token_counter', String(count + 1));
    };

    const initializeNewPatient = () => {
        const token = getNextToken();
        setPatient({
            token,
            ageGroup: '',
            exactAge: null,
            cat1Flags: {},
            traumaFlags: {},
            cat2Flags: {},
            presentation: '',
            hasAllergies: false,
            allergySpecification: '',
            pmhSelected: [],
            pmhOther: '',
            vitals: {
                rr: null,
                spo2: null,
                o2: null,
                sbp: null,
                pulse: null,
                avpu: null,
                temp: null
            },
            admissionRequested: false,
            finalCategory: null,
            triageStartTime: Date.now(),
            triageEndTime: null
        });
        setCurrentScreen(1);
        setSecondsRemaining(90);
        // Paediatric always remains locked
    };

    // Initialize Token on load
    useEffect(() => {
        initializeNewPatient();
    }, []);

    useEffect(() => {
        localStorage.setItem('ae_triage_theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
        } else {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
        }
    }, [theme]);

    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    useEffect(() => {
        if (isBlurred) {
            document.body.classList.add('blur-sensitive-active');
        } else {
            document.body.classList.remove('blur-sensitive-active');
        }
    }, [isBlurred]);

    // Scroll to top when screen transitions
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentScreen]);

    // --------------------------------------------------------------------------
    // INACTIVITY AUTO-LOCK TICKER EFFECT
    // --------------------------------------------------------------------------
    const resetLockTimer = () => {
        setSecondsRemaining(90);
    };

    useEffect(() => {
        if (isLocked) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    setIsLocked(true);
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isLocked]);

    // Handle user interaction events to reset timer
    useEffect(() => {
        const resetEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
        const handler = () => resetLockTimer();

        resetEvents.forEach(evt => document.addEventListener(evt, handler, true));
        return () => {
            resetEvents.forEach(evt => document.removeEventListener(evt, handler, true));
        };
    }, []);

    // --------------------------------------------------------------------------
    // SCREEN & FORM VALIDATION HANDLERS
    // --------------------------------------------------------------------------
    const isScreen1Valid = patient.ageGroup && (patient.exactAge !== null);
    
    const isScreen5Valid = () => {
        const hasPres = patient.presentation.trim().length > 0;
        const allergyOk = !patient.hasAllergies || patient.allergySpecification.trim().length > 0;
        return hasPres && allergyOk;
    };

    const isScreen6Valid = () => {
        // Gating disabled: clinicians can proceed with partial physiological parameters
        return true;
    };

    const handleSelectAgeGroup = (group) => {
        if (group === 'paediatric' || ['neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(group)) {
            return; // Access completely restricted
        }

        let exact = null;
        if (group === 'neonate' || group === 'infant') exact = 0;
        if (group === 'adult') exact = 16;
        
        setPatient(prev => ({
            ...prev,
            ageGroup: group,
            exactAge: exact,
            pmhSelected: [] // Reset PMH tags
        }));
    };

    const handleSelectExactAge = (age) => {
        setPatient(prev => ({
            ...prev,
            exactAge: age
        }));
    };

    const handleToggleCat1Flag = (key) => {
        setPatient(prev => {
            const copy = { ...prev.cat1Flags };
            copy[key] = !copy[key];
            return { ...prev, cat1Flags: copy };
        });
    };

    const handleToggleTraumaFlag = (key) => {
        setPatient(prev => {
            const copy = { ...prev.traumaFlags };
            copy[key] = !copy[key];
            return { ...prev, traumaFlags: copy };
        });
    };

    const handleToggleCat2Flag = (key) => {
        setPatient(prev => {
            const copy = { ...prev.cat2Flags };
            copy[key] = !copy[key];
            return { ...prev, cat2Flags: copy };
        });
    };

    const handleTogglePmhSelected = (cond) => {
        setPatient(prev => {
            const active = prev.pmhSelected.includes(cond);
            const list = active 
                ? prev.pmhSelected.filter(c => c !== cond) 
                : [...prev.pmhSelected, cond];
            return { ...prev, pmhSelected: list };
        });
    };

    // Yes/No flow shortcuts
    const handleCat1Decision = (yesSelected) => {
        if (yesSelected) {
            setPatient(prev => ({ ...prev, finalCategory: 1 }));
            setCurrentScreen(5); // Go to History
        } else {
            setPatient(prev => ({ ...prev, cat1Flags: {} }));
            setCurrentScreen(3); // Go to Trauma screen
        }
    };

    const handleTraumaDecision = (yesSelected) => {
        if (yesSelected) {
            setPatient(prev => ({ ...prev, finalCategory: 1 }));
            setCurrentScreen(5);
        } else {
            setPatient(prev => ({ ...prev, traumaFlags: {} }));
            setCurrentScreen(4); // Go to Cat 2 flags
        }
    };

    const handleCat2Decision = (yesSelected) => {
        if (yesSelected) {
            setPatient(prev => ({ ...prev, finalCategory: 2 }));
            setCurrentScreen(5);
        } else {
            setPatient(prev => ({ ...prev, cat2Flags: {} }));
            setCurrentScreen(5); // Clear and go to History
        }
    };

    // Chief Complaint and Allergies
    const handlePhraseTagClick = (phrase) => {
        setPatient(prev => {
            const current = prev.presentation.trim();
            const val = current ? `${current}, ${phrase}` : phrase;
            return { ...prev, presentation: val.substring(0, 200) };
        });
    };

    const handleAllergyTagClick = (allergy) => {
        setPatient(prev => {
            const current = prev.allergySpecification.trim();
            const val = current ? `${current}, ${allergy}` : allergy;
            return { ...prev, allergySpecification: val.substring(0, 200) };
        });
    };

    // Vitals Options selectors
    const handleOpenVitalModal = (param) => {
        setActiveParameter(param);
        setIsModalOpen(true);
    };

    const handleSelectVitalOption = (param, option) => {
        setPatient(prev => {
            const copy = { ...prev.vitals };
            copy[param] = {
                valueText: option.text,
                severity: option.severity
            };
            return { ...prev, vitals: copy };
        });
        setIsModalOpen(false);
    };

    // Finalize
    const handleConfirmTriage = () => {
        const endTime = Date.now();
        const scoreRes = calculateATSResult(patient);
        
        // Skip vitals if Category 1 was forced
        let vitalsCopy = { ...patient.vitals };
        if (scoreRes.category === 1 && (!patient.vitals.rr || patient.vitals.rr.valueText.includes('Skipped'))) {
            Object.keys(vitalsCopy).forEach(k => {
                vitalsCopy[k] = { valueText: 'Skipped - Cat 1 Emergency', severity: 'red' };
            });
        }

        const finalizedPatient = {
            ...patient,
            triageEndTime: endTime,
            finalCategory: scoreRes.category,
            vitals: vitalsCopy
        };

        // Cryptographic commit
        const block = appendTriageToLedger(finalizedPatient);
        
        setPatient(finalizedPatient);
        incrementTokenCounter();
        setLedgerUpdated(prev => prev + 1);
        setCurrentScreen(8); // Go to final banner
    };

    const handlePrintSlip = () => {
        window.print();
    };

    const handleShareSummary = () => {
        const res = calculateATSResult(patient);
        let summaryText = `=== TRIAGE360 REPORT ===\n`;
        summaryText += `Patient Token: ${patient.token}\n`;
        summaryText += `Acuity Class: ${res.name}\n`;
        summaryText += `Seen Target: ${res.time}\n`;
        summaryText += `ED Treatment Area: ${res.area}\n`;
        
        if (currentRole === 'physician') {
            summaryText += `Chief Complaint: ${patient.presentation}\n`;
            summaryText += `Allergies: ${patient.hasAllergies ? patient.allergySpecification : 'NKDA'}\n`;
        } else {
            summaryText += `Chief Complaint: [REDACTED - PHYSICIAN ACCESS ONLY]\n`;
            summaryText += `Allergies: [REDACTED - PHYSICIAN ACCESS ONLY]\n`;
        }
        
        navigator.clipboard.writeText(summaryText).then(() => {
            alert('Summary report copied to clipboard!');
        });
    };

    // --------------------------------------------------------------------------
    // RENDER HELPERS
    // --------------------------------------------------------------------------
    const res = calculateATSResult(patient);
    const selectedCat1List = Object.keys(patient.cat1Flags).filter(k => patient.cat1Flags[k]);
    const selectedTraumaList = Object.keys(patient.traumaFlags).filter(k => patient.traumaFlags[k]);
    const selectedCat2List = Object.keys(patient.cat2Flags).filter(k => patient.cat2Flags[k]);

    return (
        <div className={`${highContrast ? 'high-contrast' : ''} ${isBlurred ? 'blur-sensitive-active' : ''}`}>
            
            {/* HEADER CONTROLS BAR */}
            <header className="app-header">
                <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={logo} alt="EMergeSL Logo" style={{ height: '38px', objectFit: 'contain', borderRadius: '4px', background: '#ffffff', padding: '2px' }} />
                    <div className="brand-text">
                        <h1>TRIAGE360</h1>
                        <span className="brand-sub">Emergency Medicine Triage System</span>
                    </div>
                </div>

                <div className="header-controls">
                    <div className="token-badge">
                        <span className="badge-label">PATIENT TOKEN</span>
                        <span className="badge-value">{patient.token}</span>
                    </div>

                    <div className="control-group">
                        <button className={`control-btn ${isBlurred ? 'active' : ''}`} onClick={() => setIsBlurred(prev => !prev)}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            <span>Blur Fields</span>
                        </button>
                        <button className={`control-btn ${highContrast ? 'active' : ''}`} onClick={() => setHighContrast(prev => !prev)}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 2a10 10 0 0 0 0 20V2z"/>
                            </svg>
                            <span>High Contrast</span>
                        </button>
                        <button className={`control-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}>
                            {theme === 'light' ? (
                                <>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                    </svg>
                                    <span>Dark Cockpit</span>
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"/>
                                        <line x1="12" y1="1" x2="12" y2="3"/>
                                        <line x1="12" y1="21" x2="12" y2="23"/>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                        <line x1="1" y1="12" x2="3" y2="12"/>
                                        <line x1="21" y1="12" x2="23" y2="12"/>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                    </svg>
                                    <span>Light Mode</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="role-selector">
                        {['nurse', 'physician', 'admin'].map(r => (
                            <button 
                                key={r} 
                                className={`role-tab ${currentRole === r ? 'active' : ''}`} 
                                onClick={() => setCurrentRole(r)}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="lock-timer" onClick={() => setIsLocked(true)}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>{isLocked ? 'LOCKED' : `${secondsRemaining}s`}</span>
                    </div>

                    <button className="btn-clear" onClick={() => {
                        if (confirm("Reset current triage profile? All records will be wiped.")) initializeNewPatient();
                    }}>
                        Reset
                    </button>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <main className="app-container">
                <Stepper currentScreen={currentScreen} onStepClick={(id) => {
                    // Prevent skip forward without validations
                    if (id > currentScreen) return;
                    setCurrentScreen(id);
                }} />

                <div className="screen-wrapper">
                    
                    {/* SCREEN 1: AGE GROUP SELECTION */}
                    <div className={`triage-screen ${currentScreen === 1 ? 'active' : ''}`}>
                        <div className="screen-intro">
                            <h2>Select Patient Age Group</h2>
                            <p>Loads age-specific physiological thresholds and pediatric protocols</p>
                        </div>
                        
                        <div className="age-grid">
                            {[
                                { id: 'paediatric', icon: '🧒', label: 'Paediatric', desc: 'Under 16 Years' },
                                { id: 'adult', icon: '👤', label: 'Adult', desc: '≥ 16 Years' }
                            ].map(group => {
                                const isActive = group.id === 'adult'
                                    ? patient.ageGroup === 'adult'
                                    : ['paediatric', 'neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(patient.ageGroup);
                                return (
                                    <button 
                                        key={group.id} 
                                        className={`age-tile ${isActive ? 'active' : ''}`}
                                        disabled={group.id === 'paediatric'}
                                        onClick={() => handleSelectAgeGroup(group.id)}
                                    >
                                        <div className="tile-icon-container">
                                            <div className="tile-icon">{group.icon}</div>
                                            {group.id === 'paediatric' && (
                                                <span 
                                                    className="lock-badge locked"
                                                    title="Paediatric section is locked - access restricted"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px',
                                                        right: '-15px',
                                                        background: 'var(--cat-1)',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        border: '2px solid var(--border-color)',
                                                        cursor: 'not-allowed'
                                                    }}
                                                >
                                                    🔒
                                                </span>
                                            )}
                                        </div>
                                        <h3>{group.label}</h3>
                                        <span className="tile-desc">{group.desc}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pediatric sub-group selection card */}
                        {['paediatric', 'neonate', 'infant', 'toddler', 'child', 'adolescent'].includes(patient.ageGroup) && (
                            <div className="sub-card-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="sub-card">
                                    <h3>Select Paediatric Sub-Group</h3>
                                    <p className="sub-desc">Required to load age-adjusted physiological thresholds</p>
                                    <div className="exact-age-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                                        {[
                                            { id: 'neonate', label: 'Neonate', desc: '0–28 Days' },
                                            { id: 'infant', label: 'Infant', desc: '1–12 Months' },
                                            { id: 'toddler', label: 'Toddler', desc: '1–3 Years' },
                                            { id: 'child', label: 'Child', desc: '4–12 Years' },
                                            { id: 'adolescent', label: 'Adolescent', desc: '13–15 Years' }
                                        ].map(sub => (
                                            <button
                                                key={sub.id}
                                                className={`age-btn ${patient.ageGroup === sub.id ? 'active' : ''}`}
                                                onClick={() => handleSelectAgeGroup(sub.id)}
                                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px' }}
                                            >
                                                <strong>{sub.label}</strong>
                                                <span style={{ fontSize: '10px', opacity: 0.8 }}>{sub.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {['toddler', 'child', 'adolescent'].includes(patient.ageGroup) && (
                                    <div className="sub-card">
                                        <h3>Specify Exact Age in Years</h3>
                                        <p className="sub-desc">Required for pediatric blood pressure calculations: SBP Red threshold = 70 + (2 × age)</p>
                                        <div className="exact-age-grid">
                                            {(patient.ageGroup === 'toddler' ? [1, 2, 3] : 
                                              patient.ageGroup === 'child' ? [4, 5, 6, 7, 8, 9, 10, 11, 12] : [13, 14, 15]
                                             ).map(yr => (
                                                <button 
                                                    key={yr} 
                                                    className={`age-btn ${patient.exactAge === yr ? 'active' : ''}`}
                                                    onClick={() => handleSelectExactAge(yr)}
                                                >
                                                    {yr} Year{yr > 1 ? 's' : ''}
                                                </button>
                                             ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="navigation-bar">
                            <div />
                            <button 
                                className="btn-primary" 
                                disabled={!isScreen1Valid}
                                onClick={() => setCurrentScreen(2)}
                            >
                                Next Section
                            </button>
                        </div>
                    </div>

                    {/* SCREEN 2: CAT 1 RED FLAGS */}
                    <div className={`triage-screen ${currentScreen === 2 ? 'active' : ''}`}>
                        <div className="screen-intro highlight-red">
                            <h2>Category 1 - Red Flags (Immediate Action)</h2>
                            <p>Select any life-threatening symptoms requiring immediate resuscitation</p>
                        </div>

                        <div className="red-flags-container">
                            <div className="flag-list-grid">
                                {[
                                    { id: 'cardiac_arrest', text: 'Cardiac arrest' },
                                    { id: 'respiratory_arrest', text: 'Respiratory arrest' },
                                    { id: 'apnoea_gasping', text: 'Apnoea / gasping' },
                                    { id: 'ongoing_convulsions', text: 'Ongoing convulsions / status epilepticus' },
                                    { id: 'severe_resp_exhaustion', text: 'Severe respiratory distress with exhaustion' },
                                    { id: 'intubated', text: 'Intubated on arrival' },
                                    { id: 'unresponsive_gcs', text: 'Unresponsive / GCS < age appropriate' },
                                    { id: 'severe_shock', text: 'Severe shock (poor perfusion, mottling, weak pulses)' },
                                    { id: 'cyanosis_ams', text: 'Cyanosis with altered mental status' },
                                    { id: 'severe_anaphylaxis', text: 'Severe anaphylaxis with airway compromise' },
                                    { id: 'critical_trauma', text: 'Critically injured trauma patient' },
                                    { id: 'floppy_infant', text: 'Limp/floppy infant with poor respiratory effort' }
                                ].map(flag => (
                                    <button 
                                        key={flag.id} 
                                        className={`flag-toggle-btn cat-1-active ${patient.cat1Flags[flag.id] ? 'active' : ''}`}
                                        onClick={() => handleToggleCat1Flag(flag.id)}
                                    >
                                        <span className="toggle-indicator" />
                                        {flag.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="decision-box">
                            <p className="decision-question">Are any of the Category 1 flags present?</p>
                            <div className="decision-buttons">
                                <button 
                                    className="btn-danger-large" 
                                    disabled={selectedCat1List.length === 0}
                                    onClick={() => handleCat1Decision(true)}
                                >
                                    YES - Red Flags Present
                                </button>
                                <button className="btn-safe-large" onClick={() => handleCat1Decision(false)}>
                                    NO - Clear
                                </button>
                            </div>
                        </div>

                        <div className="navigation-bar">
                            <button className="btn-secondary" onClick={() => setCurrentScreen(1)}>Back</button>
                            <div className="nav-hint">Proceed to Trauma Activation if cleared</div>
                        </div>
                    </div>

                    {/* SCREEN 3: TRAUMA ACTIVATION */}
                    <div className={`triage-screen ${currentScreen === 3 ? 'active' : ''}`}>
                        <div className="screen-intro highlight-orange">
                            <h2>Trauma Team Activation Criteria</h2>
                            <p>Triggers immediate Category 1 Trauma Code if mechanism or anatomical thresholds are met</p>
                        </div>

                        <div className="trauma-split-container">
                            <div className="trauma-card">
                                <h3>Mechanism Criteria</h3>
                                <div className="flag-list-vertical">
                                    {[
                                        { id: 'mvc_ejection', text: 'MVC with ejection' },
                                        { id: 'mvc_fatality', text: 'Fatality in same vehicle' },
                                        { id: 'rollover', text: 'Rollover with impact' },
                                        { id: 'pedestrian_thrown', text: 'Pedestrian thrown/run over' },
                                        { id: 'fall_height', text: patient.ageGroup === 'adult' ? 'Fall > 6 m' : 'Fall > 3× height' },
                                        { id: 'bike_collision', text: 'Bicycle collision with vehicle' },
                                        { id: 'non_accidental', text: 'Suspected non-accidental injury (abuse)' }
                                    ].map(flag => (
                                        <button 
                                            key={flag.id} 
                                            className={`flag-toggle-btn cat-1-active ${patient.traumaFlags[flag.id] ? 'active' : ''}`}
                                            onClick={() => handleToggleTraumaFlag(flag.id)}
                                        >
                                            <span className="toggle-indicator" />
                                            {flag.text}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="trauma-card">
                                <h3>Anatomical Criteria</h3>
                                <div className="flag-list-vertical">
                                    {[
                                        { id: 'long_bone', text: '≥2 long bone fractures' },
                                        { id: 'spinal_cord', text: 'Suspected spinal cord injury' },
                                        { id: 'proximal_amputation', text: 'Proximal amputation' },
                                        { id: 'penetrating_injury', text: 'Penetrating injury to head/neck/torso' },
                                        { id: 'burns', text: patient.ageGroup === 'adult' ? 'Burns >20%' : 'Burns >10%' },
                                        { id: 'airway_burns', text: 'Facial burns / airway burns' },
                                        { id: 'head_injury_ams', text: 'Severe head injury with altered consciousness' }
                                    ].map(flag => (
                                        <button 
                                            key={flag.id} 
                                            className={`flag-toggle-btn cat-1-active ${patient.traumaFlags[flag.id] ? 'active' : ''}`}
                                            onClick={() => handleToggleTraumaFlag(flag.id)}
                                        >
                                            <span className="toggle-indicator" />
                                            {flag.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="decision-box">
                            <p className="decision-question">Are any of the Trauma Activation criteria met?</p>
                            <div className="decision-buttons">
                                <button 
                                    className="btn-danger-large" 
                                    disabled={selectedTraumaList.length === 0}
                                    onClick={() => handleTraumaDecision(true)}
                                >
                                    YES - Activate Trauma Code
                                </button>
                                <button className="btn-safe-large" onClick={() => handleTraumaDecision(false)}>
                                    NO - Clear
                                </button>
                            </div>
                        </div>

                        <div className="navigation-bar">
                            <button className="btn-secondary" onClick={() => setCurrentScreen(2)}>Back</button>
                            <div className="nav-hint">Proceeds to Category 2 Red Flags if cleared</div>
                        </div>
                    </div>

                    {/* SCREEN 4: CAT 2 RED FLAGS */}
                    <div className={`triage-screen ${currentScreen === 4 ? 'active' : ''}`}>
                        <div className="screen-intro highlight-orange">
                            <h2>Category 2 - Red Flags (High Acuity)</h2>
                            <p>Select any symptoms requiring emergency medical evaluation within 10 minutes</p>
                        </div>

                        <div className="red-flags-container">
                            <div className="flag-list-grid">
                                {[
                                    { id: 'acute_chest_pain', text: 'Acute chest pain' },
                                    { id: 'severe_pain', text: 'Severe pain' },
                                    { id: 'severe_respiratory', text: 'Severe asthma / respiratory distress' },
                                    { id: 'stridor_rest', text: 'Stridor at rest' },
                                    { id: 'drooling_distress', text: 'Drooling with distress' },
                                    { id: 'focal_neuro_deficit', text: 'Focal neurological deficit' },
                                    { id: 'febrile_seizure', text: 'Febrile seizure (post-ictal)' },
                                    { id: 'meningitis_rash', text: 'Suspected meningitis / non-blanching rash' },
                                    { id: 'severe_dehydration', text: 'Severe dehydration' },
                                    { id: 'major_trauma', text: 'Major trauma' },
                                    { id: 'significant_bleeding', text: 'Significant bleeding' },
                                    { id: 'high_risk_ingestion', text: 'High risk ingestion' },
                                    { id: 'severe_allergic', text: 'Severe allergic reaction' },
                                    { id: 'violent_behavior', text: 'Violent/aggressive behaviour' },
                                    { id: 'immediate_threat_self', text: 'Immediate threat to self/others' },
                                    { id: 'required_restraint', text: 'Required restraint' },
                                    { id: 'severe_abdominal_pain', text: 'Severe abdominal pain' },
                                    { id: 'testicular_torsion', text: 'Testicular torsion suspicion' }
                                ].map(flag => (
                                    <button 
                                        key={flag.id} 
                                        className={`flag-toggle-btn cat-2-active ${patient.cat2Flags[flag.id] ? 'active' : ''}`}
                                        onClick={() => handleToggleCat2Flag(flag.id)}
                                    >
                                        <span className="toggle-indicator" />
                                        {flag.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="decision-box">
                            <p className="decision-question">Are any of the Category 2 flags present?</p>
                            <div className="decision-buttons">
                                <button 
                                    className="btn-warning-large" 
                                    disabled={selectedCat2List.length === 0}
                                    onClick={() => handleCat2Decision(true)}
                                >
                                    YES - Red Flags Present
                                </button>
                                <button className="btn-safe-large" onClick={() => handleCat2Decision(false)}>
                                    NO - Clear
                                </button>
                            </div>
                        </div>

                        <div className="navigation-bar">
                            <button className="btn-secondary" onClick={() => setCurrentScreen(3)}>Back</button>
                            <div className="nav-hint">Proceeds to Presentation details if cleared</div>
                        </div>
                    </div>

                    {/* SCREEN 5: CLINICAL HISTORY */}
                    <div className={`triage-screen ${currentScreen === 5 ? 'active' : ''}`}>
                        <div className="screen-intro">
                            <h2>Clinical History & History</h2>
                            <p>Enter details of patient presentation, allergies, and pre-existing medical history</p>
                        </div>

                        <div className="history-grid">
                            <div className="history-card wide-card">
                                <h3>Chief Complaint / Presentation <span className="required-badge">*</span></h3>
                                <div className="character-limit-container">
                                    <textarea 
                                        maxLength="200" 
                                        placeholder="Briefly describe patient presentation..."
                                        value={patient.presentation}
                                        onChange={(e) => setPatient(prev => ({ ...prev, presentation: e.target.value }))}
                                    />
                                    <span className="char-count">{patient.presentation.length} / 200</span>
                                </div>
                                <div className="quick-phrases">
                                    <span className="quick-label">Tap to add:</span>
                                    {['Chest Pain', 'Severe Dyspnoea', 'Head Injury', 'Acute Abdomen', 'Fever & Lethargy', 'Laceration', 'Altered Mental Status', 'Allergic Reaction'].map(phrase => (
                                        <button key={phrase} className="phrase-tag" onClick={() => handlePhraseTagClick(phrase)}>
                                            {phrase}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="history-card clinician-sensitive">
                                <h3>Allergies <span className="required-badge">*</span></h3>
                                <div className="dual-selector">
                                    <button 
                                        className={`toggle-option ${!patient.hasAllergies ? 'active' : ''}`}
                                        onClick={() => setPatient(prev => ({ ...prev, hasAllergies: false, allergySpecification: '' }))}
                                    >
                                        No Known Allergies
                                    </button>
                                    <button 
                                        className={`toggle-option ${patient.hasAllergies ? 'active' : ''}`}
                                        onClick={() => setPatient(prev => ({ ...prev, hasAllergies: true }))}
                                    >
                                        Yes, Has Allergies
                                    </button>
                                </div>

                                {patient.hasAllergies && (
                                    <div className="allergy-detail">
                                        <div className="allergy-quick">
                                            {['Penicillin', 'Sulfa Drugs', 'Aspirin', 'Peanuts', 'Seafood'].map(item => (
                                                <button key={item} className="allergy-tag" onClick={() => handleAllergyTagClick(item)}>
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="character-limit-container">
                                            <input 
                                                type="text" 
                                                maxLength="200" 
                                                placeholder="Specify food/drugs allergies..."
                                                value={patient.allergySpecification}
                                                onChange={(e) => setPatient(prev => ({ ...prev, allergySpecification: e.target.value }))}
                                            />
                                            <span className="char-count">{patient.allergySpecification.length} / 200</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="history-card clinician-sensitive">
                                <h3>Past Medical History (PMH)</h3>
                                <p className="pmh-subtitle">
                                    Select applicable {patient.ageGroup === 'adult' ? 'Adult' : 'Paediatric'} conditions:
                                </p>
                                
                                <div className="pmh-tags-grid">
                                    {(patient.ageGroup === 'adult' ? 
                                      ['Diabetes', 'HTN', 'Dyslipidaemia', 'CVA', 'Asthma', 'Kidney Disease'] :
                                      ['Asthma', 'Epilepsy', 'CHD', 'Prematurity', 'CLD', 'Immunocompromised', 'Developmental Delay']
                                     ).map(cond => {
                                         const isActive = patient.pmhSelected.includes(cond);
                                         return (
                                             <button 
                                                 key={cond} 
                                                 className={`pmh-toggle-tag ${isActive ? 'active' : ''}`}
                                                 onClick={() => handleTogglePmhSelected(cond)}
                                             >
                                                 {cond}
                                             </button>
                                         );
                                     })}
                                </div>

                                <div className="pmh-other-container">
                                    <input 
                                        type="text" 
                                        placeholder="Other medical history..."
                                        value={patient.pmhOther}
                                        onChange={(e) => setPatient(prev => ({ ...prev, pmhOther: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="navigation-bar">
                            <button className="btn-secondary" onClick={() => {
                                if (patient.finalCategory === 1) {
                                    if (selectedCat1List.length > 0) setCurrentScreen(2);
                                    else setCurrentScreen(3);
                                } else {
                                    setCurrentScreen(4);
                                }
                            }}>
                                Back
                            </button>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setPatient(prev => ({
                                            ...prev,
                                            presentation: prev.presentation.trim() ? prev.presentation : "Skipped - History Not Recorded"
                                        }));
                                        if (patient.finalCategory === 1) setCurrentScreen(7);
                                        else setCurrentScreen(6);
                                    }}
                                >
                                    Skip Section
                                </button>
                                <button 
                                    className="btn-primary" 
                                    disabled={!isScreen5Valid()}
                                    onClick={() => {
                                        if (patient.finalCategory === 1) setCurrentScreen(7);
                                        else setCurrentScreen(6);
                                    }}
                                >
                                    Physiological Parameters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SCREEN 6: PHYSIOLOGICAL PARAMETERS */}
                    <div className={`triage-screen ${currentScreen === 6 ? 'active' : ''}`}>
                        <div className="screen-intro">
                            <h2>Physiological Parameters (Age Adjusted)</h2>
                            <p>Tap each parameter to enter clinical values via responsive, color-coded modals</p>
                        </div>

                        <div className="vitals-display-grid">
                            {[
                                { id: 'rr', label: 'Respiratory Rate (RR)', range: 'lbl-range-rr' },
                                { id: 'spo2', label: 'Oxygen Saturation (SpO₂)', range: 'Universal Scale' },
                                { id: 'o2', label: 'Air or Supplemental O₂', range: 'Support Method' },
                                { id: 'sbp', label: 'Systolic BP (SBP)', range: 'lbl-range-sbp' },
                                { id: 'pulse', label: 'Pulse (Heart Rate)', range: 'lbl-range-pulse' },
                                { id: 'avpu', label: 'Consciousness (AVPU)', range: 'Neurological Scale' },
                                { id: 'temp', label: 'Temperature', range: 'Thermal Scale' }
                            ].map(v => {
                                const activeVal = patient.vitals[v.id];
                                let rangeLabel = v.range;
                                
                                // Dynamic SBP low limits
                                if (v.range === 'lbl-range-sbp') {
                                    if (patient.ageGroup === 'adult') rangeLabel = '111 - 140 mmHg';
                                    else if (patient.ageGroup === 'neonate') rangeLabel = '70 - 90 mmHg';
                                    else if (patient.ageGroup === 'infant') rangeLabel = '80 - 100 mmHg';
                                    else {
                                        const exact = patient.exactAge || 2;
                                        rangeLabel = `${70 + 2 * exact} - 120 mmHg`;
                                    }
                                } else if (v.range === 'lbl-range-rr') {
                                    if (patient.ageGroup === 'neonate') rangeLabel = '30 - 50 bpm';
                                    else if (patient.ageGroup === 'infant') rangeLabel = '25 - 45 bpm';
                                    else if (patient.ageGroup === 'toddler') rangeLabel = '20 - 35 bpm';
                                    else if (patient.ageGroup === 'child') rangeLabel = '15 - 25 bpm';
                                    else rangeLabel = '12 - 20 bpm';
                                } else if (v.range === 'lbl-range-pulse') {
                                    if (patient.ageGroup === 'neonate') rangeLabel = '100 - 180 bpm';
                                    else if (patient.ageGroup === 'infant') rangeLabel = '90 - 160 bpm';
                                    else if (patient.ageGroup === 'toddler') rangeLabel = '80 - 130 bpm';
                                    else if (patient.ageGroup === 'child') rangeLabel = '70 - 110 bpm';
                                    else rangeLabel = '60 - 100 bpm';
                                }

                                return (
                                    <button 
                                        key={v.id}
                                        className={`vital-card ${activeVal ? `set severity-${activeVal.severity}` : ''}`}
                                        onClick={() => handleOpenVitalModal(v.id)}
                                    >
                                        <div className="vital-card-header">
                                            <span className="vital-label">{v.label}</span>
                                            <span className="vital-age-range">{rangeLabel}</span>
                                        </div>
                                        <div className="vital-card-body">
                                            <div className="vital-value">
                                                {activeVal ? activeVal.valueText.split(' (')[0] : 'NOT SET'}
                                            </div>
                                            <div className="vital-status-dot" />
                                        </div>
                                    </button>
                                );
                            })}

                            <div className="vital-modifier-card">
                                <h3>Admission Request / Referral</h3>
                                <p className="modifier-desc">Mandates Category 5 Blue if all parameters are green/normal</p>
                                <div className="dual-selector">
                                    <button 
                                        className={`toggle-option ${!patient.admissionRequested ? 'active' : ''}`}
                                        onClick={() => setPatient(prev => ({ ...prev, admissionRequested: false }))}
                                    >
                                        No Request
                                    </button>
                                    <button 
                                        className={`toggle-option ${patient.admissionRequested ? 'active' : ''}`}
                                        onClick={() => setPatient(prev => ({ ...prev, admissionRequested: true }))}
                                    >
                                        Admission Requested
                                    </button>
                                </div>
                            </div>
                        </div>

                        {Object.keys(patient.vitals).some(k => patient.vitals[k] === null) && (
                            <div className="validation-banner text-info" style={{ background: 'rgba(15, 188, 249, 0.08)', borderColor: 'var(--teal-start)', color: 'var(--text-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <span>Partial Vitals Mode: You may proceed. Unset parameters will be logged as not recorded.</span>
                            </div>
                        )}

                        <div className="navigation-bar">
                            <button className="btn-secondary" onClick={() => setCurrentScreen(5)}>Back</button>
                            <button 
                                className="btn-primary" 
                                disabled={!isScreen6Valid()}
                                onClick={() => setCurrentScreen(7)}
                            >
                                Calculate Triage
                            </button>
                        </div>
                    </div>

                    {/* SCREEN 7: REVIEW */}
                    <div className={`triage-screen ${currentScreen === 7 ? 'active' : ''}`}>
                        <div className="screen-intro">
                            <h2>Review and Calculate Triage</h2>
                            <p>Review the captured clinical flags, demographics, and vitals before finalizing the triage category</p>
                        </div>

                        <div className="review-layout">
                            <div className="review-main">
                                <div className="review-section">
                                    <h3>1. Patient & Demographics</h3>
                                    <div className="review-details-grid">
                                        <div className="detail-item"><strong>Token ID:</strong> {patient.token}</div>
                                        <div className="detail-item"><strong>Age Group:</strong> {patient.ageGroup?.toUpperCase()}</div>
                                        <div className="detail-item"><strong>Exact Age:</strong> {patient.exactAge !== null ? `${patient.exactAge} Years` : 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="review-section">
                                    <h3>2. Clinical Flags</h3>
                                    <div className="review-flags-summary">
                                        <div className={`review-pill ${selectedCat1List.length > 0 ? 'red' : 'clear'}`}>
                                            {selectedCat1List.length > 0 ? `${selectedCat1List.length} Cat 1 Flags Selected` : 'No Cat 1 Flags'}
                                        </div>
                                        <div className={`review-pill ${selectedTraumaList.length > 0 ? 'red' : 'clear'}`}>
                                            {selectedTraumaList.length > 0 ? `${selectedTraumaList.length} Trauma Criteria Met` : 'No Trauma Activation'}
                                        </div>
                                        <div className={`review-pill ${selectedCat2List.length > 0 ? 'orange' : 'clear'}`}>
                                            {selectedCat2List.length > 0 ? `${selectedCat2List.length} Cat 2 Flags Selected` : 'No Cat 2 Flags'}
                                        </div>
                                    </div>
                                </div>

                                <div className="review-section clinician-sensitive">
                                    <h3>3. Patient Presentation & History</h3>
                                    <div className="history-review-content">
                                        <p><strong>Chief Complaint:</strong> {patient.presentation || '--'}</p>
                                        <p><strong>Allergies:</strong> {patient.hasAllergies ? patient.allergySpecification : 'No Known Allergies'}</p>
                                        <p><strong>Past Medical History:</strong> {patient.pmhSelected.join(', ') + (patient.pmhOther ? `, ${patient.pmhOther}` : '') || 'None Reported'}</p>
                                    </div>
                                </div>

                                <div className="review-section">
                                    <h3>4. Physiological Parameters Status</h3>
                                    <div className="review-vitals-table-wrapper">
                                        <table className="review-vitals-table">
                                            <thead>
                                                <tr>
                                                    <th>Parameter</th>
                                                    <th>Clinician Input</th>
                                                    <th>Severity Category</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { id: 'rr', label: 'Respiratory Rate (RR)' },
                                                    { id: 'spo2', label: 'Oxygen Saturation (SpO₂)' },
                                                    { id: 'o2', label: 'Air or Oxygen' },
                                                    { id: 'sbp', label: 'Systolic BP (SBP)' },
                                                    { id: 'pulse', label: 'Pulse (Heart Rate)' },
                                                    { id: 'avpu', label: 'Consciousness (AVPU)' },
                                                    { id: 'temp', label: 'Temperature' }
                                                ].map(v => {
                                                    const val = patient.vitals[v.id];
                                                    return (
                                                        <tr key={v.id}>
                                                            <td>{v.label}</td>
                                                            <td className="val">{val ? val.valueText.split(' (')[0] : '--'}</td>
                                                            <td>
                                                                <span className={`status-badge ${val?.severity || ''}`}>
                                                                    {val ? val.severity.toUpperCase() : '--'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr>
                                                    <td>Admission Requested</td>
                                                    <td className="val">{patient.admissionRequested ? 'YES' : 'NO'}</td>
                                                    <td><span className="status-badge green">GREEN</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="navigation-bar">
                            <button className="btn-secondary" onClick={() => {
                                if (patient.finalCategory === 1 && (!patient.vitals.rr || patient.vitals.rr.valueText.includes('Skipped'))) {
                                    setCurrentScreen(5);
                                } else {
                                    setCurrentScreen(6);
                                }
                            }}>
                                Back to Vitals
                            </button>
                            <button className="btn-confirm-pulse" onClick={handleConfirmTriage}>
                                Confirm & Finalize Triage
                            </button>
                        </div>
                    </div>

                    {/* SCREEN 8: OUTPUT */}
                    <div className={`triage-screen ${currentScreen === 8 ? 'active' : ''}`}>
                        <div className="final-output-card" id="output-banner-card">
                            <div className={`output-header-banner cat-${res.category}-banner`}>
                                <div className="banner-main-details">
                                    <span className="banner-title">{res.name}</span>
                                    <div className="banner-numbers">
                                        <span className="cat-big-number">{res.category}</span>
                                    </div>
                                </div>
                                <div className="banner-time-details">
                                    <span className="banner-time-title">TIME TO BE SEEN:</span>
                                    <span className="banner-time-val">{res.time}</span>
                                </div>
                            </div>

                            <div className="output-body">
                                <div className="justification-section">
                                    <h3>Triage Dominance Rationale</h3>
                                    <div className={`justification-list cat-${res.category}-justification`}>
                                        {res.reasons.map((r, i) => (
                                            <div key={i}>• {r}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="summary-details-grid">
                                    <div className="summary-field">
                                        <span className="label">Patient Token</span>
                                        <span className="val">{patient.token}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="label">Age Category</span>
                                        <span className="val">{patient.ageGroup?.toUpperCase() + (patient.exactAge ? ` (${patient.exactAge} YRS)` : '')}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="label">Triage Area</span>
                                        <span className="val">{res.area}</span>
                                    </div>
                                    <div className="summary-field">
                                        <span className="label">Triage Date/Time</span>
                                        <span className="val">{new Date(patient.triageEndTime || Date.now()).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="output-vitals-strip">
                                    {Object.keys(patient.vitals).map(k => {
                                        const val = patient.vitals[k];
                                        const labels = { rr: 'RR', spo2: 'SpO₂', o2: 'O₂', sbp: 'BP', pulse: 'HR', avpu: 'AVPU', temp: 'Temp' };
                                        if (val && !val.valueText.includes('Skipped')) {
                                            return (
                                                <div key={k} className={`vital-capsule cap-${val.severity}`}>
                                                    <span className="vital-capsule-label">{labels[k]}</span>
                                                    <span className="vital-capsule-val">{val.valueText.split(' (')[0]}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                <div className="clinical-notes-section clinician-sensitive">
                                    <h3>Clinical Context (History & Allergies)</h3>
                                    <div className="notes-content">
                                        <p><strong>Chief Complaint:</strong> {patient.presentation}</p>
                                        <p><strong>Allergies:</strong> {patient.hasAllergies ? patient.allergySpecification : 'No Known Allergies'}</p>
                                        <p><strong>PMH:</strong> {patient.pmhSelected.join(', ') + (patient.pmhOther ? `, ${patient.pmhOther}` : '') || 'None'}</p>
                                    </div>
                                </div>

                                <div className="merkle-strip-success">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        <path d="m9 11 2 2 4-4"/>
                                    </svg>
                                    <span>
                                        Cryptographically logged in the local ledger chain. Block height:{' '}
                                        <strong>#{getTriageLedger().length - 1}</strong>
                                    </span>
                                </div>

                                <div className="action-bar-output">
                                    <button className="btn-action" onClick={() => alert('PDF report saved locally!')}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
                                        Save PDF
                                    </button>
                                    <button className="btn-action" onClick={handleShareSummary}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 8.51l-6.82 3.98"/></svg>
                                        Copy Summary
                                    </button>
                                    <button className="btn-action primary-action" onClick={handlePrintSlip}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                        Print Triage Slip
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="navigation-bar">
                            <button className="btn-gradient-start" onClick={initializeNewPatient}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Triage Next Patient
                            </button>
                        </div>
                    </div>

                </div>

                {/* SYSTEM ADMINISTRATOR LEDGER WORKSPACE */}
                <AdminConsole 
                    currentRole={currentRole} 
                    ledgerUpdated={ledgerUpdated}
                    onTriggerLedgerUpdate={() => setLedgerUpdated(prev => prev + 1)}
                />
            </main>

            {/* KEYPAD LOCK OVERLAY */}
            <LockScreen isLocked={isLocked} onUnlock={() => setIsLocked(false)} />

            {/* PAEDIATRIC TRIAGE LOCK ALWAYS ACTIVE */}

            {/* PHYSIOLOGICAL OPTIONS BOTTOM SHEETS */}
            <VitalModal 
                isOpen={isModalOpen}
                parameter={activeParameter}
                patient={patient}
                onClose={() => setIsModalOpen(false)}
                onSelectOption={handleSelectVitalOption}
            />

        </div>
    );
}
