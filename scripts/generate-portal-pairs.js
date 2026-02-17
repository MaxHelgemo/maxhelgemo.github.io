#!/usr/bin/env node
/**
 * Scans the '24 and '25 image folders for before/after pairs.
 * Filenames: DATE_1.jpg (before) and DATE_2.jpg (after), e.g. "2:19:24_1.jpg", "2:19:24_2.jpg".
 * Writes portal-pairs.json for the portal page to load.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FOLDERS = [
  { dir: "'24", year: "2024" },
  { dir: "'25", year: "2025" },
];

function parseDateFromBase(base, yearLabel) {
  // base like "2:19:24" (month:day:yy) or "4:23:2024" (month:day:yyyy)
  const parts = base.split(":");
  if (parts.length !== 3) return null;
  let month = parseInt(parts[0], 10);
  let day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  if (year < 100) year += 2000; // 24 -> 2024
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function collectPairs() {
  const pairs = [];

  for (const { dir, year: yearLabel } of FOLDERS) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => {
      return (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")) && !f.startsWith("._");
    });

    // Group by base: "2:19:24_1.jpg" -> base "2:19:24", num 1
    const byBase = {};
    for (const f of files) {
      const match = f.match(/^(.+)_(\d+)\.(jpg|jpeg|png)$/i);
      if (!match) continue;
      const [, base, num, ext] = match;
      const n = parseInt(num, 10);
      if (!byBase[base]) byBase[base] = {};
      byBase[base][n] = `${dir}/${base}_${n}.${ext}`;
    }

    for (const base of Object.keys(byBase)) {
      const nums = byBase[base];
      // Only _1 (before) and _2 (after) pairs
      const beforePath = nums[1];
      const afterPath = nums[2];
      if (!beforePath || !afterPath) continue;
      const isoDate = parseDateFromBase(base, yearLabel);
      pairs.push({
        date: isoDate || `${yearLabel}-01-01`,
        year: yearLabel,
        before: beforePath,
        after: afterPath,
      });
    }
  }

  // Sort newest first
  pairs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return pairs;
}

const pairs = collectPairs();
const outPath = path.join(ROOT, "portal-pairs.json");
fs.writeFileSync(outPath, JSON.stringify({ pairs }, null, 2), "utf8");
console.log(`Wrote ${pairs.length} pairs to ${outPath}`);
