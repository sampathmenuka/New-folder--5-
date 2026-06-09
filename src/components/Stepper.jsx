import React from 'react';

export default function Stepper({ currentScreen, onStepClick }) {
    const steps = [
        { label: 'Age', id: 1 },
        { label: 'Cat 1', id: 2 },
        { label: 'Trauma', id: 3 },
        { label: 'Cat 2', id: 4 },
        { label: 'History', id: 5 },
        { label: 'Vitals', id: 6 },
        { label: 'Review', id: 7 },
        { label: 'Result', id: 8 }
    ];

    return (
        <div className="stepper">
            <div className="step-line" />
            {steps.map((step) => {
                const isActive = currentScreen === step.id;
                const isCompleted = step.id < currentScreen;
                
                return (
                    <div 
                        key={step.id} 
                        className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        onClick={() => onStepClick(step.id)}
                    >
                        {step.id}
                        <span className="step-label">{step.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
