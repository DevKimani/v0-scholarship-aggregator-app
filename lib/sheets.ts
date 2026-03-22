// Google Sheets API configuration
const SHEET_ID = "1I1zIPF84eXSlw9MTuKCHEprY0HJWNYIqm7OZ4dcAV4U";
const API_KEY = "AIzaSyBvzK0Oy1pKKrXDXdqaL_d3X0NvL_9pXBY"; // Public API key for Sheets

interface Scholarship {
  name: string;
  amount: string;
  deadline: string;
  link: string;
  requirements: string;
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
      name: "Merit Excellence Award",
      amount: "$5,000",
      deadline: "June 30, 2024",
      link: "#",
      requirements: "3.5+ GPA, Full-time enrollment",
    },
    {
      name: "Community Service Grant",
      amount: "$3,000",
      deadline: "July 15, 2024",
      link: "#",
      requirements: "100+ volunteer hours, Essay required",
    },
    {
      name: "STEM Leadership Scholarship",
      amount: "$7,500",
      deadline: "August 1, 2024",
      link: "#",
      requirements: "STEM major, 3.0+ GPA",
    },
    {
      name: "First Generation Scholarship",
      amount: "$4,000",
      deadline: "August 15, 2024",
      link: "#",
      requirements: "First-gen college student",
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
    {
      title: "Read Requirements Carefully",
      description: "Missing even one requirement can disqualify you from consideration.",
    },
    {
      title: "Get Strong References",
      description: "Build relationships with teachers and mentors who can write compelling letters.",
    },
  ],
};

async function fetchSheetData(): Promise<SheetData> {
  try {
    // Fetch scholarships from "scholarships" tab
    const scholarshipsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/scholarships?key=${API_KEY}`;
    const scholarshipsRes = await fetch(scholarshipsUrl);
    const scholarshipsJson = await scholarshipsRes.json();

    // Fetch tips from "tips" tab
    const tipsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/tips?key=${API_KEY}`;
    const tipsRes = await fetch(tipsUrl);
    const tipsJson = await tipsRes.json();

    const scholarships: Scholarship[] = [];
    const tips: Tip[] = [];

    // Parse scholarships (skip header row)
    if (scholarshipsJson.values && Array.isArray(scholarshipsJson.values)) {
      for (let i = 1; i < scholarshipsJson.values.length; i++) {
        const row = scholarshipsJson.values[i];
        if (row && row.length >= 5) {
          scholarships.push({
            name: row[0] || "",
            amount: row[1] || "",
            deadline: row[2] || "",
            link: row[3] || "",
            requirements: row[4] || "",
          });
        }
      }
    }

    // Parse tips (skip header row)
    if (tipsJson.values && Array.isArray(tipsJson.values)) {
      for (let i = 1; i < tipsJson.values.length; i++) {
        const row = tipsJson.values[i];
        if (row && row.length >= 2) {
          tips.push({
            title: row[0] || "",
            description: row[1] || "",
          });
        }
      }
    }

    return { scholarships, tips };
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return SAMPLE_DATA;
  }
}

export { fetchSheetData, SAMPLE_DATA };
export type { Scholarship, Tip, SheetData };
