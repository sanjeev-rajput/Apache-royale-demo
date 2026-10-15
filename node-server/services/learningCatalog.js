
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.resolve(__dirname, "../../src/config");

const CSV_FILES = ["toc-dr-1.csv", "toc-dr-2.csv"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function loadCsv(filename) {
  const filePath = path.join(configDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Learning CSV not found: ${filePath}`);
  }

  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  if (!rows.length) return [];

  const headers = rows[0].map(h =>
    h.replace(/^\uFEFF/, "").trim().toLowerCase()
  );

  return rows.slice(1)
    .filter(row => row.some(value => value.trim()))
    .map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = (row[index] || "").trim();
      });

      return {
        grade: record.grade || "",
        topic: record.topic || "",
        subtopic: record.subtopic || "",
        activityType: record["activity type"] || "",
        activityName: record["activity name"] || "",
        description: record.description || "",
        location: record.location || "",
        source: filename
      };
    });
}

let cachedCatalog = null;

export function getLearningCatalog() {
  if (!cachedCatalog) {
    cachedCatalog = CSV_FILES.flatMap(loadCsv);
  }
  return cachedCatalog;
}


export function searchLearningCatalog({
  q = "",
  grade = "",
  topic = "",
  subtopic = "",
  activityType = "",
  limit = 20
} = {}) {
  const catalog = getLearningCatalog();

  const query = q.toLowerCase().trim();

  const matches = catalog.filter(item => {
    // Search all meaningful fields in the CSV row.
    const searchableText = [
      item.grade,
      item.topic,
      item.subtopic,
      item.activityType,
      item.activityName,
      item.description,
      item.location
    ].join(" ").toLowerCase();

    return (
      (!query || searchableText.includes(query)) &&
      (!grade || item.grade.toLowerCase() === grade.toLowerCase()) &&
      (!topic || item.topic.toLowerCase() === topic.toLowerCase()) &&
      (!subtopic || item.subtopic.toLowerCase() === subtopic.toLowerCase()) &&
      (!activityType ||
        item.activityType.toLowerCase() === activityType.toLowerCase())
    );
  });

  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 20, 100)
  );

  return matches.slice(0, safeLimit);
}


export function getLearningFilters() {
  const catalog = getLearningCatalog();

  const uniqueValues = key =>
    [...new Set(catalog.map(item => item[key]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

  return {
    grades: uniqueValues("grade"),
    topics: uniqueValues("topic"),
    subtopics: uniqueValues("subtopic"),
    activityTypes: uniqueValues("activityType")
  };
}
