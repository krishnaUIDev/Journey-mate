"use client";

import React, { useState } from "react";
import { Modal } from "@repo/ui";
import { FormattedMessage, useIntl } from "react-intl";
import { StepIndicator } from "./StepIndicator";

interface TripData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    description: string;
}

interface TripCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinish: (trip: TripData) => void;
}

export function TripCreationModal({ isOpen, onClose, onFinish }: TripCreationModalProps) {
    const intl = useIntl();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<TripData>({
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        description: "",
    });

    const totalSteps = 4;
    const stepNames = [
        intl.formatMessage({ id: "trip.create.step1" }),
        intl.formatMessage({ id: "trip.create.step2" }),
        intl.formatMessage({ id: "trip.create.step3" }),
        intl.formatMessage({ id: "trip.create.step4" }),
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = () => {
        onFinish(formData);
        onClose();
        // Reset state
        setStep(1);
        setFormData({
            destination: "",
            startDate: "",
            endDate: "",
            budget: "",
            description: "",
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4 pt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-offwhite/80">
                            <FormattedMessage id="trip.create.destination.label" />
                        </label>
                        <input
                            type="text"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder={intl.formatMessage({ id: "trip.create.destination.placeholder" })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-navy dark:focus:ring-sand transition-all outline-none"
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-offwhite/80">
                                <FormattedMessage id="trip.create.date.start" />
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-navy dark:focus:ring-sand transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-offwhite/80">
                                <FormattedMessage id="trip.create.date.end" />
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-navy dark:focus:ring-sand transition-all outline-none"
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-offwhite/80">
                                <FormattedMessage id="trip.create.budget.label" />
                            </label>
                            <input
                                type="text"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder={intl.formatMessage({ id: "trip.create.budget.placeholder" })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-navy dark:focus:ring-sand transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-offwhite/80">
                                <FormattedMessage id="trip.create.desc.label" />
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder={intl.formatMessage({ id: "trip.create.desc.placeholder" })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-navy dark:focus:ring-sand transition-all outline-none resize-none"
                            />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="pt-4 space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-offwhite/50">Destination:</span>
                                <span className="text-sm font-bold">{formData.destination || "Not set"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-offwhite/50">Duration:</span>
                                <span className="text-sm font-bold">
                                    {(formData.startDate || formData.endDate)
                                        ? `${formData.startDate} - ${formData.endDate}`
                                        : "Not set"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-offwhite/50">Budget:</span>
                                <span className="text-sm font-bold">{formData.budget || "Not set"}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-white/5 text-sm text-gray-600 dark:text-offwhite/70 italic">
                                "{formData.description || "No description provided."}"
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={intl.formatMessage({ id: "trip.create.title" })}
        >
            <StepIndicator
                currentStep={step}
                totalSteps={totalSteps}
                stepNames={stepNames}
            />

            <div className="min-h-[220px]">
                {renderStep()}
            </div>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${step === 1
                            ? "opacity-0 pointer-events-none"
                            : "text-gray-500 hover:text-navy dark:hover:text-offwhite"
                        }`}
                >
                    <FormattedMessage id="trip.create.back" />
                </button>

                {step < totalSteps ? (
                    <button
                        onClick={nextStep}
                        className="bg-navy dark:bg-sand text-white dark:text-navy px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                        <FormattedMessage id="trip.create.next" />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        className="bg-forest dark:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                        <FormattedMessage id="trip.create.finish" />
                    </button>
                )}
            </div>
        </Modal>
    );
}
