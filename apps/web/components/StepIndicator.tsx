"use client";

import React from "react";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepNames: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepNames }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between mb-8 w-full">
            {Array.from({ length: totalSteps }).map((_, idx) => (
                <React.Fragment key={idx}>
                    <div className="flex flex-col items-center flex-1 relative">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${idx + 1 <= currentStep
                                    ? "bg-navy dark:bg-sand text-white dark:text-navy shadow-lg"
                                    : "bg-gray-200 dark:bg-white/10 text-gray-500"
                                }`}
                        >
                            {idx + 1}
                        </div>
                        <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider absolute -bottom-6 whitespace-nowrap ${idx + 1 <= currentStep ? "text-navy dark:text-sand" : "text-gray-400"
                            }`}>
                            {stepNames[idx]}
                        </span>
                    </div>
                    {idx < totalSteps - 1 && (
                        <div className="flex-1 h-0.5 relative -top-3">
                            <div className="absolute inset-0 bg-gray-200 dark:bg-white/10" />
                            <div
                                className="absolute inset-0 bg-navy dark:bg-sand transition-all duration-500"
                                style={{ width: idx + 1 < currentStep ? "100%" : "0%" }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
