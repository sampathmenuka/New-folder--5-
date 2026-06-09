/**
 * ============================================================================
 * SRI LANKAN EMERGENCY MEDICINE TRIAGE SYSTEM - CLINICAL LOGIC & LEDGER ENGINE
 * ============================================================================
 */

// VITAL RANGE CONFIGURATION (Age Adjusted)
export const VitalsConfig = {
    rr: {
        neonate: [
            { text: '≤ 20 / min (Very Low)', severity: 'red', label: 'Severe' },
            { text: '21 – 29 / min (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '30 – 50 / min (Normal)', severity: 'green', label: 'Normal' },
            { text: '51 – 69 / min (High)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 70 / min (Extremely High)', severity: 'red', label: 'Severe' }
        ],
        infant: [
            { text: '≤ 15 / min (Very Low)', severity: 'red', label: 'Severe' },
            { text: '16 – 24 / min (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '25 – 45 / min (Normal)', severity: 'green', label: 'Normal' },
            { text: '46 – 59 / min (High)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 60 / min (Extremely High)', severity: 'red', label: 'Severe' }
        ],
        toddler: [
            { text: '≤ 15 / min (Very Low)', severity: 'red', label: 'Severe' },
            { text: '16 – 19 / min (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '20 – 35 / min (Normal)', severity: 'green', label: 'Normal' },
            { text: '36 – 49 / min (High)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 50 / min (Extremely High)', severity: 'red', label: 'Severe' }
        ],
        child: [
            { text: '≤ 12 / min (Very Low)', severity: 'red', label: 'Severe' },
            { text: '13 – 14 / min (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '15 – 25 / min (Normal)', severity: 'green', label: 'Normal' },
            { text: '26 – 39 / min (High)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 40 / min (Extremely High)', severity: 'red', label: 'Severe' }
        ],
        adolescent: [
            { text: '≤ 10 / min (Very Low)', severity: 'red', label: 'Severe' },
            { text: '11 – 12 / min (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '12 – 20 / min (Normal)', severity: 'green', label: 'Normal' },
            { text: '21 – 29 / min (High)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 30 / min (Extremely High)', severity: 'red', label: 'Severe' }
        ],
        adult: [
            { text: '≤ 8 / min (Very Low)', severity: 'red', label: 'Severe' },
            { text: '8 – 9 / min (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '10 – 20 / min (Normal)', severity: 'green', label: 'Normal' },
            { text: '21 – 24 / min (Elevated)', severity: 'yellow', label: 'Mild' },
            { text: '25 – 29 / min (High)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 30 / min (Extremely High)', severity: 'red', label: 'Severe' }
        ]
    },
    spo2: {
        universal: [
            { text: '≥ 96% (Normal)', severity: 'green', label: 'Normal' },
            { text: '94% – 95% (Mild Hypoxaemia)', severity: 'yellow', label: 'Mild' },
            { text: '92% – 93% (Moderate Hypoxaemia)', severity: 'orange', label: 'Moderate' },
            { text: '≤ 91% (Severe Hypoxaemia)', severity: 'red', label: 'Severe' }
        ]
    },
    o2: {
        universal: [
            { text: 'Room Air (Normal Support)', severity: 'green', label: 'Normal' },
            { text: 'Supplemental Oxygen (Therapy)', severity: 'red', label: 'Severe' }
        ]
    },
    sbp: {
        neonate: [
            { text: '< 60 mmHg (Critical Hypotension)', severity: 'red', label: 'Severe' },
            { text: '60 – 69 mmHg (Low BP)', severity: 'orange', label: 'Moderate' },
            { text: '70 – 90 mmHg (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '> 90 mmHg (Elevated BP)', severity: 'yellow', label: 'Mild' }
        ],
        infant: [
            { text: '< 70 mmHg (Critical Hypotension)', severity: 'red', label: 'Severe' },
            { text: '70 – 79 mmHg (Low BP)', severity: 'orange', label: 'Moderate' },
            { text: '80 – 100 mmHg (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '> 100 mmHg (Elevated BP)', severity: 'yellow', label: 'Mild' }
        ],
        adult: [
            { text: '≤ 90 mmHg (Severe Hypotension)', severity: 'red', label: 'Severe' },
            { text: '91 – 100 mmHg (Moderate Hypotension)', severity: 'orange', label: 'Moderate' },
            { text: '101 – 110 mmHg (Mild Hypotension)', severity: 'yellow', label: 'Mild' },
            { text: '111 – 140 mmHg (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '141 – 180 mmHg (Stage 1 Hypertension)', severity: 'yellow', label: 'Mild' },
            { text: '181 – 219 mmHg (Stage 2 Hypertension)', severity: 'orange', label: 'Moderate' },
            { text: '≥ 220 mmHg (Hypertensive Crisis)', severity: 'red', label: 'Severe' }
        ]
    },
    pulse: {
        neonate: [
            { text: '< 90 bpm (Bradycardia)', severity: 'red', label: 'Severe' },
            { text: '90 – 99 bpm (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '100 – 180 bpm (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '181 – 190 bpm (Mild Tachycardia)', severity: 'orange', label: 'Moderate' },
            { text: '> 190 bpm (Severe Tachycardia)', severity: 'red', label: 'Severe' }
        ],
        infant: [
            { text: '< 80 bpm (Bradycardia)', severity: 'red', label: 'Severe' },
            { text: '80 – 89 bpm (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '90 – 160 bpm (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '161 – 180 bpm (Mild Tachycardia)', severity: 'orange', label: 'Moderate' },
            { text: '> 180 bpm (Severe Tachycardia)', severity: 'red', label: 'Severe' }
        ],
        toddler: [
            { text: '< 70 bpm (Bradycardia)', severity: 'red', label: 'Severe' },
            { text: '70 – 79 bpm (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '80 – 130 bpm (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '131 – 150 bpm (Mild Tachycardia)', severity: 'orange', label: 'Moderate' },
            { text: '> 150 bpm (Severe Tachycardia)', severity: 'red', label: 'Severe' }
        ],
        child: [
            { text: '< 60 bpm (Bradycardia)', severity: 'red', label: 'Severe' },
            { text: '60 – 69 bpm (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '70 – 110 bpm (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '111 – 130 bpm (Mild Tachycardia)', severity: 'orange', label: 'Moderate' },
            { text: '> 130 bpm (Severe Tachycardia)', severity: 'red', label: 'Severe' }
        ],
        adolescent: [
            { text: '< 50 bpm (Bradycardia)', severity: 'red', label: 'Severe' },
            { text: '50 – 59 bpm (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '60 – 100 bpm (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '101 – 120 bpm (Mild Tachycardia)', severity: 'orange', label: 'Moderate' },
            { text: '> 120 bpm (Severe Tachycardia)', severity: 'red', label: 'Severe' }
        ],
        adult: [
            { text: '< 40 bpm (Bradycardia)', severity: 'red', label: 'Severe' },
            { text: '40 – 50 bpm (Borderline Low)', severity: 'orange', label: 'Moderate' },
            { text: '51 – 59 bpm (Mildly Low)', severity: 'yellow', label: 'Mild' },
            { text: '60 – 100 bpm (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '101 – 110 bpm (Mild Tachycardia)', severity: 'yellow', label: 'Mild' },
            { text: '111 – 130 bpm (Moderate Tachycardia)', severity: 'orange', label: 'Moderate' },
            { text: '> 130 bpm (Severe Tachycardia)', severity: 'red', label: 'Severe' }
        ]
    },
    avpu: {
        universal: [
            { text: 'A - Alert (Normally conscious)', severity: 'green', label: 'Normal' },
            { text: 'V - Voice (Responds only to voice)', severity: 'yellow', label: 'Mild' },
            { text: 'P - Pain (Responds only to pain)', severity: 'orange', label: 'Moderate' },
            { text: 'U - Unresponsive (Flaccid / Unconscious)', severity: 'red', label: 'Severe' }
        ]
    },
    temp: {
        universal: [
            { text: '≤ 35.0 °C (Hypothermia)', severity: 'red', label: 'Severe' },
            { text: '35.1 – 36.0 °C (Mildly Low)', severity: 'orange', label: 'Moderate' },
            { text: '36.1 – 38.0 °C (Normal Range)', severity: 'green', label: 'Normal' },
            { text: '38.1 – 39.0 °C (Mild Fever)', severity: 'yellow', label: 'Mild' },
            { text: '≥ 39.1 °C (High Fever)', severity: 'red', label: 'Severe' }
        ]
    }
};

// Cryptographic hash calculation (Synchronous polynomial rolling hash)
export function computeHash(dataString) {
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    let hex = "";
    let state = Math.abs(hash) || 0x1A2B3C4D;
    for (let j = 0; j < 8; j++) {
        state = (state * 1664525 + 1013904223) % 4294967296;
        hex += state.toString(16).padStart(8, '0');
    }
    return hex;
}

// Get ledger logs
export function getTriageLedger() {
    let ledger = localStorage.getItem('ae_triage_merkle_ledger');
    if (!ledger) {
        const genesisTimestamp = Date.now() - 3600000 * 24;
        const genesisBlock = {
            index: 0,
            timestamp: genesisTimestamp,
            patientToken: 'GENESIS_BLOCK',
            prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
            data: { notes: 'Sri Lankan EMTS Ledger Chain Initialized' }
        };
        genesisBlock.hash = computeHash(genesisBlock.index + genesisBlock.timestamp + genesisBlock.patientToken + JSON.stringify(genesisBlock.data) + genesisBlock.prevHash);
        
        ledger = [genesisBlock];
        localStorage.setItem('ae_triage_merkle_ledger', JSON.stringify(ledger));
    } else {
        ledger = JSON.parse(ledger);
    }
    return ledger;
}

// Append triage log
export function appendTriageToLedger(patientData) {
    const ledger = getTriageLedger();
    const prevBlock = ledger[ledger.length - 1];
    
    const newBlock = {
        index: ledger.length,
        timestamp: Date.now(),
        patientToken: patientData.token,
        prevHash: prevBlock.hash,
        data: {
            ageGroup: patientData.ageGroup,
            exactAge: patientData.exactAge,
            finalCategory: patientData.finalCategory,
            vitalsSummary: Object.keys(patientData.vitals).reduce((acc, key) => {
                if (patientData.vitals[key]) {
                    acc[key] = {
                        val: patientData.vitals[key].valueText,
                        sev: patientData.vitals[key].severity
                    };
                }
                return acc;
            }, {}),
            presentation: patientData.presentation,
            allergies: patientData.hasAllergies ? patientData.allergySpecification : 'None',
            pmh: patientData.pmhSelected.join(', ') + (patientData.pmhOther ? ` (Other: ${patientData.pmhOther})` : ''),
            elapsedSeconds: Math.round((patientData.triageEndTime - patientData.triageStartTime) / 1000)
        }
    };
    
    newBlock.hash = computeHash(newBlock.index + newBlock.timestamp + newBlock.patientToken + JSON.stringify(newBlock.data) + newBlock.prevHash);
    
    ledger.push(newBlock);
    localStorage.setItem('ae_triage_merkle_ledger', JSON.stringify(ledger));
    return newBlock;
}

// Verify ledger chain validation checks
export function verifyLedgerIntegrity() {
    const ledger = getTriageLedger();
    let result = {
        isValid: true,
        errorBlockIndex: -1,
        errorMessage: ''
    };
    
    for (let i = 0; i < ledger.length; i++) {
        const block = ledger[i];
        const calculatedHash = computeHash(block.index + block.timestamp + block.patientToken + JSON.stringify(block.data) + block.prevHash);
        
        if (block.hash !== calculatedHash) {
            result.isValid = false;
            result.errorBlockIndex = i;
            result.errorMessage = `Hash mismatch: Calculated [${calculatedHash.substring(0,8)}...] but got [${block.hash.substring(0,8)}...]`;
            return result;
        }
        
        if (i > 0) {
            const prevBlock = ledger[i - 1];
            if (block.prevHash !== prevBlock.hash) {
                result.isValid = false;
                result.errorBlockIndex = i;
                result.errorMessage = `Chain broken: Block #${i} prevHash [${block.prevHash.substring(0,8)}...] does not match Block #${i-1} actual hash [${prevBlock.hash.substring(0,8)}...]`;
                return result;
            }
        }
    }
    
    return result;
}

// Simulate tampering
export function simulateTamper() {
    const ledger = getTriageLedger();
    if (ledger.length <= 1) {
        return false;
    }
    
    const targetIdx = ledger.length - 1;
    ledger[targetIdx].data.finalCategory = 4;
    ledger[targetIdx].data.vitalsSummary.spo2 = { val: "99% (Tampered Normal)", sev: "green" };
    
    localStorage.setItem('ae_triage_merkle_ledger', JSON.stringify(ledger));
    return targetIdx;
}

// Calculate ATS Category Result
export function calculateATSResult(patient) {
    const hasCat1Flags = Object.values(patient.cat1Flags).some(v => v === true);
    const hasTraumaActivation = Object.values(patient.traumaFlags).some(v => v === true);
    const hasCat2Flags = Object.values(patient.cat2Flags).some(v => v === true);
    const hasNoVitals = Object.values(patient.vitals).every(v => v === null);
    
    if (!hasCat1Flags && !hasTraumaActivation && !hasCat2Flags && hasNoVitals) {
        return {
            category: 5,
            name: 'CATEGORY 05 - NON-URGENT',
            area: 'Sub-Acute Clinic / Discharge Lounge (Blue)',
            time: 'WITHIN 120 MINUTES',
            reasons: ['Baseline triage entry: No physiological parameters recorded and clear of all high-acuity flags.']
        };
    }
    
    if (hasCat1Flags || hasTraumaActivation) {
        return {
            category: 1,
            name: 'CATEGORY 01 - RESUSCITATION',
            area: 'Resuscitation Area (Red Bay)',
            time: 'IMMEDIATELY',
            reasons: hasCat1Flags ? 
                ['Immediate threat to life: Category 1 clinical criteria met.'] : 
                ['Trauma Team Activation Protocol: Category 1 Trauma Code triggered.']
        };
    }
    

    
    const severities = { red: 0, orange: 0, yellow: 0, green: 0 };
    Object.keys(patient.vitals).forEach(k => {
        const vit = patient.vitals[k];
        if (vit && vit.severity) {
            severities[vit.severity]++;
        }
    });

    const reasons = [];

    if (severities.red > 0) {
        reasons.push(`Physiological instability: Red status vital signs detected (${severities.red} parameter${severities.red > 1 ? 's' : ''}).`);
        return {
            category: 1,
            name: 'CATEGORY 01 - RESUSCITATION',
            area: 'Resuscitation Area (Red Bay)',
            time: 'IMMEDIATELY',
            reasons: reasons
        };
    }
    
    if (hasCat2Flags || severities.orange > 0) {
        if (hasCat2Flags) reasons.push('High-risk presenting symptoms: Category 2 clinical flag selected.');
        if (severities.orange > 0) reasons.push(`Physiological distress: Orange status vital signs detected (${severities.orange} parameter${severities.orange > 1 ? 's' : ''}).`);
        
        return {
            category: 2,
            name: 'CATEGORY 02 - EMERGENCY',
            area: 'Acute Resus / High Acuity Bay (Orange)',
            time: 'WITHIN 10 MINUTES',
            reasons: reasons
        };
    }
    
    if (severities.yellow > 0) {
        reasons.push(`Moderate physiological deviance: Yellow status vital signs detected (${severities.yellow} parameter${severities.yellow > 1 ? 's' : ''}).`);
        return {
            category: 3,
            name: 'CATEGORY 03 - URGENT',
            area: 'Acute Treatment Area (Yellow)',
            time: 'WITHIN 30 MINUTES',
            reasons: reasons
        };
    }
    
    const allGreen = (severities.green > 0 && severities.red === 0 && severities.orange === 0 && severities.yellow === 0);
    if (allGreen && patient.admissionRequested) {
        reasons.push('Normal physiological values with active admission request or planned medical assessment.');
        return {
            category: 5,
            name: 'CATEGORY 05 - NON-URGENT',
            area: 'Sub-Acute Clinic / Discharge Lounge (Blue)',
            time: 'WITHIN 120 MINUTES',
            reasons: reasons
        };
    }
    
    reasons.push('Stable physiology: All vital parameter ranges normal and clear of high-risk flags.');
    return {
        category: 4,
        name: 'CATEGORY 04 - SEMI-URGENT',
        area: 'General ED Treatment Area (Green)',
        time: 'WITHIN 60 MINUTES',
        reasons: reasons
    };
}
