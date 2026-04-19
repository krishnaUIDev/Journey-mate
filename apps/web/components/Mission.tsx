"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";

export function Mission() {
    return (
        <section className="py-20 bg-white dark:bg-black transition-colors overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 order-2 lg:order-1">
                        <div className="flex flex-col gap-10">
                            <div className="flex items-start gap-4 group">
                                <div className="mt-1 p-2 rounded-xl bg-forest/10 dark:bg-sand/10 text-forest dark:text-sand group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3 tracking-tight">
                                        <FormattedMessage id="mission.safety.title" />
                                    </h3>
                                    <p className="text-gray-500 dark:text-offwhite/60 leading-relaxed max-w-md">
                                        <FormattedMessage id="mission.safety.desc" />
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="mt-1 p-2 rounded-xl bg-navy/10 dark:bg-offwhite/10 text-navy dark:text-offwhite group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3 tracking-tight">
                                        <FormattedMessage id="mission.tracking.title" />
                                    </h3>
                                    <p className="text-gray-500 dark:text-offwhite/60 leading-relaxed max-w-md">
                                        <FormattedMessage id="mission.tracking.desc" />
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="mt-1 p-2 rounded-xl bg-forest/10 dark:bg-sand/10 text-forest dark:text-sand group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3 tracking-tight">
                                        <FormattedMessage id="mission.community.title" />
                                    </h3>
                                    <p className="text-gray-500 dark:text-offwhite/60 leading-relaxed max-w-md">
                                        <FormattedMessage id="mission.community.desc" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 order-1 lg:order-2 flex justify-center">
                        <div className="relative group perspective-1000">
                            <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-[40px] overflow-hidden shadow-2xl transition-all duration-700 rotate-y-[-10deg] group-hover:rotate-y-[0deg] group-hover:scale-105 border-8 border-white dark:border-white/5">
                                <Image
                                    src="/mission-visual.png"
                                    alt="A travel companion assisting an elderly traveler in an airport"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-10 left-10 right-10">
                                    <p className="text-white text-xl md:text-2xl font-extrabold italic leading-tight">
                                        <FormattedMessage id="mission.quote" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
