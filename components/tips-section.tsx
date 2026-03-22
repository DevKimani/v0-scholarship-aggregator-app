'use client';

import { TipCard } from './tip-card';
import { type Tip } from '@/lib/sheets';

interface TipsSectionProps {
  tips: Tip[];
}

export function TipsSection({ tips }: TipsSectionProps) {
  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pro Tips for Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Follow these expert tips to increase your chances of winning scholarships and securing your education funding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <TipCard key={index} tip={tip} />
          ))}
        </div>
      </div>
    </section>
  );
}
