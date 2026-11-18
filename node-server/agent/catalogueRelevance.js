// Isolated generic catalogue relevance prototype v3.
// No imports from, or modifications to, the AI K12 application.
// Learner-facing policy: display direct + strong related matches only.
// Numerical scores are deliberately not part of this API or its output.

// Isolated generic catalogue relevance prototype v4.
// Adds concept-aware matching: modifiers are retained, conjunctions create
// separate concepts, and partial coverage is not promoted to a direct match.

const FIELD_ALIASES = Object.freeze({
  'Topic': ['topic', 'Topic'],
  'Subtopic': ['subtopic', 'Subtopic'],
  'Activity Name': ['activityName', 'activity_name', 'Activity Name'],
  'Keywords': ['keywords', 'Keywords'],
  'Description': ['description', 'Description']
});
const SUPPORT_FIELDS = Object.freeze(['Keywords', 'Description']);
const ALL_FIELDS = Object.freeze(Object.keys(FIELD_ALIASES));
function readField(record, field) {
  for (const key of FIELD_ALIASES[field] || [field]) {
    if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
  }
  return '';
}

const REQUEST_TERMS = new Set([
  'a','an','the','i','me','my','we','you','your','to','for','of','on','in','at','and','or',
  'please','want','would','like','learn','learning','teach','teaching','show','find','search',
  'give','provide','tell','explain','explanation','understand','about','some','with','help',
  'practice','practise','question','questions','quiz','test','lesson','activity','activities',
  'resource','resources','video','videos','importance','important','meaning','examples',
  'example','class','grade','student','students','it','its','this','that','what','how','when',
  'where','why','can','could','will','would','me','is','are','was','were','be','being','do',
  'does','did','has','have','had','but','from','into','explain','explanation','teach','teaches',
  'use','uses','using','used','learns','learning'
]);

function normalizeToken(token) {
  let value = String(token).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (value.length > 4 && value.endsWith('ies')) value = value.slice(0, -3) + 'y';
  else if (value.length > 3 && value.endsWith('s') && !value.endsWith('ss')) value = value.slice(0, -1);
  return value;
}
function tokenize(value) {
  return String(value ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
    .split(/\s+/).filter(Boolean).map(normalizeToken);
}
function splitConcepts(query) {
  return String(query ?? '').split(/\s+(?:and|or|also)\s+|[,/&+]+/i).map(part => part.trim()).filter(Boolean);
}
function termsForConcept(concept) {
  return [...new Set(tokenize(concept).filter(term =>
    term.length > 1 && !REQUEST_TERMS.has(term) && !/^\d+$/.test(term)
  ))];
}
export function extractCatalogueTopicTerms(query) {
  return [...new Set(splitConcepts(query).flatMap(termsForConcept))];
}
export function extractGrade(query) {
  const match = String(query ?? '').match(/\b(?:class|grade)\s*(\d{1,2})\b/i);
  return match ? `class${match[1]}` : '';
}
function normalizedGrade(value) { return String(value ?? '').toLowerCase().replace(/\s+/g, ''); }
function fieldTokens(record, field) { return new Set(tokenize(readField(record, field))); }
function phrasePresent(record, field, terms) {
  if (!terms.length) return false;
  const haystack = tokenize(readField(record, field));
  // Ordered phrase matching tolerates punctuation but not intervening words.
  for (let i = 0; i <= haystack.length - terms.length; i++) {
    if (terms.every((term, offset) => haystack[i + offset] === term)) return true;
  }
  return false;
}
function conceptEvidence(record, terms) {
  const fields = {};
  for (const field of ALL_FIELDS) {
    const tokens = fieldTokens(record, field);
    fields[field] = terms.filter(term => tokens.has(term));
  }
  const primaryCovered = ['Topic', 'Activity Name'].some(field => terms.every(term => fields[field].includes(term)));
  const titlePhrase = phrasePresent(record, 'Activity Name', terms);
  const topicPhrase = phrasePresent(record, 'Topic', terms);
  const subtopicCorroborated = terms.every(term => fields.Subtopic.includes(term)) && (titlePhrase || SUPPORT_FIELDS.some(field => terms.every(term => fields[field].includes(term))));
  const anyCovered = ALL_FIELDS.some(field => terms.every(term => fields[field].includes(term)));
  const directEvidence = primaryCovered || titlePhrase || topicPhrase || subtopicCorroborated;
  const matchedTerms = [...new Set(ALL_FIELDS.flatMap(field => fields[field]))];
  return { fields, primaryCovered, titlePhrase, topicPhrase, subtopicCorroborated, directEvidence, anyCovered, matchedTerms };
}
function recordIdentity(record) {
  return [record?.Grade, record?.Topic, record?.Subtopic, record?.['Activity Name'], record?.Location]
    .map(value => String(value ?? '').trim().toLowerCase()).join('|');
}
function evaluateOne(concepts, record) {
  const active = concepts.filter(c => c.terms.length);
  if (!active.length) return { classification: 'unmatched', reason: 'No meaningful topic terms were found.', evidence: [], coveredConcepts: [], missingConcepts: [] };
  const results = active.map(concept => ({
    label: concept.label,
    terms: concept.terms,
    ...conceptEvidence(record, concept.terms)
  }));
  const covered = results.filter(r => r.directEvidence || r.anyCovered);
  const directCovered = results.filter(r => r.directEvidence);
  const fullCoverage = covered.length === active.length;
  const allDirect = directCovered.length === active.length;
  const anyDirect = directCovered.length > 0;
  const matchedFields = ALL_FIELDS.filter(field => results.some(r => r.fields[field].length));
  let classification = 'unmatched';
  let reason = 'No meaningful catalogue-field evidence.';
  if (anyDirect) {
    classification = 'direct';
    reason = allDirect
      ? 'The resource directly matches every requested concept in its title or catalogue taxonomy.'
      : 'The resource directly matches at least one requested concept; overall request coverage is reported separately.';
  } else if (fullCoverage) {
    classification = 'weak_related';
    reason = 'The resource matches only part of a multi-concept request or lacks specific title/taxonomy evidence.';
  } else if (matchedFields.length) {
    classification = 'weak_related';
    reason = 'Some requested terms appear in supporting catalogue fields, but the concept is not established.';
  }
  return {
    classification, reason,
    evidence: matchedFields.map(field => ({ field, matchedTerms: [...new Set(results.flatMap(r => r.fields[field]))] })),
    coveredConcepts: covered.map(r => r.label),
    missingConcepts: results.filter(r => !covered.includes(r)).map(r => r.label),
    _conceptCount: active.length,
    _coveredCount: covered.length,
    _subtopic: String(readField(record, 'Subtopic') ?? '').trim().toLowerCase(),
    _supportFieldCount: SUPPORT_FIELDS.filter(field => matchedFields.includes(field)).length,
    _supportTerms: [...new Set(SUPPORT_FIELDS.flatMap(field => results.flatMap(r => r.fields[field])))]
  };
}
/**
 * Evaluates catalogue records and applies the agreed display policy.
 * Returns direct, strongRelated, weakRelated, unmatched and recommended groups.
 * No numerical relevance scores are produced or exposed.
 */
export function evaluateCatalogueRelevance(query, records, options = {}) {
  const sourceRecords = Array.isArray(records) ? records : [];
  const concepts = splitConcepts(query).map(raw => { const terms = termsForConcept(raw); return { label: terms.join(' '), terms }; }).filter(c => c.terms.length);
  const queryTerms = [...new Set(concepts.flatMap(c => c.terms))];
  const requestedGrade = normalizedGrade(options.grade || extractGrade(query));
  const evaluated = sourceRecords.map((record, index) => {
    const grade = normalizedGrade(record?.grade ?? record?.Grade ?? record?.class ?? record?.standard);
    const gradeMismatch = Boolean(requestedGrade && grade && grade !== requestedGrade);
    return { index, record, gradeMismatch, ...evaluateOne(concepts, record) };
  });
  const gradeEligible = evaluated.filter(item => !item.gradeMismatch);
  const direct = gradeEligible.filter(item => item.classification === 'direct');
  const weakRelated = gradeEligible.filter(item => item.classification === 'weak_related');
  const directSubtopics = new Set(direct.map(item => normalizeToken(item._subtopic)).filter(Boolean));
  const strongRelated = [];
  const remainingWeak = [];
  for (const item of weakRelated) {
    const sharesDirectNeighbourhood = Boolean(item._subtopic && directSubtopics.has(normalizeToken(item._subtopic)));
    const corroboratedSupport = item._supportFieldCount >= 2 && item._supportTerms.length >= 2;
    if (item._conceptCount === 1 && sharesDirectNeighbourhood && item._supportFieldCount > 0) {
      item.classification = 'strong_related';
      item.reason = 'The activity shares a catalogue subtopic with direct matches and has supporting evidence.';
      strongRelated.push(item);
    } else if (item._conceptCount === 1 && corroboratedSupport && item._coveredCount > 0) {
      item.classification = 'strong_related';
      item.reason = 'Multiple catalogue fields corroborate the requested concept.';
      strongRelated.push(item);
    } else remainingWeak.push(item);
  }
  const unmatched = gradeEligible.filter(item => item.classification === 'unmatched');
  const sort = list => list.sort((a, b) => a.index - b.index);
  sort(direct); sort(strongRelated); sort(remainingWeak);
  const recommended = [
    ...direct.map(item => ({ ...publicItem(item), displayLabel: 'Direct match' })),
    ...strongRelated.map(item => ({ ...publicItem(item), displayLabel: 'Related activity' }))
  ];
  const requestedConcepts = concepts.map(c => c.label);
  const coveredConcepts = requestedConcepts.filter(label => direct.some(item => item.coveredConcepts.includes(label)) || strongRelated.some(item => item.coveredConcepts.includes(label)));
  return {
    query, queryTerms, requestedConcepts, coveredConcepts,
    missingConcepts: requestedConcepts.filter(label => !coveredConcepts.includes(label)),
    requestedGrade: requestedGrade || null, total: evaluated.length,
    direct: direct.map(publicItem), strongRelated: strongRelated.map(publicItem),
    weakRelated: remainingWeak.map(publicItem), unmatchedCount: unmatched.length,
    gradeExcludedCount: evaluated.length - gradeEligible.length, recommended
  };
}

function publicItem(item) {
  return {
    index: item.index,
    record: item.record,
    classification: item.classification,
    reason: item.reason,
    evidence: item.evidence,
    coveredConcepts: item.coveredConcepts,
    missingConcepts: item.missingConcepts
  };
}

/** Small presentation adapter for a Royale/API response. */
export function buildLearnerRecommendations(result) {
  return (result?.recommended ?? []).map(item => ({
    ...item.record,
    relevanceLabel: item.displayLabel
  }));
}

/** Returns only indexes approved by the direct + strong-related display policy. */
export function getRecommendedCatalogueIndexes(result) {
  return [...new Set((result?.recommended ?? [])
    .map(item => item.index)
    .filter(index => Number.isInteger(index) && index >= 0))];
}
