'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Scholarship } from '@/lib/sheets';
import { ExternalLink, Calendar, FileText } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="flex-1 p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{scholarship.name}</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-accent">
            <span>${scholarship.amount.replace(/[$,]/g, '')}</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Deadline: {scholarship.deadline}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{scholarship.requirements}</span>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border">
        <Button 
          asChild 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <a href={scholarship.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
            Learn More
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
