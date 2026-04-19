"use client";

import { FeatureCard } from "@repo/ui";
import { FormattedMessage } from "react-intl";

export function Features() {
    const features = [
        {
            title: <FormattedMessage id="features.safe.title" />,
            description: <FormattedMessage id="features.safe.desc" />,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
            ),
        },
        {
            title: <FormattedMessage id="features.independent.title" />,
            description: <FormattedMessage id="features.independent.desc" />,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2 4-4" /><path d="m11 17-2 2-4-4" /><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
            ),
        },
        {
            title: <FormattedMessage id="features.community.title" />,
            description: <FormattedMessage id="features.community.desc" />,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            ),
        },
    ];

    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-deep-navy transition-colors">
            <div className="max-w-7xl mx-auto px-8">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-offwhite mb-4 tracking-tight">
                        <FormattedMessage id="features.title" />
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-offwhite/50 max-w-2xl font-medium">
                        <FormattedMessage id="features.subtitle" />
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, i) => (
                        <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                            <FeatureCard {...feature} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
