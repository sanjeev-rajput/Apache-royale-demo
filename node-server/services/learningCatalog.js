
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.resolve(__dirname, "../../src/config");

const CATALOG_MANIFEST = path.join(configDir, "learning-catalogs.json");

// Used only when the manifest has not been created yet, so existing installs
// continue to work during the transition.
const LEGACY_CSV_FILES = ["toc-dr-1.csv", "toc-dr-2.csv"];

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

function loadCsv(filename, metadata = {}) {
  // Catalog entries are restricted to filenames in configDir. This prevents
  // manifest entries from reading files outside the configured catalog folder.
  if (
    typeof filename !== "string" ||
    !filename.toLowerCase().endsWith(".csv") ||
    filename !== path.basename(filename)
  ) {
    throw new Error(`Invalid learning catalog filename: ${filename}`);
  }

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
        // Keywords are optional during migration; new CSVs should include the
        // eighth column and quote its comma-separated values as one CSV field.
        keywords: record.keywords || "",
        subject: metadata.subject || "",
        catalogId: metadata.id || "",
        source: filename
      };
    });
}

let cachedCatalog = null;
let cachedSignature = "";

function getConfiguredCsvFiles() {
  if (!fs.existsSync(CATALOG_MANIFEST)) {
    return LEGACY_CSV_FILES.map(file => ({ file, id: "", subject: "" }));
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(CATALOG_MANIFEST, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read learning catalog manifest: ${error.message}`);
  }

  if (!manifest || !Array.isArray(manifest.catalogs)) {
    throw new Error(
      'Invalid learning catalog manifest: expected a "catalogs" array.'
    );
  }

  const entries = manifest.catalogs
    .filter(entry => typeof entry === "string" || entry?.enabled !== false)
    .map(entry => typeof entry === "string"
      ? { file: entry, id: "", subject: "" }
      : { file: entry.file, id: entry.id || "", subject: entry.subject || "" })
    .filter(entry => entry.file);

  if (!entries.length) {
    throw new Error("Learning catalog manifest contains no enabled CSV files.");
  }

  const files = entries.map(entry => entry.file);
  const uniqueFiles = [...new Set(files)];
  if (uniqueFiles.length !== files.length) {
    throw new Error("Learning catalog manifest contains duplicate CSV filenames.");
  }

  return entries;
}

function getCatalogSignature(files) {
  const parts = [];

  if (fs.existsSync(CATALOG_MANIFEST)) {
    const stat = fs.statSync(CATALOG_MANIFEST);
    parts.push(`manifest:${stat.mtimeMs}:${stat.size}`);
  } else {
    parts.push("manifest:legacy");
  }

  for (const filename of files) {
    if (
      typeof filename !== "string" ||
      !filename.toLowerCase().endsWith(".csv") ||
      filename !== path.basename(filename)
    ) {
      throw new Error(`Invalid learning catalog filename: ${filename}`);
    }

    const filePath = path.join(configDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Learning CSV not found: ${filePath}`);
    }

    const stat = fs.statSync(filePath);
    parts.push(`${filename}:${stat.mtimeMs}:${stat.size}`);
  }

  return parts.join("|");
}

export function getLearningCatalog() {
  const entries = getConfiguredCsvFiles();
  const signature = getCatalogSignature(entries.map(entry => entry.file));

  // Refresh automatically when the manifest or any listed CSV changes.
  if (!cachedCatalog || signature !== cachedSignature) {
    cachedCatalog = entries.flatMap(entry => loadCsv(entry.file, entry));
    cachedSignature = signature;
  }

  return cachedCatalog;
}


export function searchLearningCatalog({
  q = "",
  grade = "",
  topic = "",
  subtopic = "",
  activityType = "",
  subject = "",
  limit = 20
} = {}) {
  const catalog = getLearningCatalog();
  const query = String(q).toLowerCase().trim();
  const wantedGrade = String(grade).toLowerCase().trim();
  const wantedTopic = String(topic).toLowerCase().trim();
  const wantedSubtopic = String(subtopic).toLowerCase().trim();
  const wantedType = String(activityType).toLowerCase().trim();
  const wantedSubject = String(subject).toLowerCase().trim();

  const scoreQuery = item => {
    if (!query) return 0;
    const exactFields = [item.topic, item.subtopic].map(value => value.toLowerCase());
    if (exactFields.some(value => value === query)) return 100;
    if (exactFields.some(value => value.includes(query) || query.includes(value))) return 80;

    const keywords = String(item.keywords || "")
      .split(",")
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);
    if (keywords.some(value => value === query)) return 70;
    if (keywords.some(value => value.includes(query) || query.includes(value))) return 60;

    if ([item.activityName].some(value => value.toLowerCase().includes(query))) return 40;
    if ([item.description].some(value => value.toLowerCase().includes(query))) return 30;
    if ([item.grade, item.activityType, item.location, item.subject]
      .some(value => String(value || "").toLowerCase().includes(query))) return 10;
    return 0;
  };

  const matches = catalog
    .filter(item => {
      const queryMatches = !query || scoreQuery(item) > 0;
      return queryMatches &&
        (!wantedGrade || item.grade.toLowerCase() === wantedGrade) &&
        (!wantedTopic || item.topic.toLowerCase() === wantedTopic) &&
        (!wantedSubtopic || item.subtopic.toLowerCase() === wantedSubtopic) &&
        (!wantedType || item.activityType.toLowerCase() === wantedType) &&
        (!wantedSubject || item.subject.toLowerCase() === wantedSubject);
    })
    .map((item, index) => ({ item, index, score: scoreQuery(item) }))
    // Higher-confidence topic/subtopic and keyword matches appear first.
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.item);

  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
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
    activityTypes: uniqueValues("activityType"),
    subjects: uniqueValues("subject")
  };
}
