'use client';

import { Header } from '@/components/header';
import { ScholarshipGrid } from '@/components/scholarship-grid';
import { TipsSection } from '@/components/tips-section';
import { useSheetData } from '@/lib/useSheetData';

export default function Home() {
  const { data, loading, error } = useSheetData();

  return (
    <main>
      <Header />
      
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Scholarships
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse our latest scholarship opportunities. Each award is verified and ready for you to apply.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
            <p className="text-destructive">
              Note: Displaying sample data. To use your Google Sheet, ensure it's published and has tabs named "scholarships" and "tips".
            </p>
          </div>
        )}

        <ScholarshipGrid scholarships={data.scholarships} loading={loading} />
      </section>

      <TipsSection tips={data.tips} />

      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Fund Your Future?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Start exploring scholarships today and take the first step toward your educational goals. Every opportunity counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore All Scholarships
            </a>
            <a 
              href="#" 
              className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-muted py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; 2024 ScholarFund. Helping students discover funding opportunities.</p>
        </div>
      </footer>
    </main>
  );
}
