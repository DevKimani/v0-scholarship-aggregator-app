'use client';

import { Card } from '@/components/ui/card';
import { type Tip } from '@/lib/sheets';
import { Lightbulb } from 'lucide-react';

interface TipCardProps {
  tip: Tip;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-accent">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-foreground mb-2">{tip.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tip.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
