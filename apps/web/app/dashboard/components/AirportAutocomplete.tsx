"use client";

import React, { useState, useEffect, useRef } from "react";
import { AIRPORTS, Airport } from "../../../data/airports";

interface AirportAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    className?: string;
}

export function AirportAutocomplete({ value, onChange, placeholder, label, className = "" }: AirportAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Airport[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        onChange(input);

        if (input.length > 0) {
            const filtered = AIRPORTS.filter(airport =>
                airport.city.toLowerCase().includes(input.toLowerCase()) ||
                airport.iata.toLowerCase().includes(input.toLowerCase()) ||
                airport.name.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setIsOpen(true);
            setHighlightIndex(-1);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleSelect = (airport: Airport) => {
        onChange(`${airport.city} (${airport.iata})`);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            setHighlightIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && highlightIndex >= 0 && suggestions[highlightIndex]) {
            handleSelect(suggestions[highlightIndex] as Airport);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative flex-1 ${className}`}>
            <span className="block text-[10px] uppercase font-black text-gray-400 mb-1 ml-2">{label}</span>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full px-6 py-3 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-forest/20 rounded-2xl text-navy dark:text-offwhite font-bold focus:ring-2 focus:ring-forest/50 outline-none transition-all text-sm"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => value.length > 0 && setIsOpen(true)}
            />

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-deep-navy border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((airport, index) => (
                        <div
                            key={airport.iata}
                            className={`px-6 py-4 cursor-pointer transition-colors flex items-center justify-between ${index === highlightIndex ? "bg-forest/10 dark:bg-sand/10" : "hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                            onClick={() => handleSelect(airport)}
                            onMouseEnter={() => setHighlightIndex(index)}
                        >
                            <div>
                                <p className="font-bold text-navy dark:text-offwhite text-sm">
                                    {airport.city} <span className="text-forest dark:text-sand/60">({airport.iata})</span>
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight line-clamp-1">{airport.name}</p>
                            </div>
                            <span className="text-xs text-gray-300 dark:text-white/20 font-black tracking-tighter">SELECT</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
