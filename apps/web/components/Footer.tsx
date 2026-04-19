"use client";

import Image from "next/image";
import { FormattedMessage } from "react-intl";

interface FooterProps {
    theme: "light" | "dark";
}

export function Footer({ theme }: FooterProps) {
    return (
        <footer className="bg-white dark:bg-black py-20 border-t border-gray-100 dark:border-white/5 transition-colors">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                                <Image
                                    src="/logo.png"
                                    alt="Journey-mate Logo"
                                    fill
                                    className="object-contain dark:brightness-200 dark:contrast-150"
                                />
                            </div>
                            <span
                                className="text-lg font-bold text-navy dark:text-offwhite tracking-tight"
                                style={{
                                    textShadow: theme === "light"
                                        ? "0 1px 0 #ccc, 0 1px 2px rgba(0,0,0,0.2)"
                                        : "0 1px 0 #222, 0 1px 2px rgba(0,0,0,0.5)"
                                }}
                            >
                                Journey<span className="text-forest dark:text-sand/80">-mate</span>
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-offwhite/50 text-sm leading-relaxed mb-6">
                            <FormattedMessage id="footer.mission" />
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-forest hover:text-white dark:hover:bg-sand dark:hover:text-navy transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                            </a>
                            <a href="#" className="p-2 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-forest hover:text-white dark:hover:bg-sand dark:hover:text-navy transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a href="#" className="p-2 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-forest hover:text-white dark:hover:bg-sand dark:hover:text-navy transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /></svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-navy dark:text-offwhite mb-6 uppercase tracking-widest text-xs"><FormattedMessage id="footer.platform.title" /></h4>
                        <ul className="flex flex-col gap-4">
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.platform.how" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.platform.safety" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.platform.pricing" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.platform.companions" /></a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-navy dark:text-offwhite mb-6 uppercase tracking-widest text-xs"><FormattedMessage id="footer.company.title" /></h4>
                        <ul className="flex flex-col gap-4">
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.company.about" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.company.careers" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.company.blog" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.company.press" /></a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-navy dark:text-offwhite mb-6 uppercase tracking-widest text-xs"><FormattedMessage id="footer.legal.title" /></h4>
                        <ul className="flex flex-col gap-4">
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.legal.privacy" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.legal.terms" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.legal.cookies" /></a></li>
                            <li><a href="#" className="text-gray-500 dark:text-offwhite/50 hover:text-forest dark:hover:text-sand text-sm transition-colors"><FormattedMessage id="footer.legal.guidelines" /></a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:row justify-between items-center gap-4">
                    <p className="text-gray-400 dark:text-offwhite/30 text-xs">
                        © 2024 Journey-mate. <FormattedMessage id="footer.rights" />
                    </p>
                    <div className="flex gap-6">
                        <span className="text-gray-400 dark:text-offwhite/30 text-xs cursor-pointer hover:text-navy dark:hover:text-offwhite">English (US)</span>
                        <span className="text-gray-400 dark:text-offwhite/30 text-xs cursor-pointer hover:text-navy dark:hover:text-offwhite">USD ($)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
