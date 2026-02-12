import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface HighlightCardProps {
    category: string;
    title: string;
    description: string;
    image: string;
    gradient: string;
    className?: string;
}

export function HighlightCard({ category, title, description, image, gradient, className }: HighlightCardProps) {
    return (
        <div className={cn(
            'group relative overflow-hidden rounded-[1.5rem] bg-white border border-[hsl(40,10%,94%)] flex h-[180px] transition-all duration-300 hover:shadow-premium cursor-pointer',
            className
        )}>
            <div className="flex-1 p-6 flex flex-col">
                <span className="text-[10px] font-bold text-[hsl(30,8%,65%)] uppercase tracking-widest mb-2">{category}</span>
                <h3 className="text-xl font-bold text-[hsl(30,15%,10%)] leading-tight mb-2 group-hover:text-amber-600 transition-colors">{title}</h3>
                <p className="text-[13px] text-[hsl(30,8%,55%)] line-clamp-2 leading-relaxed max-w-[200px]">{description}</p>

                <div className="mt-auto flex items-center gap-1 text-[11px] font-bold text-[hsl(30,15%,10%)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="h-3 w-3" />
                </div>
            </div>

            <div className={cn('w-[160px] relative overflow-hidden', gradient)}>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />
            </div>
        </div>
    );
}
