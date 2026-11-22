# Apache Royale Agentic Learning Project — Context & Handover

**Document purpose:** A durable project reference for continuing development across ChatGPT conversations or clients.  
**Last updated:** 22 November 2026  
**Project root:** `E:\projects\Apache-royale-demo`

> This document records the architecture, decisions, working practices, and known status established in prior discussions. It is not a substitute for the source code. When implementation details matter, inspect the current files in the repository and verify that they still match this document.

---

## 1. Project overview

The project is an independently conceived and developed AI-powered K-12 learning platform, focused on the Indian syllabus. It is the user's own initiative, developed in free time; it was not commissioned by an employer or client.

The application combines:
- AI-generated explanations and practice questions.
- A catalogue of learning activities sourced from SME-maintained CSV files.
- YouTube learning videos.
- An Apache Royale frontend.
- A Node.js backend with an agent orchestration layer and configurable LLM provider.

The intended learner flow is:
1. AI explanation of the learner's topic.
2. Practice questions.
3. Relevant catalogue activity cards from CSV data.
4. Relevant YouTube videos.

The project should remain model/provider agnostic.

## 2. Technology and environment

### Frontend
- Apache Royale.
- The user prefers maintaining the Apache Royale implementation rather than migrating the application to React.
- Preserve the existing Royale UI and component conventions unless a change is explicitly requested.

### Backend
- Node.js with Express.
- ES modules (`"type": "module"` in `package.json`).
- Node version used locally: `v22.13.1`.
- Backend directory: `E:\projects\Apache-royale-demo\node-server`.

### LLM providers
The application switches providers using `APP_ENV`:
- `APP_ENV=LOCAL` → Ollama.
- `APP_ENV=LIVE` → OpenRouter.

The local Ollama model used in earlier testing was `qwen3.5:4b`. This is a testing model, not a binding for the final model choice.

### Hosting
- Render is the production hosting target.
- Do not deploy to Render on the user's behalf.
- Never deploy without the user's explicit approval.
- The user may choose to install a patch directly on Render without local Ollama testing. Respect that explicit choice when made.

### Environment configuration notes
Previously established examples:

Local `.env`:
```env
APP_ENV=LOCAL
LEARNING_CONFIG_DIR=../src/config
AI_TIMEOUT_MS=180000
```

Render environment (assuming Render's working directory is `node-server`):
```env
APP_ENV=LIVE
LEARNING_CONFIG_DIR=./config
AI_TIMEOUT_MS=180000
OPENROUTER_API_KEY=<server-side secret>
OPENROUTER_MODEL=openrouter/free
YOUTUBE_API_KEY=<server-side secret>
```

`PEXELS_API_KEY` is only needed if Pexels functionality remains enabled.

Important:
- Treat these as previously discussed settings, not proof of the current live environment. Verify the actual Render dashboard and current source before changing configuration.
- Keep API keys and other secrets on the server. Never commit or expose them.
- `LEARNING_CONFIG_DIR` was confirmed by the user as `./config` on Render on 20 November 2026.

## 3. Project architecture and ownership boundaries

### Programmer-owned responsibilities
Application code and orchestration own:
- Agent orchestration and planning execution.
- Provider abstraction and LLM calls.
- Data flow and integrations.
- Catalogue retrieval and search implementation.
- Deterministic filtering and relevance evaluation.
- API response construction.
- YouTube search and attachment.
- Frontend rendering and interactions.

### SME-owned responsibilities
Subject-matter experts own educational quality through configuration, especially JSON instruction profiles:
- `responseGuidelines`
- `qualityGuidelines`
- `assessmentGuidelines`

Do not hardcode grade-level teaching behaviour, pedagogy, or educational quality rules in application code. SME profiles should guide the LLM's educational responses.

### CSV and configuration ownership
- CSV catalogues and SME JSON instruction profiles are SME-owned.
- Do not edit CSV data, SME profiles, or catalogue configuration without the user's approval.
- Catalogue Relevance v4 is the authority for learner-facing catalogue relevance and recommendation decisions. Do not change it without explicit approval.

### Important separation of responsibilities
The LLM may help interpret a learner's request and identify search parameters such as topic, grade, and subject. However, the deterministic JavaScript pipeline owns:
- CSV search and filtering.
- Catalogue relevance evaluation.
- Selection of activity cards for the API response.
- YouTube lookup and attachment.

Changing the LLM provider should not unexpectedly change the deterministic search implementation. Different LLM outputs can produce different search parameters, but with the same inputs and data the JavaScript pipeline should behave consistently.

Do not expose numerical relevance scores to learners. Use qualitative labels if labels are needed.

## 4. Catalogue search and relevance

The backend has used:
- `learningCatalog.js` for loading and searching catalogue data.
- `agentTools.js` for exposing catalogue operations to the agent.
- `catalogueRelevance.js` / Catalogue Relevance v4 for relevance decisions.

Previously inspected `learningCatalog.js` behaviour:
- Loads enabled CSV files through `learning-catalogs.json`.
- Uses `LEARNING_CONFIG_DIR` to locate the configuration directory.
- Supports fields including grade, topic, subtopic, activity type/name, description, location, keywords, instruction profile, subject, catalogue ID, and source.
- Searches using query parameter `q`, with optional grade/topic/subtopic/activity type/subject and limit.
- Grade filtering compares normalized grade strings exactly. For example, `Class 3` is not the same value as `3`.
- Search ranking includes exact/partial topic or subtopic, keywords, activity name, description, and other fields.
- Default result limit was 20, clamped to 1–100.

These are notes from a prior source inspection. Reopen current source before relying on exact implementation details.

### Catalogue manifest previously supplied
The uploaded `learning-catalogs.json` contained three enabled catalogue entries:
- `english-main` → `English.csv`, subject `English`.
- `math-main` → `Math.csv`, subject `Maths`.
- `evs-main` → `EVS.csv`, subject `EVS`.

The manifest's schema listed columns:
`Grade`, `Topic`, `Subtopic`, `Activity Type`, `Activity Name`, `Description`, `Location`, `Keywords`.

Verify the current manifest and exact filenames in each environment before assuming they are synchronized.

## 5. Planner efficiency and reliability work

Two targeted patches were previously prepared and tested.

### Reliability patch
Files involved:
- `agent/agentEngine.js`
- `agent/agentLlmResilience.js`
- `services/llmProvider.js`

The work addressed:
- Structured planner output truncation.
- Preserving raw model response content and provider metadata.
- Handling invalid JSON and empty output.
- Separating attempt budgets.
- Deterministic catalogue fallback when structured planner output is unavailable.
- Schema validation and avoiding execution of malformed planner actions.

Mocked provider tests and Node syntax checks passed at the time. Full application/Ollama integration was not established by those checks alone.

### Planner-efficiency patch
Files involved:
- `agent/agentEngine.js`
- `agent/agentPlanner.js`

The work addressed:
- Normalizing comparable call keys.
- Avoiding duplicate/equivalent catalogue calls.
- Skipping `getLearningFilters` after a successful catalogue search.
- Tightening planner guidance so one concept/grade/subject generally triggers one search.
- Allowing filters when explicitly requested or when a label is unclear.

`agentTools.js` was inspected but not changed in that patch.

Local tests previously showed:
- Fractions, Class 4 → one search; relevant activity cards and five YouTube videos.
- Explicit filter request → `getLearningFilters`.
- Fractions and Decimals, Class 4 → one search; relevant activity cards and five YouTube videos.
- The user described the Royale output as “very satisfying”.

Do not assume those test results prove the current deployment is unchanged. Verify current files and runtime when necessary.

## 6. Render catalogue issue — resolved on 20 November 2026

### Symptoms
Local Ollama returned activity cards for prompts such as:
`I want to learn noun for class 3`

Render returned AI explanations and YouTube videos but no activity cards.

### Evidence from Render logs
The logs showed:
- Planner structured output could be truncated (`finish_reason=length`).
- OpenRouter free providers could return HTTP 429 rate-limit errors.
- JavaScript catalogue search returned zero records.
- Catalogue Relevance v4 consequently reported zero direct, related, and recommended records.
- YouTube search still found and attached five videos.

Diagnostic examples included:
```text
[Agent Catalogue Search] fallback returned=0; q="alphabet"; grade="Class 1"
[Agent Catalogue Relevance v4] direct=0; strongRelated=0; weakInternal=0; recommended=0
[YouTube] Found 5 videos ...
[Agent YouTube] Attached 5 videos.
```

### Root cause established by the user
The CSV catalogue files on Render had not been updated. The user confirmed this was the cause.

The Render environment variable was confirmed as:
```env
LEARNING_CONFIG_DIR=./config
```

The uploaded manifest enabled:
- `English.csv`
- `Math.csv`
- `EVS.csv`

The missing/outdated catalogue data explains why the JavaScript search returned zero records even though the local environment had the updated data.

### Resolution and lesson
The user updated the CSV files on Render. No change to Catalogue Relevance v4 or JavaScript search logic was required to resolve this discrepancy.

For future environment discrepancies, compare:
1. `LEARNING_CONFIG_DIR`.
2. `learning-catalogs.json`.
3. Exact enabled CSV filenames.
4. Actual CSV versions/content in local and Render.
5. Search parameters and returned record counts.
6. Relevance v4 output.
7. API response and Royale rendering.

Do not assume an LLM/provider problem when deterministic data files may differ between environments.

## 7. Other project history and technical notes

These are useful background notes, not necessarily current active tasks:
- The backend has included routes such as `/api/chat`, `/api/vision`, `/api/llama`, and learning endpoints such as `/api/learning/search`, `/api/learning/filters`, and `/api/learning/chat`.
- WebSocket functionality has included Wikipedia streams, collaborative chat, and stock ticker functionality.
- YouTube integration has included Royale components such as `YouTubeVideoCard.mxml` and `AgenticLearningMain.mxml`.
- Pexels video functionality was previously explored.
- A React integration experiment used a central `ReactCompController.js` to mount React components into Royale containers. This does not mean the main application should migrate to React.
- Local Node server and Render deployment have had environment/configuration issues in the past. Inspect current logs and files before assuming older issues remain.

## 8. Explicit constraints — do not change without approval

Unless the user explicitly requests it, do not:
- Modify Catalogue Relevance v4.
- Change CSV catalogue data or SME-owned JSON profiles.
- Change educational quality/pedagogy rules in application code.
- Change the YouTube integration or its behaviour.
- Change `agentTools.js` as part of an unrelated fix.
- Change math rendering or token limits.
- Resume previously deferred/incomplete teaching-output or math-rendering investigations.
- Migrate the frontend from Apache Royale to React.
- Introduce a database, user management, or session persistence design without a request.
- Recreate discarded project-management automation workspaces.
- Restart Git/source recovery or pivot to YouTube Data API work unless requested.

## 9. Development collaboration preferences

The user:
- Has 20+ years of software development and architecture experience.
- Is confident in OOP and Core Java.
- Is less familiar with JavaScript/Node.js and prefers unfamiliar concepts explained step by step, sometimes with Java/OOP analogies.
- Prefers fundamentals and general programming concepts over framework-specific dogma.
- Prefers focused, minimal changes over large rewrites.
- Wants unrelated functionality preserved.
- Wants a clear explanation of what will change and why before code changes.
- Usually prefers local testing first, but may explicitly choose direct Render patching. Follow the choice made for the particular task.
- Wants a backup of affected files before applying patches.
- Expects ZIP patches to include a README with affected files, installation steps, and testing instructions when a code patch is delivered.
- Values evidence-based debugging and does not want speculative changes.
- Does not want the assistant to claim tests passed unless they were actually run. Distinguish syntax checks, unit/mocked tests, and full integration tests.
- Does not want the assistant to deploy to Render without explicit approval.

### Preferred change workflow
1. Understand the requested behaviour and acceptance criteria.
2. Inspect the current relevant source files and configuration.
3. Explain the proposed design/change and identify files likely to be affected.
4. Wait for approval when scope or architecture is not already clear.
5. Make the smallest targeted change.
6. Preserve unrelated code and functionality.
7. Run relevant local checks/tests where agreed.
8. Report exactly what was tested and what was not.
9. Package code changes in a ZIP with README and application instructions when appropriate.
10. Let the user apply/deploy the patch; never deploy without explicit approval.
11. Review actual runtime logs and UI output after the user tests.

## 10. Current status and next work

As of 20 November 2026:
- The local/Render catalogue discrepancy was traced to outdated CSV files on Render.
- The user confirmed the CSV files were updated.
- The application’s deterministic catalogue search and YouTube pipeline were not redesigned as part of the resolution.
- The user is ready to discuss additional project functionality.

**Next step:** Ask the user to describe the new functionality they want. Do not assume what it is or begin changing code before understanding the requirement.

---

## 11. How to use this document in a new ChatGPT conversation

When a conversation reaches its limit:
1. Start a new conversation in ChatGPT Web or Desktop.
2. Attach this `PROJECT_CONTEXT.md` file.
3. Send this prompt:

> Please read the attached PROJECT_CONTEXT.md carefully and use it as the handover context for my Apache Royale Agentic Learning project. Continue from the documented architecture, decisions, constraints, and current status. Do not restart completed investigations or change anything marked as requiring my approval. First, tell me briefly what you understand the current project status to be, then ask what I want to work on next.

For a new feature, explain the requirement in ordinary language. You do not need to know AI terminology or write a complicated prompt.

**Maintenance rule:** Update this document after significant architecture decisions, completed features, important debugging findings, or changes in project status. Keep it factual and distinguish confirmed facts from assumptions.


## 12. New feature planned — independent Assessment Agent (20 November 2026)

### User's goal
After the existing AI teaching response, Apache Royale should offer an invitation such as:
**"Ready to check your understanding? Take a quick 5-question quiz and see how much you've learned."**

On activation:
- Generate exactly five MCQs based on the learner's current topic, grade, subject and teaching context.
- Display all five questions together.
- Use radio buttons for single-answer MCQs.
- Require all five questions to be answered before submission.
- After submission, lock the answers and show the score, percentage, correct/incorrect answers, correct answers and useful explanations.
- Feedback bands:
  - 70–100%: Good understanding.
  - 50–69%: Getting there; practise a little more.
  - Below 50%: Revise and practise more.
- Since five questions produce scores in 20% increments, the practical outcomes are 0/20/40%, 60%, and 80/100%.
- Once submitted, that attempt is completed and cannot be edited or resubmitted.
- Provide a separate **Try another quiz** action that creates a new attempt with five fresh questions on the same topic and grade.
- The quiz language should match the language of the AI teaching response.
- Difficulty should be appropriate to the learner's grade and topic (adaptive).

### Confirmed interaction choices
- All five questions on one screen.
- Show correct/incorrect review after submission.
- Allow a new quiz through a separate action; do not reopen or reset the completed attempt.
- Adaptive grade/topic-appropriate difficulty.
- Same language as the teaching response.
- New attempt uses the same topic and grade with five new questions.

### Isolation and folder decision
The user explicitly requires the assessment feature to be independent and not conflict with existing running code.

Preferred location:
`E:\projects\Apache-royale-demo\node-server\agent\assessment-agent\`

This nested location is preferred over a top-level `node-server\assessment-agent` because it groups the feature with agent-related backend capabilities while keeping all assessment implementation files in its own directory.

Implementation rule:
- Keep assessment-specific generator, validator, attempt handling, scoring, and supporting configuration inside this dedicated folder wherever practical.
- Do not modify or rewrite existing planner, catalogue search, Catalogue Relevance v4, CSV, YouTube, or teaching-response logic to implement the feature.
- Any required integration into existing API routing or the Royale response flow must be minimal, explicit, and agreed after inspecting the current source.
- Do not silently change existing endpoint contracts or response shapes.
- Avoid shared mutable state with the existing agent pipeline.
- The first version may use a server-side in-memory attempt store with expiry, provided the limitations (attempts lost on server restart and process-local storage) are documented. Do not introduce a database without approval.
- Correct answer keys must remain server-side until submission; the question-generation API must not expose them to the browser.
- The server, not the LLM or browser, calculates the score.
- Reuse SME `assessmentGuidelines` only after inspecting the current profile structure and confirming compatibility; do not modify SME-owned profiles without approval.

### Proposed API responsibilities (subject to source inspection)
- `POST /api/learning/assessment/generate` — create a new assessment attempt and return five questions without answer keys.
- `POST /api/learning/assessment/submit` — validate the attempt and submitted choices, score server-side, and return the result/review.
- Attempt IDs should be validated and associated with server-side answer keys and attempt state.
- Define expiry, duplicate submission, invalid attempt ID, incomplete answers, and new-attempt behaviour before implementation.

### Current status
Design discussion only. No assessment code has been written or integrated yet.

### Next implementation step
Inspect the actual current Node.js route structure, agent directory, LLM service interfaces, SME assessment profile, and relevant Royale response components. Then propose a minimal integration plan and list exact files to be created or touched. Wait for user agreement before editing code.


## 13. Assessment Agent source inspection — uploaded source snapshot (20 November 2026)

The user supplied three archives for source review:
- `node-server(1).zip` — 36 files, approximately 214 KB uncompressed.
- `config(1).zip` — 28 files, approximately 787 KB uncompressed.
- `royale.zip` — 6 files, approximately 68 KB uncompressed.

These are the source snapshot inspected for the initial Assessment Agent design. Before implementation, compare with the user's current working tree if the files have changed since upload.

### Confirmed backend structure
- `server.js` imports `app.js` and configures the shared WebSocket server.
- `app.js` registers existing routes, including `/api/learning` and `/api/agent`.
- `routes/agent.js` calls `runLearningAgent()` from `agent/agentEngine.js`.
- `services/llmProvider.js` exports provider-neutral `generateText()`, `generateStructuredResponse()`, and `getLlmConfig()`. It selects Ollama/OpenRouter using `APP_ENV`.
- `agent/agentLlmResilience.js` owns the existing agent's OpenRouter model discovery/retry and process-level model health state. Reusing it directly would couple the new Assessment Agent to the existing agent's retry budget/state; avoid that unless explicitly chosen.
- Existing `agentEngine.js` builds its final response with `reply`, `results`, `contentSource`, `showAiWarning`, and `agent`, then attaches YouTube videos. It currently does not return a dedicated learner assessment context object.
- `agentEngine.js` has access to the original learner message, latest search arguments (including any q/grade/subject supplied by the planner), relevant catalogue results, and generated teaching response. These are potential sources for an explicit `assessmentContext` response field, but any modification must be minimal and approved.
- `configPath.js` resolves configured data paths relative to `process.cwd()` and exposes `getConfigPath()`.
- `agentConfigLoader.js` currently loads SME profiles referenced by catalogue result `instructionProfileId` and formats `responseGuidelines`, `qualityGuidelines`, and `assessmentGuidelines` for the existing teaching response.

### Confirmed API structure
- `app.js` currently mounts `/api/agent` using `routes/agent.js`.
- Existing `routes/learning.js` serves catalogue search/filter/activity and conversational learning endpoints.
- A separate `routes/assessment.js` mounted at `/api/learning/assessment` is a possible isolated integration. Because the current `/api/learning` router is mounted already, avoid route-path collisions; the cleanest option may be a separately mounted `/api/learning/assessment` router before/alongside the existing `/api/learning` mount, or a separate `/api/assessment` namespace. Final route mounting must be verified with Express 5 path semantics and tested.
- The preferred external endpoints remain:
  - `POST /api/learning/assessment/generate`
  - `POST /api/learning/assessment/submit`

### SME profile findings
- The uploaded profile directory contains 17 JSON profiles covering English, Maths and EVS.
- All inspected profile metadata marks the profiles as `owner: "SME"` and `status: "draft"`.
- Their current `assessmentGuidelines` are generic:
  - "Keep tasks clear and suitable for the specified grade band."
  - "Do not present an answer as a question prompt."
- These profiles were inferred from catalogue rows and explicitly state SME review/approval is required. Do not treat them as final approved assessment specifications or edit them without approval.
- `learning-language.json` has language and intent configuration, but the inspected response API does not expose a dedicated assessment-language field. The Assessment Agent should receive explicit language/context derived from the teaching response or a minimal new context field; do not guess the language from subject alone.

### Confirmed Royale structure
- `AgenticLearningMain.mxml` is the active Agentic Learning screen in the supplied archive.
- It sends the learner message and conversation history to `POST Config.apiBaseUrl + "agent"`.
- `handleAgentResponse()` displays `response.reply`, then activity cards from `response.results`, then YouTube cards from `response.videos`.
- `resultsContainer` is the conversation display container; it supports adding dynamic components with `addElement()`.
- `AiResponse.mxml` is the existing CSV activity card component and should remain untouched.
- The assessment UI can be encapsulated in a new standalone Royale component (for example `AssessmentPanel.mxml`) and instantiated by `AgenticLearningMain.mxml` after the teaching response. This avoids mixing quiz rendering/state into existing activity/video components.
- The supplied Royale archive also contains `LearningChatbotMain.mxml`, but the current Agentic Learning flow under discussion is `agentic/AgenticLearningMain.mxml`.

### Recommended isolated implementation plan (not yet approved for coding)
New backend directory:
`node-server/agent/assessment-agent/`

Likely new backend files:
- `assessmentGenerator.js` — prompt and structured generation through the shared provider-neutral LLM service.
- `assessmentValidator.js` — strict validation of exactly five questions, four options each, valid unique IDs/keys and one correct answer per single-select question.
- `assessmentAttemptManager.js` — server-side attempt storage, expiry, lifecycle and duplicate-submit protection.
- `assessmentEvaluator.js` — deterministic server-side scoring and answer review.
- `assessmentService.js` — coordinates generation, validation, attempt creation and submission.

Likely new API file:
- `node-server/routes/assessment.js`

Likely new Royale component:
- `royale/agentic/AssessmentPanel.mxml` (or the established equivalent source folder if build conventions require a different location).

Minimal existing integration points likely required:
- `node-server/app.js` — mount the isolated assessment router.
- `node-server/agent/agentEngine.js` — add only a separate `assessmentContext` field to the existing response, if the context cannot be safely assembled in Royale. Preserve every existing response field and current pipeline.
- `royale/agentic/AgenticLearningMain.mxml` — add the assessment panel after the response and pass the context; do not alter existing activity/video rendering.
- `package.json` — no new dependency is currently expected.

### Isolation and provider-resilience design consideration
- Reuse `services/llmProvider.js` as the provider-neutral transport so the Assessment Agent works under both `APP_ENV=LOCAL` and `APP_ENV=LIVE`.
- Do not directly reuse `createAgentLlmSession()` without explicit agreement, because its retry budget and failed/preferred model state belong to the existing agent runtime.
- Decide whether the Assessment Agent gets its own small retry/fallback wrapper or simply reports a recoverable quiz-generation failure. Keep any retry state separate from the existing Agent.
- Never send correct answer keys to Royale during quiz generation. Store them server-side with an attempt ID.
- The server must score the submitted answers. The LLM must not calculate marks.
- First version can use an in-memory, expiring attempt store; document that Render restarts clear attempts and that multiple server instances would not share the store.

### Current status
Source inspection completed for the uploaded snapshot. No application source code has been modified. No tests have been run; this was a static source review only.

### Next step
Present the proposed exact files and route-mounting approach to the user for approval before implementation. If the user approves, create only the isolated module and the minimal integration changes listed above, then run focused Node syntax/unit tests. Royale compilation must be reported separately and must not be claimed unless actually run.

## 14. Publisher Question Bank Practice — implementation and UI status (22 November 2026)

### Feature purpose and separation
The application now has two distinct practice modes following the teaching response:
- **AI-Generated Practice** — the existing AI assessment flow, retained in `AiAssessmentPanel.mxml`.
- **Question Bank Practice** — publisher-provided MCQs, handled separately in `QbAssessmentPanel.mxml`.

Keep these providers independent. Do not refactor the AI assessment flow to accommodate publisher Question Bank behaviour, and do not mix publisher answer-key/scoring rules into the AI assessment implementation.

### Publisher Question Bank data and scope
- Initial supported question type is MCQ only.
- Publisher `score` determines marks; do not invent marks for unscored questions.
- Correct answer keys remain server-side until submission; the server calculates the result.
- Previously processed v2 repository: 64 Excel workbooks; 511 MCQs retained; FIB/TOF/OTHER excluded from the initial MCQ practice scope. See the earlier project conversation/source data for the full ingestion report; verify the current data directory before relying on file-level details.
- User-reported data output: `E:\projects\Question-bank-data\Englishepository-v2`.

### Question Bank API paths used by the Royale panel
The current QB panel calls:
- `GET learning/question-bank/topics`
- `POST learning/question-bank/assessment/start`
- `POST learning/question-bank/assessment/submit`

The full API prefix is supplied through `Config.apiBaseUrl` (in the current application this is the learning API namespace). Inspect current route mounting before changing endpoints or payloads.

### Confirmed learner flow
- The teaching response and its learning resources are shown first.
- The learner can choose AI-Generated Practice or Question Bank Practice.
- The Question Bank path allows selection of class, subject, topic, and question count before starting an assessment.
- QB submission shows publisher-based score/review/feedback.
- The learner can continue learning and return to the practice invitation to choose another practice path.
- Keep only one active practice panel at a time.

### Royale components and UI decisions
- `AiAssessmentPanel.mxml` remains the AI assessment component.
- `QbAssessmentPanel.mxml` is the separate publisher Question Bank component.
- The question-card UI in QB should reuse the same assessment CSS classes as the AI panel (question number, prompt, and radio option styling) from the shared `MyStyle.css`; do not duplicate those assessment styles in a component-local `<fx:Style>` block.
- Class/subject/topic selection was explored separately from the question-card design. Jewel `Grid`/`GridCell` and `TileHorizontalLayout` were considered, but the user preferred the cleaner Spectrum Royale `Label` approach.
- Current preferred selection approach: Spectrum `Label` controls placed directly in a simple HTML `Div`, without `Grid`, `GridCell`, or `TileHorizontalLayout`. Use clickable labels with pointer cursor and rollover/rollout behaviour. The back-navigation label remains visually grey; class/subject/topic choices use orange text with a hover colour change.
- The user is satisfied with the current visual direction and explicitly wants to stop spending time on selection UI design for now, leaving further visual polish to the designer. Do not continue redesigning this UI unless asked.
- Recent patch `qb-spectrum-label-orange-update.zip` was prepared with `QbAssessmentPanel.mxml`, `MyStyle.css`, and README. It assigns the Spectrum Label `color` property and uses `rollOver`/`rollOut` handlers for selectable labels; back navigation stays grey. The user said the result looks okay. Verify the actual working-tree files before assuming that exact patch is installed.

### Integration behaviour and preservation requirements
- `AgenticLearningMain.mxml` should manage a single active practice panel and switch between AI and QB modes.
- The AI invitation's Yes action opens the practice-mode choices; choosing AI calls the existing AI generator, while choosing QB switches to `QbAssessmentPanel`.
- QB completion can return the learner to the practice invitation through the continue-learning action.
- Preserve all existing selection callbacks, question-count selection, QB API request/response handling, question rendering, answer submission, scoring, and feedback when making a UI-only change.
- Do not change Node routes, assessment semantics, scoring, or the AI panel as part of visual/layout work.

### Verification status and caveats
- Several focused patch archives were prepared during the UI iteration. MXML XML well-formedness and source-string checks were performed for those patch versions.
- Apache Royale compilation and full browser runtime testing were not performed by the assistant for the prepared patches. The user's visual feedback confirms the UI direction was reviewed in the browser, but it does not establish a successful clean compile or verify every interaction.
- The latest Spectrum Label colour patch should be treated as the current intended UI direction, not as proof that the user's working tree exactly matches the generated archive.
- Before any further code change, inspect the user's current `QbAssessmentPanel.mxml`, `AiAssessmentPanel.mxml`, `AgenticLearningMain.mxml`, and loaded `MyStyle.css`. Do not base a patch on an older uploaded snapshot without comparing it to the current files.

### Current status and next work
As of 22 November 2026:
- The separate AI and publisher Question Bank practice flows have been integrated at the UI level and iteratively reviewed.
- The Question Bank selection UI direction is accepted for now; further design refinements are deferred to the designer.
- No further selection-layout redesign should be initiated unless requested.

**Next step:** Ask the user what functionality they want to work on next. First inspect the relevant current source files, explain the smallest proposed change, and preserve all unrelated UI and functionality.
