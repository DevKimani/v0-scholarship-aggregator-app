// Google Sheets configuration using Visualization API
const SHEET_ID = "1I1zIPF84eXSlw9MTuKCHEprY0HJWNYIqm7OZ4dcAV4U";

interface Scholarship {
  title: string;
  slug: string;
  provider: string;
  degree: string;
  country: string;
  region: string;
  deadline: string;
  studyStart: string;
  summary: string;
  coverage: string;
  eligibility: string;
  link: string;
  featured: boolean;
  tags: string;
  updated: string;
  status: string;
  source: string;
}

interface Tip {
  title: string;
  description: string;
}

interface SheetData {
  scholarships: Scholarship[];
  tips: Tip[];
}

// Sample data fallback
const SAMPLE_DATA: SheetData = {
  scholarships: [
    {
      title: "Merit Excellence Award",
      slug: "merit-excellence",
      provider: "National Merit Foundation",
      degree: "Undergraduate",
      country: "United States",
      region: "Nationwide",
      deadline: "June 30, 2024",
      studyStart: "September 2024",
      summary: "Award for high-achieving students with exceptional academic records",
      coverage: "Full tuition + fees",
      eligibility: "3.5+ GPA, Full-time enrollment",
      link: "#",
      featured: true,
      tags: "merit,academic",
      updated: "2024-01-15",
      status: "active",
      source: "Direct",
    },
    {
      title: "Community Service Grant",
      slug: "community-service",
      provider: "Community Foundation",
      degree: "Undergraduate",
      country: "United States",
      region: "Regional",
      deadline: "July 15, 2024",
      studyStart: "September 2024",
      summary: "Grant for students with proven community service commitment",
      coverage: "$3,000",
      eligibility: "100+ volunteer hours, Essay required",
      link: "#",
      featured: true,
      tags: "service,community",
      updated: "2024-01-14",
      status: "active",
      source: "Direct",
    },
  ],
  tips: [
    {
      title: "Start Early",
      description: "Begin your scholarship search at least 6 months before your intended start date.",
    },
    {
      title: "Tailor Applications",
      description: "Customize each application to match the scholarship's specific requirements and values.",
    },
  ],
};

// Parse Google Visualization API response
function parseVisualizationResponse(response: string): string[][] {
  try {
    // Extract JSON from the response (format: /*O_o*/gapi.loaded_0({"version":"0.6",...})
    const jsonMatch = response.match(/gapi\.loaded_\d+\((.*)\)/);
    if (!jsonMatch) {
      console.error("[v0] No gapi response found");
      return [];
    }

    const data = JSON.parse(jsonMatch[1]);
    const rows: string[][] = [];

    if (data.table && data.table.rows) {
      data.table.rows.forEach((row: { c: Array<{ v: string | null }> }) => {
        const rowValues = row.c.map((cell) => cell?.v || "");
        rows.push(rowValues);
      });
    }

    return rows;
  } catch (error) {
    console.error("[v0] Error parsing visualization response:", error);
    return [];
  }
}

async function fetchSheetData(): Promise<SheetData> {
  try {
    // Using Google Visualization API endpoint
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=scholarships`;

    const res = await fetch(gvizUrl);
    const text = await res.text();
    const rows = parseVisualizationResponse(text);

    const scholarships: Scholarship[] = [];

    // Parse scholarships (skip header row at index 0)
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 17) {
          // Map columns based on your sheet structure
          scholarships.push({
            title: row[0] || "",
            slug: row[1] || "",
            provider: row[2] || "",
            degree: row[3] || "",
            country: row[4] || "",
            region: row[5] || "",
            deadline: row[6] || "",
            studyStart: row[7] || "",
            summary: row[8] || "",
            coverage: row[9] || "",
            eligibility: row[10] || "",
            link: row[11] || "",
            featured: row[12]?.toLowerCase() === "true" || row[12] === "1",
            tags: row[13] || "",
            updated: row[14] || "",
            status: row[15] || "",
            source: row[16] || "",
          });
        }
      }
    }

    // Filter to featured scholarships for display (or show all if none featured)
    const displayScholarships = scholarships.filter((s) => s.featured).length > 0
      ? scholarships.filter((s) => s.featured)
      : scholarships.slice(0, 8);

    return { scholarships: displayScholarships, tips: SAMPLE_DATA.tips };
  } catch (error) {
    console.error("[v0] Error fetching sheet data:", error);
    return SAMPLE_DATA;
  }
}

export { fetchSheetData, SAMPLE_DATA };
export type { Scholarship, Tip, SheetData };
