"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";

export function Mission() {
    return (
        <section className="py-20 bg-white dark:bg-black transition-colors overflow-hidden" id="mission" aria-labelledby="mission-title">
            <div className="max-w-7xl mx-auto px-8">
                <h2 id="mission-title" className="sr-only">Our Mission and Values</h2>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 order-2 lg:order-1">
                        <div className="flex flex-col gap-10">
                            <div className="flex items-start gap-4 group">
                                <div className="mt-1 text-3xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                    🛡️
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3 tracking-tight">
                                        <FormattedMessage id="mission.safety.title" />
                                    </h3>
                                    <p className="text-gray-600 dark:text-offwhite/60 leading-relaxed max-w-md">
                                        <FormattedMessage id="mission.safety.desc" />
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="mt-1 text-3xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                    📍
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3 tracking-tight">
                                        <FormattedMessage id="mission.tracking.title" />
                                    </h3>
                                    <p className="text-gray-600 dark:text-offwhite/60 leading-relaxed max-w-md">
                                        <FormattedMessage id="mission.tracking.desc" />
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="mt-1 text-3xl group-hover:scale-110 transition-transform" aria-hidden="true">
                                    ❤️
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-navy dark:text-offwhite mb-3 tracking-tight">
                                        <FormattedMessage id="mission.community.title" />
                                    </h3>
                                    <p className="text-gray-700 dark:text-offwhite/70 leading-relaxed max-w-md">
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
                                    sizes="(max-width: 768px) 300px, 400px"
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
