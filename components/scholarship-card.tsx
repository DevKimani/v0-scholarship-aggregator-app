'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Scholarship } from '@/lib/sheets';
import { ExternalLink, Calendar, MapPin, Briefcase, Badge } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Header with title and provider */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">{scholarship.title}</h3>
          <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
        </div>

        {/* Summary */}
        {scholarship.summary && (
          <p className="text-sm text-foreground/80">{scholarship.summary}</p>
        )}

        {/* Coverage */}
        {scholarship.coverage && (
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
            <span className="text-sm font-semibold text-accent">{scholarship.coverage}</span>
          </div>
        )}

        {/* Key details grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {scholarship.deadline && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Deadline</p>
                <p className="font-medium text-foreground">{scholarship.deadline}</p>
              </div>
            </div>
          )}
          
          {scholarship.region && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Region</p>
                <p className="font-medium text-foreground">{scholarship.region}</p>
              </div>
            </div>
          )}

          {scholarship.degree && (
            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Degree Level</p>
              <p className="font-medium text-foreground">{scholarship.degree}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {scholarship.tags && (
          <div className="flex flex-wrap gap-1">
            {scholarship.tags.split(',').map((tag) => (
              <Badge 
                key={tag.trim()} 
                variant="secondary"
                className="text-xs"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Eligibility */}
        {scholarship.eligibility && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Requirements</p>
            <p className="text-sm text-foreground">{scholarship.eligibility}</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-secondary/20">
        <Button 
          asChild 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <a 
            href={scholarship.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
