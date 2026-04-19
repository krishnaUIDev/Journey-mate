import React from "react";

interface TripCardProps {
    destination: string;
    date: string;
    image: string;
    budget: string;
    description: string;
}

export const TripCard = ({ destination, date, image, budget, description }: TripCardProps) => {
    return (
        <div className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-white/10 group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-navy/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-navy dark:text-offwhite shadow-sm">
                    {budget}
                </div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-navy dark:text-offwhite">{destination}</h3>
                    <span className="text-xs font-medium text-gray-500 dark:text-offwhite/50">{date}</span>
                </div>
                <p className="text-gray-600 dark:text-offwhite/70 text-sm line-clamp-2 mb-4">
                    {description}
                </p>
                <button className="w-full py-3 bg-navy dark:bg-sand text-white dark:text-navy rounded-xl font-bold hover:bg-forest dark:hover:bg-white transition-colors text-sm">
                    View Details
                </button>
            </div>
        </div>
    );
};
