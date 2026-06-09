import React from 'react';
import { VitalsConfig } from '../utils/triageLogic';

export default function VitalModal({ parameter, patient, isOpen, onClose, onSelectOption }) {
    if (!isOpen || !parameter) return null;

    const titles = {
        rr: 'Respiratory Rate (breaths/min)',
        spo2: 'Oxygen Saturation (SpO₂)',
        o2: 'Air or Oxygen Support',
        sbp: 'Systolic Blood Pressure (mmHg)',
        pulse: 'Pulse / Heart Rate (bpm)',
        avpu: 'AVPU Consciousness Scale',
        temp: 'Core Temperature (°C)'
    };

    const age = patient.ageGroup;
    let optList = [];

    if (parameter === 'rr') {
        optList = VitalsConfig.rr[age] || VitalsConfig.rr.adult;
    } else if (parameter === 'spo2') {
        optList = VitalsConfig.spo2.universal;
    } else if (parameter === 'o2') {
        optList = VitalsConfig.o2.universal;
    } else if (parameter === 'sbp') {
        if (age === 'adult') {
            optList = VitalsConfig.sbp.adult;
        } else if (age === 'neonate') {
            optList = VitalsConfig.sbp.neonate;
        } else if (age === 'infant') {
            optList = VitalsConfig.sbp.infant;
        } else {
            const exactAge = patient.exactAge || 2;
            const threshold = 70 + (2 * exactAge);
            optList = [
                { text: `< ${threshold} mmHg (Critical Hypotension)`, severity: 'red', label: 'Severe' },
                { text: `${threshold} – 79 mmHg (Low BP)`, severity: 'orange', label: 'Moderate' },
                { text: '80 – 120 mmHg (Normal Range)', severity: 'green', label: 'Normal' },
                { text: '> 120 mmHg (High BP)', severity: 'yellow', label: 'Mild' }
            ];
        }
    } else if (parameter === 'pulse') {
        optList = VitalsConfig.pulse[age] || VitalsConfig.pulse.adult;
    } else if (parameter === 'avpu') {
        optList = VitalsConfig.avpu.universal;
    } else if (parameter === 'temp') {
        optList = VitalsConfig.temp.universal;
    }

    let ageStr = age ? age.toUpperCase() : 'ADULT';
    if (patient.exactAge) {
        ageStr += ` (${patient.exactAge} Years)`;
    }

    const currentVal = patient.vitals[parameter];

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>{titles[parameter]}</h3>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-subheading">
                    <p>Select the range corresponding to the patient's current {titles[parameter]}</p>
                    <span className="age-badge-modal">Patient Age: {ageStr}</span>
                </div>

                <div className="modal-options-grid">
                    {optList.map((opt, i) => {
                        const isActive = currentVal && currentVal.valueText === opt.text;
                        return (
                            <button 
                                key={i} 
                                className={`vital-opt-btn opt-${opt.severity} ${isActive ? 'active' : ''}`}
                                onClick={() => onSelectOption(parameter, opt)}
                            >
                                <span>{opt.text}</span>
                                <span className="opt-badge">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="modal-footer">
                    <span className="modal-footer-hint">Clinical thresholds are adjusted for the patient's selected age group.</span>
                </div>
            </div>
        </div>
    );
}
