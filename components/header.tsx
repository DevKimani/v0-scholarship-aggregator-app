export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-bold text-lg">
            S
          </div>
          <h1 className="text-2xl font-bold">ScholarFund</h1>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl leading-tight">
          Discover Scholarships That Match Your Dreams
        </h2>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl">
          Search through hundreds of funding opportunities. Find scholarships tailored to your achievements, interests, and background.
        </p>
      </div>
    </header>
  );
}
