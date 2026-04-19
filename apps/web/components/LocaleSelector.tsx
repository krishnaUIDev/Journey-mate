"use client";

import React from "react";

interface LocaleSelectorProps {
    locale: string;
    handleLocaleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function LocaleSelector({ locale, handleLocaleChange }: LocaleSelectorProps) {
    return (
        <select
            value={locale}
            onChange={handleLocaleChange}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer border-none dark:text-offwhite/80 p-0 m-0 w-auto"
        >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="bn">বাংলা (Bengali)</option>
        </select>
    );
}
