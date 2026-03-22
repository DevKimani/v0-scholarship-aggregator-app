"use client";

import { useState, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  SHEET_ID: "1I1zIPF84eXSlw9MTuKCHEprY0HJWNYIqm7OZ4dcAV4U",
  SCHOLARSHIPS_TAB: "scholarships",
  TIPS_TAB: "tips",
  SITE_NAME: "KEScholarsHub",
  CACHE_MINUTES: 10,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE SHEETS DATA LAYER
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchSheetData(tabName: string) {
  const cacheKey = `scholarshub_${tabName}`;
  const cacheTimeKey = `scholarshub_${tabName}_time`;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    if (cached && cachedTime) {
      const age = (Date.now() - parseInt(cachedTime)) / 1000 / 60;
      if (age < CONFIG.CACHE_MINUTES) return JSON.parse(cached);
    }
  } catch (e) {}

  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const response = await fetch(url);
  const text = await response.text();
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
  if (!jsonStr) throw new Error("Failed to parse Google Sheets response");

  const data = JSON.parse(jsonStr[1]);
  const headers = data.table.cols.map((col: any) => col.label?.toLowerCase().trim() || "");
  const rows = data.table.rows.map((row: any) => {
    const obj: any = {};
    row.c.forEach((cell: any, i: number) => {
      if (headers[i]) obj[headers[i]] = cell?.v != null ? String(cell.v) : "";
    });
    return obj;
  });

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(rows));
    sessionStorage.setItem(cacheTimeKey, String(Date.now()));
  } catch (e) {}

  return rows;
}

function parseScholarship(row: any) {
  return {
    id: row.id || row.slug || Math.random().toString(36).slice(2),
    title: row.title || "",
    slug: row.slug || slugify(row.title || ""),
    provider: row.provider || "",
    degree: row.degree || "",
    country: row.country || "",
    region: row.region || "",
    deadline: row.deadline || "",
    studyStart: row.studystart || row.study_start || "",
    summary: row.summary || "",
    coverage: (row.coverage || "").split("|").map((s: string) => s.trim()).filter(Boolean),
    eligibility: (row.eligibility || "").split("|").map((s: string) => s.trim()).filter(Boolean),
    link: row.link || row.url || "",
    featured: (row.featured || "").toLowerCase() === "true" || row.featured === "1",
    tags: (row.tags || "").split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean),
    updated: row.updated || row.date || "",
    status: row.status || "published",
  };
}

function parseTip(row: any) {
  return {
    id: row.id || row.slug || Math.random().toString(36).slice(2),
    title: row.title || "",
    slug: row.slug || slugify(row.title || ""),
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category || "General",
    readTime: row.readtime || row.read_time || "5 min",
    author: row.author || "KEScholarsHub Team",
    published: row.published || row.date || "",
  };
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA HOOK
// ═══════════════════════════════════════════════════════════════════════════════

function useSheetData() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [rawScholarships, rawTips] = await Promise.all([
          fetchSheetData(CONFIG.SCHOLARSHIPS_TAB),
          fetchSheetData(CONFIG.TIPS_TAB),
        ]);
        setScholarships(
          rawScholarships.map(parseScholarship).filter((s: any) => s.status === "published" && s.title)
        );
        setTips(rawTips.map(parseTip).filter((t: any) => t.title));
        setError(null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load scholarships. Using sample data.");
        setScholarships(SAMPLE_SCHOLARSHIPS);
        setTips(SAMPLE_TIPS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { scholarships, tips, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE DATA (fallback)
// ═══════════════════════════════════════════════════════════════════════════════

const SAMPLE_SCHOLARSHIPS = [
  { id:"1",title:"Chevening Scholarships in the United Kingdom",slug:"chevening-scholarships-uk",provider:"UK Foreign, Commonwealth & Development Office",degree:"Masters",country:"UK",region:"Europe",deadline:"5 November 2026 (annual)",studyStart:"September 2027",summary:"Chevening Scholarships are the UK government's global scholarship programme, funded by the FCDO and partner organisations. Awards are made to outstanding emerging leaders to pursue a one-year master's degree in any subject at any UK university.",coverage:["Full tuition fees","Monthly living allowance","Return economy flights","Thesis/dissertation grant"],eligibility:["Citizen of a Chevening-eligible country","Return to your country for at least two years","At least 2 years work experience"],link:"https://www.chevening.org/scholarships/",featured:true,tags:["government","fully-funded"],updated:"04 Mar 2026",status:"published"},
  { id:"2",title:"Australia Awards Scholarships for Developing Countries",slug:"australia-awards-scholarships",provider:"Australian Government (DFAT)",degree:"Masters/PhD",country:"Australia",region:"Oceania",deadline:"1 May 2026 (annual)",studyStart:"January/February 2027",summary:"Australia Awards Scholarships are long-term awards administered by the Department of Foreign Affairs and Trade, contributing to development needs of partner countries.",coverage:["Full tuition fees","Return air travel","Establishment allowance","Living expenses"],eligibility:["Citizen of a participating country","Not a citizen of Australia/NZ","Minimum 2 years work experience"],link:"https://www.dfat.gov.au/people-to-people/australia-awards",featured:true,tags:["government","fully-funded"],updated:"18 Feb 2026",status:"published"},
  { id:"3",title:"DAAD Scholarships in Germany",slug:"daad-scholarships-germany",provider:"German Academic Exchange Service (DAAD)",degree:"Masters/PhD",country:"Germany",region:"Europe",deadline:"Various (Jul-Oct annually)",studyStart:"October 2027",summary:"DAAD offers scholarships for development-related postgraduate courses with special relevance to developing countries.",coverage:["Monthly payments of €934/€1,300","Insurance","Travel allowance","German language course"],eligibility:["Bachelor's degree","At least 2 years professional experience","From a developing country"],link:"https://www.daad.de/en/studying-in-germany/scholarships/",featured:true,tags:["government","fully-funded"],updated:"28 Feb 2026",status:"published"},
  { id:"4",title:"Fulbright Foreign Student Program in USA",slug:"fulbright-foreign-student-program",provider:"U.S. Department of State",degree:"Masters/PhD",country:"USA",region:"North America",deadline:"Varies by country (annual)",studyStart:"August 2027",summary:"The Fulbright Foreign Student Program enables graduate students and young professionals from abroad to study and conduct research in the United States.",coverage:["Tuition and fees","Airfare","Living stipend","Health insurance"],eligibility:["Citizen of a participating country","Bachelor's degree or equivalent","English proficiency"],link:"https://foreign.fulbrightonline.org/",featured:true,tags:["government","fully-funded"],updated:"15 Feb 2026",status:"published"},
  { id:"5",title:"Gates Cambridge Scholarships",slug:"gates-cambridge-scholarships",provider:"Bill & Melinda Gates Foundation",degree:"Masters/PhD",country:"UK",region:"Europe",deadline:"10 October / 3 December 2026",studyStart:"October 2027",summary:"Gates Cambridge Scholarships are prestigious full-cost awards for outstanding applicants from outside the UK to pursue a postgraduate degree at the University of Cambridge.",coverage:["Full cost of tuition","Maintenance allowance","Round-trip airfare"],eligibility:["Citizen of any country outside the UK","Outstanding intellectual ability","Leadership potential"],link:"https://www.gatescambridge.org/",featured:true,tags:["foundation","fully-funded"],updated:"20 Feb 2026",status:"published"},
  { id:"6",title:"Erasmus Mundus Joint Masters Degree Scholarships",slug:"erasmus-mundus-joint-masters",provider:"European Commission",degree:"Masters",country:"Europe",region:"Europe",deadline:"Various (Oct-Jan annually)",studyStart:"September 2027",summary:"Erasmus Mundus Joint Masters Degrees are prestigious integrated international study programmes awarding EU-funded scholarships to the best students worldwide.",coverage:["Tuition","Monthly allowance of €1,400","Travel and installation costs","Insurance"],eligibility:["Hold a Bachelor's degree","Meet language requirements","Cannot have previously received EMJMD scholarship"],link:"https://erasmus-plus.ec.europa.eu/",featured:true,tags:["government","fully-funded"],updated:"22 Feb 2026",status:"published"},
];

const SAMPLE_TIPS = [
  { id:"1",title:"How to Write a Winning Scholarship Essay",slug:"how-to-write-scholarship-essay",excerpt:"Your scholarship essay is your best chance to stand out. Learn proven strategies for crafting compelling personal statements.",content:"<h2>Start With Your Story</h2><p>The most memorable scholarship essays begin with a specific moment. Instead of writing 'I have always been passionate about education,' open with a concrete scene.</p><h2>Show, Don't Tell</h2><p>Instead of listing qualities, demonstrate them through examples.</p><h2>Be Authentic</h2><p>What makes yours stand out isn't fancy vocabulary — it's genuine reflection.</p>",category:"Application Tips",readTime:"8 min",author:"KEScholarsHub Team",published:"28 Feb 2026"},
  { id:"2",title:"10 Tips for Acing Your Scholarship Interview",slug:"scholarship-interview-tips",excerpt:"Preparation is key. From researching the organisation to practising common questions, here's how to make a lasting impression.",content:"<h2>Research the Organisation</h2><p>Understand the scholarship provider's mission and values.</p><h2>Prepare Your Story</h2><p>Have a clear narrative about who you are and where you're headed.</p><h2>Use the STAR Method</h2><p>Structure answers with Situation, Task, Action, Result.</p>",category:"Interview Prep",readTime:"6 min",author:"KEScholarsHub Team",published:"22 Feb 2026"},
  { id:"3",title:"Finding Scholarships for Developing Countries",slug:"finding-scholarships-developing-countries",excerpt:"Navigating international scholarships can be overwhelming. This guide helps you identify the best opportunities.",content:"<h2>Start With Government Scholarships</h2><p>Most developed countries offer government-funded scholarships. Start with Chevening, Australia Awards, DAAD, Fulbright.</p><h2>Timing Is Everything</h2><p>Create a calendar of deadlines 12-18 months before you want to start studying.</p>",category:"Guides",readTime:"10 min",author:"KEScholarsHub Team",published:"10 Feb 2026"},
];

const COUNTRIES_LIST = [
  { name: "UK", flag: "🇬🇧" }, { name: "USA", flag: "🇺🇸" },
  { name: "Australia", flag: "🇦🇺" }, { name: "Germany", flag: "🇩🇪" },
  { name: "Canada", flag: "🇨🇦" }, { name: "Europe", flag: "🇪🇺" },
  { name: "New Zealand", flag: "🇳🇿" }, { name: "Japan", flag: "🇯🇵" },
  { name: "Any Country", flag: "🌍" },
];

const DEGREES = ["All", "Bachelors", "Masters", "PhD", "Masters/PhD"];

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const S = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
:root{--bg:#FDFAF6;--bg-warm:#F6F1EA;--bg-dark:#1C1814;--text:#1C1814;--text-mid:#52493D;--text-light:#8C8175;--accent:#C65D21;--accent-h:#A84B18;--accent-pale:#FBEEE4;--gold:#B8922F;--gold-light:#F9F0D9;--green:#2E7D5B;--green-light:#E3F5EC;--border:#E5DDD2;--card:#FFFFFF;--radius:12px;--max:1100px;--font-d:'Playfair Display',Georgia,serif;--font-b:'DM Sans',system-ui,sans-serif;--shadow-s:0 1px 4px rgba(28,24,20,0.05);--shadow-m:0 4px 20px rgba(28,24,20,0.07);--shadow-l:0 12px 40px rgba(28,24,20,0.1)}*{margin:0;padding:0;box-sizing:border-box}body,#root,.sh-wrap{background:var(--bg);color:var(--text);font-family:var(--font-b);font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased}::selection{background:var(--accent-pale);color:var(--accent)}a{color:var(--accent);text-decoration:none}a:hover{color:var(--accent-h)}.sh-header{background:rgba(255,255,255,0.92);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;backdrop-filter:blur(12px)}.sh-header-in{max-width:var(--max);margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:64px}.sh-logo{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}.sh-logo-mark{width:32px;height:32px;background:linear-gradient(135deg,var(--accent),var(--gold));border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;font-family:var(--font-d)}.sh-logo-text{font-family:var(--font-d);font-size:20px;font-weight:700;color:var(--text)}.sh-nav{display:flex;gap:4px;list-style:none}.sh-nav button{font-family:var(--font-b);font-size:13.5px;font-weight:500;color:var(--text-mid);padding:7px 14px;border-radius:8px;border:none;background:none;cursor:pointer;transition:all .15s}.sh-nav button:hover,.sh-nav button.on{color:var(--accent);background:var(--accent-pale)}.sh-mobile-btn{display:none;background:none;border:none;font-size:22px;cursor:pointer;color:var(--text);padding:4px}.sh-hero{background:linear-gradient(165deg,#1C1814 0%,#32291E 48%,#4A3B2A 100%);color:#fff;padding:72px 20px 64px;text-align:center;position:relative;overflow:hidden}.sh-hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 25% 15%,rgba(198,93,33,0.12) 0%,transparent 55%),radial-gradient(ellipse at 75% 85%,rgba(184,146,47,0.08) 0%,transparent 45%);pointer-events:none}.sh-hero-in{position:relative;z-index:1;max-width:680px;margin:0 auto}.sh-hero h1{font-family:var(--font-d);font-size:clamp(28px,4.8vw,46px);font-weight:700;line-height:1.18;margin-bottom:16px;letter-spacing:-0.3px}.sh-hero h1 em{color:var(--gold);font-style:normal}.sh-hero p{font-size:16.5px;color:rgba(255,255,255,0.72);max-width:520px;margin:0 auto 28px;line-height:1.55}.sh-hero-search{display:flex;max-width:480px;margin:0 auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:50px;overflow:hidden;backdrop-filter:blur(8px)}.sh-hero-search input{flex:1;background:transparent;border:none;padding:13px 22px;color:#fff;font-size:14px;font-family:var(--font-b);outline:none}.sh-hero-search input::placeholder{color:rgba(255,255,255,0.42)}.sh-hero-search button{background:var(--accent);color:#fff;border:none;padding:13px 26px;font-family:var(--font-b);font-weight:600;font-size:13.5px;cursor:pointer;transition:background .15s}.sh-hero-search button:hover{background:var(--accent-h)}.sh-hero-stats{display:flex;justify-content:center;gap:40px;margin-top:36px}.sh-hero-stats div{text-align:center}.sh-hero-stats strong{font-family:var(--font-d);font-size:26px;display:block;color:var(--gold)}.sh-hero-stats span{font-size:11.5px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1.2px}.sh-container{max-width:var(--max);margin:0 auto;padding:0 20px}.sh-section-head{display:flex;align-items:baseline;justify-content:space-between;margin:48px 0 22px;padding-bottom:14px;border-bottom:2px solid var(--border)}.sh-section-head h2{font-family:var(--font-d);font-size:24px;font-weight:600}.sh-section-head button{font-size:13px;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer;font-family:var(--font-b)}.sh-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px 26px;transition:all .2s;cursor:pointer;position:relative}.sh-card:hover{box-shadow:var(--shadow-m);border-color:rgba(198,93,33,0.18);transform:translateY(-1px)}.sh-card.feat{border-left:4px solid var(--gold)}.sh-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:8px}.sh-card-title{font-family:var(--font-d);font-size:17.5px;font-weight:600;color:var(--text);line-height:1.32}.sh-card-provider{font-size:13px;color:var(--text-light);font-style:italic;margin-top:4px}.sh-card-tags{display:flex;gap:5px;flex-shrink:0;flex-wrap:wrap}.sh-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;padding:3px 9px;border-radius:20px}.sh-tag-ff{background:var(--green-light);color:var(--green)}.sh-tag-pf{background:#FFF3CD;color:#856404}.sh-card-meta{display:flex;flex-wrap:wrap;gap:16px;font-size:12.5px;color:var(--text-mid);margin-top:10px}.sh-card-meta span{display:flex;align-items:center;gap:4px}.sh-card-summary{font-size:13.5px;color:var(--text-mid);margin-top:12px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.sh-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)}.sh-card-date{font-size:11px;color:var(--text-light)}.sh-card-more{font-size:12.5px;font-weight:600;color:var(--accent)}.sh-grid{display:grid;gap:16px}.sh-countries{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}.sh-country{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 12px;text-align:center;cursor:pointer;transition:all .2s}.sh-country:hover{box-shadow:var(--shadow-m);transform:translateY(-2px);border-color:var(--accent)}.sh-country-flag{font-size:32px;margin-bottom:6px}.sh-country-name{font-family:var(--font-d);font-size:14.5px;font-weight:600}.sh-country-count{font-size:11.5px;color:var(--text-light);margin-top:1px}.sh-tips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}.sh-tip{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;cursor:pointer;transition:all .2s}.sh-tip:hover{box-shadow:var(--shadow-m);transform:translateY(-2px)}.sh-tip-cat{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:8px}.sh-tip-title{font-family:var(--font-d);font-size:16.5px;font-weight:600;line-height:1.32;margin-bottom:8px}.sh-tip-excerpt{font-size:13px;color:var(--text-mid);line-height:1.55;margin-bottom:12px}.sh-tip-meta{font-size:11.5px;color:var(--text-light);display:flex;gap:12px}.sh-filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:24px 0 20px;padding:16px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)}.sh-filters label{font-size:11px;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px}.sh-filters select,.sh-filters input{font-family:var(--font-b);font-size:13px;padding:7px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);outline:none;cursor:pointer}.sh-filters select:focus,.sh-filters input:focus{border-color:var(--accent)}.sh-search-wrap{flex:1;min-width:180px;position:relative}.sh-search-wrap input{width:100%;padding-left:34px}.sh-search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-light)}.sh-result-count{font-size:13px;color:var(--text-light);margin-bottom:16px}.sh-detail{max-width:740px;margin:0 auto;padding:40px 20px 72px}.sh-back{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:500;color:var(--text-light);cursor:pointer;margin-bottom:24px;border:none;background:none;font-family:var(--font-b)}.sh-back:hover{color:var(--accent)}.sh-detail-title{font-family:var(--font-d);font-size:clamp(24px,3.8vw,34px);font-weight:700;line-height:1.22;margin-bottom:10px}.sh-detail-provider{font-size:15px;color:var(--text-light);font-style:italic;margin-bottom:22px}.sh-detail-meta{display:flex;flex-wrap:wrap;gap:18px;padding:16px 20px;background:var(--bg-warm);border-radius:var(--radius);margin-bottom:28px;font-size:13px}.sh-detail-meta>div{display:flex;flex-direction:column;gap:1px}.sh-detail-meta .lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text-light)}.sh-detail-meta .val{font-weight:600;color:var(--text)}.sh-detail h3{font-family:var(--font-d);font-size:18px;font-weight:600;margin:24px 0 10px}.sh-detail p{font-size:14.5px;color:var(--text-mid);line-height:1.65;margin-bottom:12px}.sh-detail ul{list-style:none;padding:0}.sh-detail li{font-size:14px;color:var(--text-mid);padding:6px 0 6px 20px;position:relative}.sh-detail li::before{content:'';position:absolute;left:0;top:12px;width:7px;height:7px;border-radius:50%;background:var(--accent-pale);border:2px solid var(--accent)}.sh-apply-btn{display:inline-flex;align-items:center;gap:7px;background:var(--accent);color:#fff;font-family:var(--font-b);font-weight:600;font-size:14px;padding:12px 28px;border:none;border-radius:50px;cursor:pointer;transition:all .15s;margin-top:8px}.sh-apply-btn:hover{background:var(--accent-h);transform:translateY(-1px);box-shadow:var(--shadow-m)}.sh-article h2{font-family:var(--font-d);font-size:18px;font-weight:600;margin:24px 0 8px;color:var(--text)}.sh-article p{font-size:14.5px;color:var(--text-mid);line-height:1.65;margin-bottom:14px}.sh-newsletter{background:linear-gradient(135deg,#1C1814,#32291E);border-radius:var(--radius);padding:36px;margin:48px 0;display:flex;align-items:center;justify-content:space-between;gap:28px;color:#fff}.sh-newsletter h3{font-family:var(--font-d);font-size:20px;font-weight:600;margin-bottom:4px}.sh-newsletter p{font-size:13px;color:rgba(255,255,255,0.6)}.sh-nl-form{display:flex;gap:8px;flex-shrink:0}.sh-nl-form input{padding:11px 16px;border:1px solid rgba(255,255,255,0.18);border-radius:8px;background:rgba(255,255,255,0.08);color:#fff;font-family:var(--font-b);font-size:13px;width:240px;outline:none}.sh-nl-form input::placeholder{color:rgba(255,255,255,0.35)}.sh-nl-form button{padding:11px 22px;background:var(--gold);color:var(--bg-dark);border:none;border-radius:8px;font-family:var(--font-b);font-weight:600;font-size:13px;cursor:pointer;transition:background .15s}.sh-nl-form button:hover{background:#CBA235}.sh-footer{background:var(--bg-dark);color:rgba(255,255,255,0.55);padding:48px 20px 28px;margin-top:72px}.sh-footer-in{max-width:var(--max);margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:36px}.sh-footer h4{font-family:var(--font-d);font-size:17px;color:#fff;margin-bottom:10px}.sh-footer h5{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,0.35);margin-bottom:12px}.sh-footer ul{list-style:none}.sh-footer li{margin-bottom:6px}.sh-footer a{font-size:13px;color:rgba(255,255,255,0.55);cursor:pointer}.sh-footer a:hover{color:var(--gold)}.sh-footer-bot{max-width:var(--max);margin:32px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;font-size:12px}.sh-footer p{font-size:13px;line-height:1.55}.sh-pages{display:flex;justify-content:center;gap:5px;margin-top:32px}.sh-page-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:var(--card);font-family:var(--font-b);font-size:13px;color:var(--text-mid);cursor:pointer;transition:all .15s}.sh-page-btn:hover{border-color:var(--accent);color:var(--accent)}.sh-page-btn.on{background:var(--accent);color:#fff;border-color:var(--accent)}.sh-about{max-width:680px;margin:0 auto;padding:48px 20px 72px}.sh-about h1{font-family:var(--font-d);font-size:34px;font-weight:700;margin-bottom:20px}.sh-about h2{font-family:var(--font-d);font-size:20px;font-weight:600;margin:30px 0 10px}.sh-about p{font-size:15px;color:var(--text-mid);line-height:1.7;margin-bottom:14px}.sh-loading{text-align:center;padding:80px 20px;color:var(--text-light)}.sh-loading-spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px}@keyframes spin{to{transform:rotate(360deg)}}.sh-error{background:#FFF3CD;border:1px solid #FFECB5;border-radius:8px;padding:12px 16px;font-size:13px;color:#856404;margin:16px 0}@media(max-width:768px){.sh-nav{display:none}.sh-nav.open{display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--card);border-bottom:1px solid var(--border);padding:10px;box-shadow:var(--shadow-l);z-index:99}.sh-mobile-btn{display:block}.sh-hero{padding:48px 16px 40px}.sh-hero-stats{gap:20px}.sh-hero-stats strong{font-size:20px}.sh-filters{flex-direction:column;align-items:stretch}.sh-footer-in{grid-template-columns:1fr;gap:24px}.sh-newsletter{flex-direction:column;text-align:center}.sh-nl-form{flex-direction:column;width:100%}.sh-nl-form input{width:100%}.sh-tips-grid{grid-template-columns:1fr}.sh-countries{grid-template-columns:repeat(auto-fill,minmax(100px,1fr))}}`;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

function Header({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  const go = (p: string) => { setPage(p); setOpen(false); window.scrollTo(0,0); };
  return (
    <header className="sh-header">
      <div className="sh-header-in">
        <div className="sh-logo" onClick={() => go("home")}>
          <div className="sh-logo-mark">K</div>
          <div className="sh-logo-text">{CONFIG.SITE_NAME}</div>
        </div>
        <button className="sh-mobile-btn" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
        <ul className={`sh-nav ${open ? "open" : ""}`}>
          {[["home","Home"],["scholarships","Scholarships"],["tips","Tips"],["about","About"]].map(([k,l]) => (
            <li key={k}><button className={page.split(":")[0]===k?"on":""} onClick={() => go(k)}>{l}</button></li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function Hero({ count, onSearch }: { count: number; onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <section className="sh-hero">
      <div className="sh-hero-in">
        <h1>International Scholarships for <em>Developing Countries</em></h1>
        <p>Discover fully-funded scholarships, fellowships, and grants to study abroad. Updated with the latest opportunities worldwide.</p>
        <div className="sh-hero-search">
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSearch(q)} placeholder="Search scholarships, countries, degrees..." />
          <button onClick={()=>onSearch(q)}>Search</button>
        </div>
        <div className="sh-hero-stats">
          <div><strong>{count}+</strong><span>Scholarships</span></div>
          <div><strong>{COUNTRIES_LIST.length}+</strong><span>Countries</span></div>
          <div><strong>Weekly</strong><span>Updates</span></div>
        </div>
      </div>
    </section>
  );
}

function ScholarshipCard({ s, onClick }: { s: any; onClick: () => void }) {
  return (
    <div className={`sh-card ${s.featured?"feat":""}`} onClick={onClick}>
      <div className="sh-card-top">
        <div>
          <div className="sh-card-title">{s.title}</div>
          <div className="sh-card-provider">{s.provider}</div>
        </div>
        <div className="sh-card-tags">
          {s.tags.includes("fully-funded") && <span className="sh-tag sh-tag-ff">Fully Funded</span>}
          {s.tags.includes("partial-funding") && <span className="sh-tag sh-tag-pf">Partial</span>}
        </div>
      </div>
      <div className="sh-card-meta">
        <span>📍 {s.country}</span>
        <span>🎓 {s.degree}</span>
        <span>📅 {s.deadline}</span>
      </div>
      <div className="sh-card-summary">{s.summary}</div>
      <div className="sh-card-foot">
        <span className="sh-card-date">Updated: {s.updated}</span>
        <span className="sh-card-more">Read More →</span>
      </div>
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="sh-newsletter">
      <div><h3>Stay Updated</h3><p>Get new scholarship opportunities delivered to your inbox every week.</p></div>
      {done ? <p style={{color:"var(--gold)",fontWeight:600}}>Thank you for subscribing!</p> : (
        <div className="sh-nl-form">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&setDone(true)} />
          <button onClick={()=>{if(email.includes("@"))setDone(true)}}>Subscribe</button>
        </div>
      )}
    </div>
  );
}

function Foot({ setPage }: { setPage: (p: string) => void }) {
  const go = (p: string) => { setPage(p); window.scrollTo(0,0); };
  return (
    <footer className="sh-footer">
      <div className="sh-footer-in">
        <div><h4>{CONFIG.SITE_NAME}</h4><p>An updated listing of international scholarships for students from developing countries. We help you find the best opportunities to study abroad.</p></div>
        <div><h5>Navigate</h5><ul>{[["home","Home"],["scholarships","Scholarships"],["tips","Tips & Guides"],["about","About"]].map(([k,l])=>(<li key={k}><a onClick={()=>go(k)}>{l}</a></li>))}</ul></div>
        <div><h5>By Country</h5><ul>{COUNTRIES_LIST.slice(0,6).map(c=>(<li key={c.name}><a onClick={()=>{setPage("scholarships");window.scrollTo(0,0);}}>{c.flag} {c.name}</a></li>))}</ul></div>
        <div><h5>Popular</h5><ul><li><a onClick={()=>go("scholarships")}>Fully Funded</a></li><li><a onClick={()=>go("scholarships")}>Masters</a></li><li><a onClick={()=>go("scholarships")}>PhD Funding</a></li><li><a onClick={()=>go("scholarships")}>Government</a></li></ul></div>
      </div>
      <div className="sh-footer-bot">© 2026 {CONFIG.SITE_NAME}. All rights reserved.</div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

function HomePage({ scholarships, tips, setPage, setInitSearch, setCountryFilter }: any) {
  const featured = scholarships.filter((s: any) => s.featured);
  const displayFeatured = featured.length > 0 ? featured : scholarships.slice(0, 5);
  const countryCounts = useMemo(() => {
    const map: any = {};
    scholarships.forEach((s: any) => { map[s.country] = (map[s.country]||0)+1; });
    return map;
  }, [scholarships]);

  return (
    <>
      <Hero count={scholarships.length} onSearch={(q: string) => { setInitSearch(q); setPage("scholarships"); }} />
      <div className="sh-container">
        <div className="sh-section-head"><h2>Featured Scholarships</h2><button onClick={()=>{setPage("scholarships");window.scrollTo(0,0);}}>View All →</button></div>
        <div className="sh-grid">{displayFeatured.slice(0,6).map((s: any) => <ScholarshipCard key={s.id} s={s} onClick={()=>{setPage("detail:"+s.slug);window.scrollTo(0,0);}} />)}</div>
        <div className="sh-section-head"><h2>Browse by Country</h2></div>
        <div className="sh-countries">{COUNTRIES_LIST.map(c=>(<div key={c.name} className="sh-country" onClick={()=>{setCountryFilter(c.name);setPage("scholarships");window.scrollTo(0,0);}}><div className="sh-country-flag">{c.flag}</div><div className="sh-country-name">{c.name}</div><div className="sh-country-count">{countryCounts[c.name]||0} scholarship{(countryCounts[c.name]||0)!==1?"s":""}</div></div>))}</div>
        {tips.length > 0 && (<><div className="sh-section-head"><h2>Tips & Guides</h2><button onClick={()=>{setPage("tips");window.scrollTo(0,0);}}>View All →</button></div>
        <div className="sh-tips-grid">{tips.slice(0,3).map((t: any)=>(<div key={t.id} className="sh-tip" onClick={()=>{setPage("tip:"+t.slug);window.scrollTo(0,0);}}><div className="sh-tip-cat">{t.category}</div><div className="sh-tip-title">{t.title}</div><div className="sh-tip-excerpt">{t.excerpt}</div><div className="sh-tip-meta"><span>{t.readTime} read</span><span>{t.published}</span></div></div>))}</div></>)}
        <Newsletter />
      </div>
    </>
  );
}

function ScholarshipsPage({ scholarships, setPage, initSearch, countryFilter, setCountryFilter }: any) {
  const [search, setSearch] = useState(initSearch || "");
  const [degree, setDegree] = useState("All");
  const [country, setCountry] = useState(countryFilter || "All");
  const [pg, setPg] = useState(1);
  const perPage = 6;
  useEffect(() => { if (countryFilter) setCountry(countryFilter); }, [countryFilter]);
  useEffect(() => { setPg(1); }, [search, degree, country]);
  const filtered = useMemo(() => scholarships.filter((s: any) => {
    const mS = !search || [s.title,s.summary,s.provider,s.country].some((f: string)=>f.toLowerCase().includes(search.toLowerCase()));
    const mD = degree==="All" || s.degree.includes(degree);
    const mC = country==="All" || s.country===country;
    return mS && mD && mC;
  }), [scholarships, search, degree, country]);
  const paged = filtered.slice((pg-1)*perPage, pg*perPage);
  const totalPages = Math.ceil(filtered.length/perPage);

  return (
    <div className="sh-container" style={{paddingTop:8,paddingBottom:56}}>
      <div className="sh-section-head"><h2>All Scholarships</h2></div>
      <div className="sh-filters">
        <div className="sh-search-wrap"><SearchIcon /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search scholarships..." /></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><label>Country</label><select value={country} onChange={e=>{setCountry(e.target.value);setCountryFilter(e.target.value==="All"?"":e.target.value);}}><option value="All">All Countries</option>{COUNTRIES_LIST.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><label>Degree</label><select value={degree} onChange={e=>setDegree(e.target.value)}>{DEGREES.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
      </div>
      <div className="sh-result-count">{filtered.length} scholarship{filtered.length!==1?"s":""} found</div>
      <div className="sh-grid">{paged.map((s: any)=><ScholarshipCard key={s.id} s={s} onClick={()=>{setPage("detail:"+s.slug);window.scrollTo(0,0);}} />)}</div>
      {filtered.length===0 && <div style={{textAlign:"center",padding:"48px 16px",color:"var(--text-light)"}}><p style={{fontSize:16,marginBottom:6}}>No scholarships found.</p><p style={{fontSize:13}}>Try adjusting your filters.</p></div>}
      {totalPages>1 && (<div className="sh-pages">{pg>1 && <button className="sh-page-btn" onClick={()=>setPg(pg-1)}>‹</button>}{Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(<button key={p} className={`sh-page-btn ${p===pg?"on":""}`} onClick={()=>setPg(p)}>{p}</button>))}{pg<totalPages && <button className="sh-page-btn" onClick={()=>setPg(pg+1)}>›</button>}</div>)}
    </div>
  );
}

function DetailPage({ scholarships, slug, goBack }: any) {
  const s = scholarships.find((x: any)=>x.slug===slug);
  if (!s) return <div className="sh-detail"><button className="sh-back" onClick={goBack}>← Back</button><p>Scholarship not found.</p></div>;
  return (
    <div className="sh-detail">
      <button className="sh-back" onClick={goBack}>← Back to Scholarships</button>
      <div className="sh-card-tags" style={{marginBottom:14}}>{s.tags.includes("fully-funded") && <span className="sh-tag sh-tag-ff">Fully Funded</span>}{s.tags.includes("partial-funding") && <span className="sh-tag sh-tag-pf">Partial Funding</span>}</div>
      <h1 className="sh-detail-title">{s.title}</h1>
      <p className="sh-detail-provider">{s.provider}</p>
      <div className="sh-detail-meta">
        <div><span className="lbl">Study in</span><span className="val">📍 {s.country}</span></div>
        <div><span className="lbl">Degree</span><span className="val">🎓 {s.degree}</span></div>
        <div><span className="lbl">Deadline</span><span className="val">📅 {s.deadline}</span></div>
        <div><span className="lbl">Starts</span><span className="val">🗓 {s.studyStart}</span></div>
      </div>
      <h3>About This Scholarship</h3><p>{s.summary}</p>
      {s.coverage.length>0 && (<><h3>What&apos;s Covered</h3><ul>{s.coverage.map((c: string,i: number)=><li key={i}>{c}</li>)}</ul></>)}
      {s.eligibility.length>0 && (<><h3>Eligibility</h3><ul>{s.eligibility.map((e: string,i: number)=><li key={i}>{e}</li>)}</ul></>)}
      <a href={s.link} target="_blank" rel="noopener noreferrer"><button className="sh-apply-btn">Visit Official Website ↗</button></a>
    </div>
  );
}

function TipsPage({ tips, setPage }: any) {
  return (
    <div className="sh-container" style={{paddingTop:8,paddingBottom:56}}>
      <div className="sh-section-head"><h2>Tips & Guides</h2></div>
      <p style={{color:"var(--text-mid)",marginBottom:24,fontSize:14}}>Expert advice to help you find, apply for, and win international scholarships.</p>
      <div className="sh-tips-grid">{tips.map((t: any)=>(<div key={t.id} className="sh-tip" onClick={()=>{setPage("tip:"+t.slug);window.scrollTo(0,0);}}><div className="sh-tip-cat">{t.category}</div><div className="sh-tip-title">{t.title}</div><div className="sh-tip-excerpt">{t.excerpt}</div><div className="sh-tip-meta"><span>{t.readTime} read</span><span>{t.published}</span></div></div>))}</div>
    </div>
  );
}

function TipDetailPage({ tips, slug, goBack }: any) {
  const t = tips.find((x: any)=>x.slug===slug);
  if (!t) return <div className="sh-detail"><button className="sh-back" onClick={goBack}>← Back</button><p>Article not found.</p></div>;
  return (
    <div className="sh-detail">
      <button className="sh-back" onClick={goBack}>← Back to Tips</button>
      <div className="sh-tip-cat" style={{marginBottom:10}}>{t.category}</div>
      <h1 className="sh-detail-title">{t.title}</h1>
      <div className="sh-tip-meta" style={{marginBottom:28}}><span>{t.readTime} read</span><span>By {t.author}</span><span>{t.published}</span></div>
      <div className="sh-article" dangerouslySetInnerHTML={{__html:t.content}} />
    </div>
  );
}

function AboutPage() {
  return (
    <div className="sh-about">
      <h1>About {CONFIG.SITE_NAME}</h1>
      <p><strong>{CONFIG.SITE_NAME}</strong> is a comprehensive listing of international scholarships for students from developing countries worldwide. Our mission is to make educational funding opportunities accessible and easy to navigate.</p>
      <p>We believe financial barriers should not prevent talented students from accessing quality education.</p>
      <h2>What We Do</h2><p>We research, verify, and curate scholarship opportunities from governments, universities, foundations, and international organisations. Each listing includes eligibility, deadlines, coverage details, and official links.</p>
      <h2>Our Focus</h2><p>We pay special attention to opportunities targeting students from developing countries and low-income backgrounds, prioritising fully-funded programmes covering tuition, living costs, and travel.</p>
      <h2>Stay Connected</h2><p>Subscribe to our newsletter for weekly updates on new scholarship opportunities.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function Page() {
  const { scholarships, tips, loading, error } = useSheetData();
  const [page, setPage] = useState("home");
  const [initSearch, setInitSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  if (loading) return (<div className="sh-wrap"><style>{S}</style><Header page="home" setPage={setPage} /><div className="sh-loading"><div className="sh-loading-spinner" /><p>Loading scholarships...</p></div></div>);

  const renderPage = () => {
    if (page==="home") return <HomePage scholarships={scholarships} tips={tips} setPage={setPage} setInitSearch={setInitSearch} setCountryFilter={setCountryFilter} />;
    if (page==="scholarships") return <ScholarshipsPage scholarships={scholarships} setPage={setPage} initSearch={initSearch} countryFilter={countryFilter} setCountryFilter={setCountryFilter} />;
    if (page==="tips") return <TipsPage tips={tips} setPage={setPage} />;
    if (page==="about") return <AboutPage />;
    if (page.startsWith("detail:")) return <DetailPage scholarships={scholarships} slug={page.replace("detail:","")} goBack={()=>{setPage("scholarships");window.scrollTo(0,0);}} />;
    if (page.startsWith("tip:")) return <TipDetailPage tips={tips} slug={page.replace("tip:","")} goBack={()=>{setPage("tips");window.scrollTo(0,0);}} />;
    return <HomePage scholarships={scholarships} tips={tips} setPage={setPage} setInitSearch={setInitSearch} setCountryFilter={setCountryFilter} />;
  };

  return (
    <div className="sh-wrap">
      <style>{S}</style>
      <Header page={page} setPage={setPage} />
      {error && <div className="sh-container"><div className="sh-error">⚠️ {error}</div></div>}
      {renderPage()}
      <Foot setPage={setPage} />
    </div>
  );
}
