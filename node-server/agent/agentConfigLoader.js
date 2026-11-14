import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agent reads only SME-authored profile JSON. CSV catalogue data is supplied
// by the existing learningCatalog.js service and is never loaded here.
const PROFILE_DIR = path.resolve(__dirname, "../../src/config/profiles");

function safeProfileId(value) {
  const id = String(value || "").trim();
  return /^[a-z0-9_-]+$/i.test(id) ? id : "";
}

function formatProfile(profile) {
  const sections = [];
  if (profile.responseGuidelines) {
    sections.push(`Response guidelines:\n${JSON.stringify(profile.responseGuidelines, null, 2)}`);
  }
  if (Array.isArray(profile.qualityGuidelines) && profile.qualityGuidelines.length) {
    sections.push(`Quality guidelines:\n${profile.qualityGuidelines.map(item => `- ${item}`).join("\n")}`);
  }
  if (Array.isArray(profile.assessmentGuidelines) && profile.assessmentGuidelines.length) {
    sections.push(`Assessment guidelines:\n${profile.assessmentGuidelines.map(item => `- ${item}`).join("\n")}`);
  }
  return sections.join("\n\n");
}

/**
 * Resolve profile instructions from the already-loaded catalogue results.
 * Files are read for each agent request so SME edits/additions take effect
 * without restarting the Node server. Only referenced profile files are read.
 */
export async function loadInstructionsForCatalogueResults(results = []) {
  if (!Array.isArray(results) || results.length === 0) {
    console.info("[Agent Config] No relevant catalogue results; no SME profile applies.");
    return "";
  }

  const profileIds = [...new Set(
    results.map(item => safeProfileId(item?.instructionProfileId)).filter(Boolean)
  )];
  if (!profileIds.length) {
    console.info("[Agent Config] Catalogue results contain no valid instructionProfileId.");
    return "";
  }

  const loadedProfiles = [];
  for (const profileId of profileIds) {
    const filePath = path.join(PROFILE_DIR, `${profileId}.json`);
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const profile = JSON.parse(raw);
      if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
        throw new Error("Profile JSON must contain an object.");
      }
      const guidance = formatProfile(profile);
      if (!guidance) {
        throw new Error("Profile contains no supported guidance sections.");
      }
      loadedProfiles.push({ profileId, guidance });
    } catch (error) {
      console.warn(`[Agent Config] Could not load profile '${profileId}': ${error.message}`);
    }
  }

  if (!loadedProfiles.length) {
    console.warn("[Agent Config] No SME profiles could be loaded for this response.");
    return "";
  }

  console.info(`[Agent Config] Loaded profile(s): ${loadedProfiles.map(item => item.profileId).join(", ")}`);

  return [
    "SME-DEFINED EDUCATIONAL INSTRUCTIONS",
    "Apply the following instructions to the learner response. Treat them as the educational response standards for the matching catalogue activities.",
    ...loadedProfiles.map(item => `Profile: ${item.profileId}\n${item.guidance}`)
  ].join("\n\n");
}
