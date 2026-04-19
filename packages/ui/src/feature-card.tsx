"use client";

import { ReactNode } from "react";

interface FeatureCardProps {
    title: ReactNode;
    description: ReactNode;
    icon: ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <div className="group p-8 rounded-[32px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-forest dark:hover:border-sand transition-all duration-500 hover:shadow-2xl hover:shadow-forest/5 dark:hover:shadow-sand/5 hover:-translate-y-2 h-full flex flex-col cursor-default">
            <div className="mb-6 p-4 rounded-2xl bg-forest/5 dark:bg-sand/5 text-forest dark:text-sand w-fit group-hover:scale-110 group-hover:bg-forest group-hover:text-white dark:group-hover:bg-sand dark:group-hover:text-navy transition-all duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-4 tracking-tight group-hover:text-forest dark:group-hover:text-sand transition-colors">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-offwhite/50 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    );
}
