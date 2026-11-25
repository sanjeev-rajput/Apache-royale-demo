# Apache Royale Agentic Learning Project — Context & Handover

**Document purpose:** A durable project reference for continuing development across ChatGPT conversations or clients.  
**Last updated:** 25 November 2026  
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

As of 23 November 2026:
- The local/Render catalogue discrepancy was traced to outdated CSV files on Render; the user confirmed the CSV files were updated.
- The existing AI K12 Learning and Agentic Learning experiences remain separate and must be preserved.
- A third, independent learner experience, **AI Adaptive Learning**, is now in active POC development.
- The functional concept and learner journey have been agreed and consolidated in the separate **AI Adaptive Learning — Concept, Functional Flow & POC Design Document**.
- The initial Royale foundation was created by replacing the Codex-written adaptive component with a copy based on `AgenticLearningMain.mxml`; the user confirmed that this Stage 1 component compiled.
- Stage 2 prepared the initial adaptive session form and backend session start/end integration. The user has not yet reported compilation or live API results for Stage 2.

**Next step:** Continue the AI Adaptive Learning POC from Stage 2. Ask the user to compile and test the Stage 2 patch if that has not yet been confirmed; then proceed to the next agreed feature increment after reviewing the actual resulting source and test feedback.

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
- User-reported data output: `E:\projects\Question-bank-data\English
epository-v2`.

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


## 15. New independent experience — AI Adaptive Learning (23 November 2026)

### 15.1 Product intent and separation
AI Adaptive Learning is a third, independent learner experience alongside:
1. AI K12 Learning.
2. Agentic Learning.
3. AI Adaptive Learning.

The POC demonstrates a continuous, feedback-driven teaching experience. The system observes assessment evidence, adapts its explanation style/examples/difficulty, and lets the learner choose what to do next.

This is a demonstration POC intended to communicate the concept to potential buyers, investors, and educational partners. It is not a production LMS specification. The commercial product may later reuse selected POC parts or be developed separately.

Do not merge the three experiences or change the existing AI K12 and Agentic Learning behaviours to implement this feature.

### 15.2 Confirmed functional decisions
- The learner explicitly selects AI Adaptive Learning from navigation.
- The initial form collects class (optional), subject (optional), and a natural-language learning prompt. The prompt is required; topic may be extracted from it.
- If class/subject are present in the prompt, extract them where possible. If not supplied, they remain optional.
- Initial content consists of an AI explanation, relevant catalogue activity cards, and relevant YouTube video cards.
- After starting, the initial fields remain visible but disabled. A **Kill and Start a New Session** control resets the current session and form.
- The original topic stays fixed for the entire session. AI may adapt explanation style, examples, teaching approach, and difficulty, but cannot independently switch topics. A new topic requires a new session.
- All four learning choices remain available regardless of performance:
  1. **Explore More Learning Activities**
  2. **Watch More Learning Videos**
  3. **Test Your Understanding with AI Practice**
  4. **Practice with the Question Bank**
- AI may recommend/highlight a choice but must not hide, disable, or restrict the other choices.
- Completed assessment feedback remains visible in chronological learning history. When a new practice starts, remove the previous practice question UI but retain its completed feedback.
- After either assessment type, a common adaptive intelligence uses question-level evidence and available feedback to generate the next explanation. Append it to the page, then show all four choices again.
- The LLM interprets assessment evidence and generates teaching content; deterministic server-side assessment logic remains authoritative for correctness and marks.
- Do not infer unsupported misconceptions. If concept-level IDs/metadata are unavailable, stay at topic level.
- Question Bank question IDs already attempted should be remembered only for the active in-memory session; prefer unseen questions and explain if there are insufficient unseen questions.

### 15.3 Resource retrieval behaviour
- Initial YouTube retrieval aims for up to 20 videos; each subsequent request should retrieve five more.
- Avoid duplicate videos where practical.
- If no more relevant videos are available, show: “You've reached the end of the relevant videos currently available.”
- Catalogue activities should be appended in additional batches. If no more relevant activities are available, show: “You've explored all the relevant activities available for this topic.”
- Previously displayed resources remain visible.

### 15.4 Assessment behaviour
**AI Assessment**
- Generate five questions for the current topic and available class/subject context.
- Reuse the existing AI Assessment generator and evaluator.
- Display deterministic score and question-level review.

**Question Bank**
- Learner selects class, subject, and topic.
- Retrieve five publisher questions.
- Preserve existing publisher content, scoring, and feedback semantics.
- Reuse the existing Question Bank retrieval and evaluation services.

Both assessment sources must be normalised into evidence for the same adaptive teaching mechanism. Do not refactor or change existing assessment scoring implementations as part of this feature.

### 15.5 POC architecture and boundaries
- Frontend: Apache Royale.
- Backend: existing Node.js/Express application.
- Hosting remains GitHub Pages + Render.
- Reuse existing shared LLM, learning resource, catalogue, YouTube, AI Assessment, and Question Bank services through their existing interfaces where practical.
- No database, permanent learner profiles, or persistent learning history is required for this POC.
- Session state is Node process-local in-memory state and may be lost on Render restart. Handle missing/expired sessions gracefully.
- Avoid enterprise/distributed architecture, unnecessary abstractions, and production LMS scope.
- Do not deploy or push without explicit user approval.

### 15.6 Source snapshots and files received
The user supplied the following source snapshots in this conversation:
- `node-server(5).zip` — Node backend source snapshot.
- `royale(2).zip` — Royale source snapshot.
- Individual Royale files: `ProductIndexing.mxml`, `product.json`, `ServiceLoader.as`, `Config.as`, and `AiResponse.mxml`.

These are uploaded snapshots, not a live connection to the user's working tree. Before any later patch, compare against the user's latest local source if it may have changed.

### 15.7 Navigation inspection
The supplied `product.json` already contains the menu label **AI Adaptive Learning**.
The supplied `ProductIndexing.mxml` already maps it to `AdaptiveLearningMain` and imports the adaptive component under the adaptive package. Therefore, based on this supplied snapshot, no new navigation entry was required for the POC. Recheck the user's current working tree before assuming no navigation work is needed.

### 15.8 Stage 1 — Royale foundation
- The Codex-written `adaptive/AdaptiveLearningMain.mxml` was replaced with a component based on the supplied `agentic/AgenticLearningMain.mxml`.
- The generated component was delivered as `AdaptiveLearningMain.mxml` and in `AI-Adaptive-Learning-Frontend-Stage1.zip`.
- The user explicitly confirmed: **Stage 1 compiled successfully** in their Apache Royale project.
- This compile confirmation applies to Stage 1 only. It does not establish that Stage 2 compiled or that any live backend calls worked.

### 15.9 Stage 2 — Initial adaptive session (patch prepared 23 November 2026)
A patch archive was prepared: `AI-Adaptive-Learning-Stage2.zip`.
It contains:
- `src/views/actionitemviews/adaptive/AdaptiveLearningMain.mxml`
- `node-server/routes/adaptiveLearning.js`
- `node-server/services/adaptiveLearningService.js`
- `README.txt`

The README describes the copy destinations and API contracts.

**Frontend behaviour in the Stage 2 patch:**
- Optional class and subject inputs.
- Required natural-language learning prompt.
- Starts a session using `POST Config.apiBaseUrl + "adaptive-learning/sessions"`.
- Displays initial explanation, activity cards, and video cards returned by the API.
- Disables the input fields after a successful start.
- Provides **Kill and Start a New Session**.
- Ends the temporary session using `DELETE Config.apiBaseUrl + "adaptive-learning/sessions/" + sessionId` and clears local UI history. If the backend session has already expired, the UI can still reset locally.

**Backend behaviour in the Stage 2 patch:**
- Route prefix is already mounted in the supplied backend `app.js` as `/api/adaptive-learning`.
- `POST /api/adaptive-learning/sessions` creates a temporary in-memory session.
- `DELETE /api/adaptive-learning/sessions/:sessionId` ends the session.
- The route also exposes `POST /api/adaptive-learning/sessions/:sessionId/actions` and delegates to `performAdaptiveAction`.
- Session TTL in the supplied service is 60 minutes; sessions are stored in a process-local `Map` and pruned when session operations occur.
- Topic extraction handles common English prompts such as “I am a student and want to learn verb”; a `Class N` / `Grade N` phrase can be extracted from the prompt. Explicit `grade` and `topic` fields take precedence as coded.
- Initial explanation uses existing learning explanation guidance and `generateText`.
- Initial resources reuse `getLearningCatalogueResources` and `getLearningVideos`.
- The service imports existing AI Assessment and Question Bank services/repository/attempt manager.

**Validation status:**
- The assistant ran Node syntax checks on the Stage 2 route and service and an XML well-formedness check on the Stage 2 MXML when preparing the patch.
- The user has confirmed successful Royale compilation only for Stage 1, not Stage 2.
- Stage 2 has not been confirmed by the user as compiled, run locally, or tested against the live API.
- No Render deployment was performed.

### 15.10 Known gaps between Stage 2 and the agreed final POC flow
Do not treat Stage 2 as the completed adaptive learning feature. The following remain for later implementation and verification:
- The Stage 2 Royale component currently implements only initial session creation/display and reset. It does not yet provide the four learning choices or assessment panels/flows.
- The backend `recommendationsFor` function in the supplied Stage 2 service changes the recommendation list according to the latest score. This conflicts with the confirmed requirement that all four choices must always remain available. Correct this in a later focused backend/frontend step.
- Current `show_activities` and `show_videos` actions return the session's currently stored resources; they do not yet implement the agreed pagination/batching behaviour (initial up to 20 videos, then five; append more catalogue activities).
- The service normalises assessment results and can start/submit AI and Question Bank attempts, but a common post-assessment adaptive explanation has not yet been implemented in the supplied Stage 2 service.
- Continuous chronological history, removal of only the previous active question UI, and appending adaptive explanations remain to be implemented in the Royale component.
- Question Bank unseen-question selection exists in the supplied service (`selectUnseenQuestionBankQuestions`) and session state tracks seen IDs, but it requires runtime validation against the current repository/service contracts and the agreed five-question flow.
- Validate API payload/response contracts against the user's actual installed backend source before applying further patches.

### 15.11 Immediate next step
The user was given the Stage 2 patch and asked to compile and test it. At the time this document was updated, no Stage 2 compile/runtime result had yet been reported.

Ask the user for the Stage 2 compile result and, if it compiles, the initial session start/reset test result. If issues arise, request exact compiler output, browser console/network response, or Node logs. Inspect the latest working-tree source before preparing a corrective patch.

### 15.12 Working rules specific to AI Adaptive Learning
- Keep the adaptive component and backend feature isolated from Agentic Learning.
- Use `AgenticLearningMain.mxml` as the UI/interaction starting reference, not as a runtime dependency to be modified.
- The user's confirmed Stage 1 compile is the baseline for the initial component copy.
- Prefer focused patch ZIPs with README and exact file paths.
- Do not claim a patch is compiled or integration-tested unless the user confirms it or the relevant test was actually run.
- Do not silently modify Codex-written code beyond the explicit replacement/adaptation agreed with the user; inspect it and explain material changes.

---

## 16. Agentic and Adaptive assessment component separation — current work (25 November 2026)

### 16.1 Architecture decision confirmed by the user

The user chose **independent Agentic Learning and Adaptive Learning UI components** rather than forcing shared assessment components or introducing tight coupling.

The guiding principle is that a developer should be able to open the relevant learning module and understand/change its components without unintentionally affecting the other module.

Target direction:
- Agentic Learning owns its own `AiAssessmentPanel.mxml`, `QbAssessmentPanel.mxml`, and `YouTubeVideoCard.mxml`.
- Adaptive Learning should own independent copies of those components when/if they are integrated into its flow.
- Each module retains its own orchestration, API/session workflow, and assessment integration.
- Existing backend services, shared stylesheet resources, and genuinely common utilities may remain shared where this does not couple the frontend workflows.
- Do not refactor working Adaptive assessment rendering merely to force component reuse.
- Avoid broad restructuring. Make small, isolated changes and test each module independently.

**Important current-state distinction:** The target architecture is agreed, but it is not yet fully implemented. In the uploaded source snapshot reviewed on 25 November, Adaptive Learning still renders its assessment inline in `AdaptiveLearningMain.mxml`; it does not yet use its own `AiAssessmentPanel` or `QbAssessmentPanel`.

### 16.2 Source snapshot reviewed

The user uploaded `agentic-adaptive.zip`. The instruction was to ignore backup files whose filename stem ends in `-` or `_`.

The active files in that archive were:
- `agentic/AgenticLearningMain.mxml`
- `agentic/AiAssessmentPanel.mxml`
- `agentic/QbAssessmentPanel.mxml`
- `agentic/YouTubeVideoCard.mxml`
- `adaptive/AdaptiveLearningMain.mxml`

The archive contained eight entries in total, including entries excluded by the backup-file rule. This was an uploaded snapshot, not a live connection to the user's working tree. Always inspect the latest working files before preparing subsequent changes.

### 16.3 Findings from the uploaded source

- Agentic Learning instantiates its AI assessment panel, Question Bank panel, and YouTube card.
- Agentic `QbAssessmentPanel.mxml` already rendered question images, but answer options were rendered as text. Image filenames in option values therefore appeared as literal text.
- Adaptive Learning had its own inline assessment rendering in `AdaptiveLearningMain.mxml`, including working question-image and option-image rendering as confirmed by the user's browser screenshot.
- Adaptive Learning imported the Agentic `YouTubeVideoCard`; this was a frontend dependency the user wanted to remove.
- Adaptive's existing assessment rendering and session workflow should be preserved while independent component copies are considered. Do not assume that simply adding unused copies completes the separation.

### 16.4 Agentic Question Bank answer-option image patch

A patch archive was prepared:
- `agentic-adaptive-independent-components.zip`

Changes included:
- `agentic/QbAssessmentPanel.mxml`: render image-based answer options using the existing image URL helper, while retaining the radio selection and option ID.
- Handle publisher option values with a leading choice prefix such as `A. filename.jpg`.
- Add `adaptive/YouTubeVideoCard.mxml` as a copy of the Agentic card.
- Update `adaptive/AdaptiveLearningMain.mxml` to import its own Adaptive YouTube card.

No Adaptive assessment rendering or backend behaviour was changed in that patch.

The user tested the Agentic component and reported that the Agentic assessment flow appeared to be working. The screenshot then showed that the feedback/review section still displayed image filenames as text for correct answers.

### 16.5 Agentic feedback image patch

A further focused patch archive was prepared:
- `agentic-feedback-image-support.zip`

Only this file was changed:
- `agentic/QbAssessmentPanel.mxml`

The feedback renderer now detects whether `item.correctAnswer` is an image filename using the existing Question Bank image URL helper. If it is an image, it adds an image component to the feedback section instead of displaying the filename as text. Text-based correct answers continue to display as text. Existing score text, correctness state, feedback message, API calls, and server-side scoring were intended to remain unchanged.

**Verification status:**
- The ZIP archive was created and reopened to verify its contents and the presence of the intended source change.
- The user has not yet reported testing this feedback-image patch in Apache Royale/browser.
- No Royale compilation or full browser test was performed by the assistant.
- Do not claim feedback image rendering is confirmed until the user tests it.

### 16.6 Current file-level status

| Area | Current state |
|---|---|
| Agentic `QbAssessmentPanel` option images | Patch prepared; user reported the Agentic assessment otherwise appeared to work |
| Agentic `QbAssessmentPanel` feedback images | Patch prepared; awaiting user test |
| Agentic `AiAssessmentPanel` | No change in this work |
| Adaptive question/option image rendering | Existing implementation was working in the user's screenshot; preserve it |
| Adaptive `YouTubeVideoCard` | Independent copy and import update included in the first patch archive; user integration/test confirmation is not yet recorded |
| Adaptive `AiAssessmentPanel` copy | Not created/integrated |
| Adaptive `QbAssessmentPanel` copy | Not created/integrated; Adaptive still renders assessment inline in the reviewed source |
| Backend APIs, session handling, and scoring | No changes in this work |

### 16.7 Immediate next step

The user is testing the Agentic component changes by copying the updated files into the project. They shared the feedback screenshot and the assistant prepared the feedback-image patch.

Next:
1. Let the user test the latest `agentic-feedback-image-support.zip` change.
2. Review the user's result or any compiler/runtime error.
3. Fix only the specific issue demonstrated.
4. After Agentic is stable, discuss the next Adaptive component-separation step against the user's latest source. Do not assume the user wants Adaptive refactoring immediately.
5. Before further edits, inspect the current versions of `AgenticLearningMain.mxml`, `AiAssessmentPanel.mxml`, `QbAssessmentPanel.mxml`, `YouTubeVideoCard.mxml`, `AdaptiveLearningMain.mxml`, and the relevant stylesheet.

### 16.8 Collaboration constraints for this work

- Preserve the independent-module architecture decision.
- Do not introduce a shared assessment renderer or shared workflow component unless the user later changes this decision.
- Do not modify Adaptive's working assessment image rendering while fixing Agentic.
- Do not change backend endpoints, payload contracts, publisher scoring, correct-answer evaluation, or session handling for a UI-only image-rendering task.
- Keep answer correctness and scoring server-authoritative.
- Report exactly which files changed and which tests were actually performed.
- The user applies local changes; do not push or deploy.


---

## 17. Latest update — shared LLM provider policy and local regression validation (25 November 2026)

This section is the latest status and supersedes older status statements in Sections 10, 15.11, 16.5, 16.6, and 16.7 wherever they conflict with the confirmations below.

### 17.1 Shared model-selection policy — agreed
The user confirmed that all three learning experiences must use the model configured by the shared provider:
1. AI K12 Learning.
2. Agentic Learning.
3. AI Adaptive Learning.

The agreed environment policy is:
- `APP_ENV=LOCAL` → use the configured local Ollama provider/model.
- `APP_ENV=LIVE` → use the configured OpenRouter provider/model (production configuration previously discussed includes `OPENROUTER_MODEL=openrouter/free`).
- Individual learning experiences must not independently discover, select, or switch models.
- The shared provider is the single authority for provider/model selection.
- Do not add a separate assessment-verifier model setting. Any future verifier should use the shared provider configuration unless the user explicitly changes this decision.
- OpenRouter's own routing behind `openrouter/free` is distinct from application-level model discovery. Do not reintroduce per-module discovery/fallback that overrides the shared configuration.

The local test configuration used in this development cycle was Ollama with `qwen3.5:4b`. Treat that as the tested local model, not as a permanent production-model decision.

### 17.2 Local manual regression test — user confirmed successful
The user manually tested the UI and functionality of each learning experience locally using Ollama, comparing behaviour with the previous implementation.

The user specifically confirmed:
- AI K12 Learning continued to behave as expected.
- Agentic Learning continued to behave as expected.
- AI Adaptive Learning continued to behave as expected.
- AI Practice in both Agentic and Adaptive generated questions successfully.
- Learner interaction and assessment flow worked as expected.
- The feedback section appeared as it did previously in both Agentic and Adaptive.
- The user reported that all tested components produced the same expected results as before.

**Status:** Shared provider integration and the above local UI/functional regression checks are considered successful by the user with Ollama.

**Scope limitation:** This is a user-performed local manual functional regression test. It does not establish production OpenRouter behaviour, Render deployment behaviour, automated test coverage, or independent educational correctness of every LLM-generated question and explanation.

### 17.3 Assessment quality validation — design discussion, not yet implemented
A separate discussion explored how to validate AI-generated assessment questions and answer keys when no pre-existing question bank exists.

Key principles established:
- The backend can validate a generated assessment object at runtime; a permanent question database is not required for that validation step.
- The generated question, options, proposed correct answer, and explanation are available as structured data before the assessment is returned to the learner.
- Deterministic checks can validate structure and supported domain-specific calculations/rules.
- A second LLM pass can independently solve/review a question using the shared provider, but it is probabilistic and must not be described as a guarantee of correctness. The verifier may repeat the generator's mistake.
- Any future validation pipeline should make uncertainty explicit and reject or regenerate assessments when checks disagree or confidence is insufficient. The exact design and acceptance policy remain to be agreed before implementation.
- The existing backend assessment attempt/scoring path should remain authoritative for scoring. Preserve the exact accepted answer key with the attempt so later scoring uses the same key that was validated and served.

Potential architectural description discussed: **Agentic Assessment Workflow Orchestration** / **AI Assessment Validation Pipeline**. These are descriptive names, not an approved implementation scope.

### 17.4 Current implementation baseline
- The three learning experiences remain independent at the UI/workflow level.
- Agentic and Adaptive retain their own assessment panels/components and orchestration; do not force a shared assessment renderer or shared workflow component.
- Existing AI Practice generation, submission, and feedback paths in Agentic and Adaptive were manually exercised by the user and reported working locally.
- Keep backend scoring authoritative and preserve existing response/API contracts unless a future task explicitly requires a change.
- The shared LLM provider policy is now the local development baseline.

### 17.5 Testing boundary and next environment
- Local Ollama testing is the confirmed validation environment for this cycle.
- OpenRouter/Render production behaviour has not been validated by the manual tests described above.
- Do not deploy or push. The user applies changes and controls deployment.
- When production validation is requested, inspect current source and actual Render configuration first; do not infer that the live environment exactly matches the local configuration.

### 17.6 Immediate next step
The user has said, “let's move ahead,” but has not yet named the next feature or change. Do not assume that an older planned feature (including conversation management or assessment validation) is automatically the next priority. Ask the user which functionality they want to work on next.

Before implementing the next task:
1. Confirm the desired behaviour and acceptance criteria.
2. Inspect the latest working-tree source files relevant to that task; uploaded ZIPs and this context document are not a live connection to the user's local project.
3. Explain the smallest proposed change and affected files.
4. Preserve the three independent learning experiences and all currently working behaviour.
5. Make focused changes, back up affected files, and package a ZIP with a README when delivering a patch.
6. Report exactly which checks were run; do not claim compilation or browser testing unless actually performed/confirmed.

---

## 18. Latest handover note

As of 25 November 2026, the user has manually tested AI K12 Learning, Agentic Learning, and AI Adaptive Learning locally with Ollama after the shared provider/model-selection integration. AI Practice question generation, learner interaction, submission, and feedback in both Agentic and Adaptive were specifically checked and reported to behave as expected, consistent with the previous implementation. Treat this as the current local baseline. The next feature is intentionally unspecified pending the user's direction.
