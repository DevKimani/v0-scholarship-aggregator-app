'use client';

import { ScholarshipCard } from './scholarship-card';
import { Spinner } from '@/components/ui/spinner';
import { type Scholarship } from '@/lib/sheets';

interface ScholarshipGridProps {
  scholarships: Scholarship[];
  loading: boolean;
}

export function ScholarshipGrid({ scholarships, loading }: ScholarshipGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No scholarships available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scholarships.map((scholarship, index) => (
        <ScholarshipCard key={index} scholarship={scholarship} />
      ))}
    </div>
  );
}
