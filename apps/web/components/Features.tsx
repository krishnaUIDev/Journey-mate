"use client";

import { FeatureCard } from "@repo/ui";
import { FormattedMessage } from "react-intl";

export function Features() {
    const features = [
        {
            title: <FormattedMessage id="features.safe.title" />,
            description: <FormattedMessage id="features.safe.desc" />,
            icon: (
                <span className="text-3xl" aria-hidden="true">🛡️</span>
            ),
        },
        {
            title: <FormattedMessage id="features.independent.title" />,
            description: <FormattedMessage id="features.independent.desc" />,
            icon: (
                <span className="text-3xl" aria-hidden="true">✈️</span>
            ),
        },
        {
            title: <FormattedMessage id="features.community.title" />,
            description: <FormattedMessage id="features.community.desc" />,
            icon: (
                <span className="text-3xl" aria-hidden="true">📱</span>
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
                    <p className="text-xl text-gray-700 dark:text-offwhite/70 max-w-2xl font-medium">
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
