# Schema-first inquiry proposal simplification

## Intent and scope

Assume the inquiry-proposal schema is deployed and available before this feature runs. Remove only this feature's old-schema compatibility scaffolding, preserve supported-schema behavior, and publish the updated existing feature PR after approval, implementation, and review.

The user's explicit schema-first contract is an intentional exception to the root AGENTS.md generic old-schema deploy-window compatibility rule. Migrations still ship separately. No migration edits, deployment, merge, billing changes, broad refactoring, or unrelated compatibility removal is authorized.

Never edit, restore, or stage the user's existing `talkadot-api/db/schema.rb` changes (signup_verifications index removal and speaker_searches ai_usage ordering). Use explicit file staging. Do not add comments or AI commit co-authorship.

## Selected approach and evidence

- Delete `ProposalPreparer::REQUIRED_INQUIRY_COLUMNS`, `.schema_ready?`, and its three runtime call gates. `ProposalPreparer#call` retains `eligible?`; notification enrichment retains preparation and self-test guards; generation retains all record/state/replay guards.
- In `MembershipPlanGrant`, validate source without the `has_attribute?` condition and compare `source` directly in `direct_booking_inquiry?`. Preserve `allow_nil: true`: a null source is a legitimate manual grant, not an absent column. Keep optional grantor association plus conditional admin/absence validation and automatic expiry requirements.
- `Membership#active_grant` has no schema scaffolding. Do not change its production implementation. Remove only its synthetic absent-source projection test; normal manual precedence and paid-tier protections remain tested.
- Remove obsolete unavailable-schema specs rather than replacing them with assertions on method absence or introspection implementation details. Existing model, service, job, notification, and concurrency tests already cover supported-schema contracts.
- Correct the existing operating guidance in `talkadot-api/docs/PLAN_SETUP.md`; no standalone feature document is needed.

Inspected evidence: `app/services/booking_inquiries/proposal_preparer.rb`, `notification_sender.rb`, `app/sidekiq/booking_inquiries/proposal_generation_job.rb`, `after_create_job.rb`, `app/models/membership_plan_grant.rb`, `membership.rb`, their focused specs, and `docs/PLAN_SETUP.md` (paths relative to `talkadot-api`). Searches of application grant consumers found no production query intentionally projecting out source; absent-source projections occur in the two compatibility specs. The existing migration `db/migrate/20261019123000_support_direct_inquiry_proposals.rb` supplies linkage, timestamps, source, nullable grantor and source/actor constraint.

## Architecture and data flow

`AfterCreateJob` resolves context, prepares under membership/inquiry locks, dispatches the existing digest pipeline, and sends ordinary notifications with optional speaker-only proposal enrichment. Preparation atomically creates access/draft/sections/linkage; replay uses persisted preparation and enqueue markers. Grant classification determines validation and paid-plan precedence. Removing schema probes changes the deployment prerequisite, not those boundaries or payloads.

Schema PR #6374 (`booking-inquiry-proposal-schema`, supplied head `fe6b7350c`) remains ahead of feature PR #6375 (`booking-inquiry-auto-proposal`, based on schema branch). Deploy the complete schema before feature application code and restart web/workers to refresh schema caches. This plan does not perform that deployment.

## Failure behavior and edge cases

- Unsupported schema is no longer a supported silent no-op path. Do not add replacement probes, rescue clauses specifically for missing columns, feature flags, or fallback attributes.
- Preserve existing general preparation/enrichment error reporting and ordinary inquiry delivery. Unexpected preparation errors remain reported and swallowed by `AfterCreateJob`; enrichment errors remain reported and return an empty enrichment hash. These are business-delivery safeguards, not schema compatibility.
- Preserve dispatch failure propagation after notification, retry settings, enqueue markers, locks, deleted-draft tombstones, missing-record checks, and proposal status guards.
- Preserve self-test/community/search exclusions, seven-day access, later qualifying access after expiry, no automatic proposal sending, and unchanged Stripe billing.
- Source may be null for manual grants; grantor and expiry may be null only as already permitted by grant type. Do not confuse nullable values with missing attributes.
- Accepted existing risks: enqueue crash window and at-least-once notification delivery. Neither is expanded into repair work here.

## Success criteria

1. No `schema_ready?`, `REQUIRED_INQUIRY_COLUMNS`, or source `has_attribute?` compatibility checks remain in this feature; no obsolete tests assert old-schema support.
2. Existing supported-schema access, validation, replay/concurrency, notification, and dispatch-error behavior still passes focused specs.
3. No production change to `Membership` or `AfterCreateJob` is needed; no schema/migration/user-owned edits enter commits.
4. Existing documentation and feature PR describe required schema-first deployment and legitimate null-source manual grants, not old-schema tolerance.
5. Approved changes are committed and pushed to the existing feature branch and PR #6375 synchronized, preserving verified stack navigation. Publishing does not merge or deploy.

## Proposed ordered todos

Actionable records are not created; coordinator materializes these after its single concrete-plan approval.

### 1. Require source on the deployed grant schema

**Plan:** `/home/arch/.pi/agent/plans/talkadot-inquiry-schema-simplification.md`

**Objective/artifact:** Simplified grant model and supported-schema model coverage.

**Dependencies:** None after plan approval.

**Files (relative to talkadot-api):**
- `app/models/membership_plan_grant.rb`: remove the source validation predicate and direct-booking classifier attribute guard.
- `spec/models/membership_plan_grant_spec.rb`: delete the absent-source projection example only; retain ordinary null-source/admin and automatic-source validations.
- `spec/models/membership_spec.rb`: delete the absent-source projection example only; retain manual and paid-tier precedence examples.

**Constraints/references:** Follow current validation/classifier structure in the model. Keep `allow_nil: true`, admin grantor validation, automatic grantor absence, expiry and reason requirements. Read `app/models/membership.rb#active_grant` but do not alter it. No migrations/schema edits, broad refactoring, new comments, or unrelated guard removal. Load testing-strategy before test edits and commit skill before any authorized commit; stage only owned paths.

**Acceptance:** Direct comparison classifies automatic grants; null-source manual grants remain valid with admin and reject missing/non-admin grantors; unknown sources remain invalid; automatic grants remain system-owned and expiring. All supported-schema model examples and paid-tier precedence pass. Only obsolete absent-attribute examples are removed.

**Verification (repository root):**
```sh
./run rspec spec/models/membership_plan_grant_spec.rb spec/models/membership_spec.rb
./run rubocop app/models/membership_plan_grant.rb spec/models/membership_plan_grant_spec.rb spec/models/membership_spec.rb
```
Record command outcomes, exact owned files, commit SHA, and residual risks. Do not migrate or change run mode if the environment fails; report the prerequisite/blocker.

### 2. Remove inquiry schema gates and align deployment guidance

**Plan:** `/home/arch/.pi/agent/plans/talkadot-inquiry-schema-simplification.md`

**Objective/artifact:** Schema-first inquiry pipeline, updated obsolete specs, and corrected existing operating guidance.

**Dependencies:** Todo 1 completed; consume its model verification evidence rather than rerunning unchanged model tests.

**Files (relative to talkadot-api):**
- `app/services/booking_inquiries/proposal_preparer.rb`: delete required-columns constant and schema predicate; gate call only on eligibility.
- `app/services/booking_inquiries/notification_sender.rb`: remove only the schema-ready conjunct from enrichment guard.
- `app/sidekiq/booking_inquiries/proposal_generation_job.rb`: remove early schema gate.
- `spec/services/booking_inquiries/proposal_preparer_spec.rb`: remove missing-column and grant-source/nullable-grantor-schema examples.
- `spec/sidekiq/booking_inquiries/proposal_generation_job_spec.rb`: remove old-schema skip example.
- `spec/sidekiq/booking_inquiries/after_create_job_spec.rb`: remove unavailable-schema delivery example; retain actual preparation-error delivery coverage.
- `docs/PLAN_SETUP.md`: replace old-schema claims with complete schema-first prerequisite, web/worker schema-cache restart guidance, and clarification that existing manual rows have null source on the new schema.

**Read-only references:** `app/sidekiq/booking_inquiries/after_create_job.rb` for existing error behavior; `spec/services/booking_inquiries/notification_sender_spec.rb` for real enrichment safeguards; existing concurrency sections in preparer/generation specs. Do not edit notification specs unless an actual coverage gap caused by this change is demonstrated.

**Constraints:** Preserve every eligibility/state/lock/replay/error/notification guard unrelated to schema introspection, including existing general rescue behavior. Do not change payloads, queues, retry counts, billing, timing, or expiry. No replacement introspection or compatibility abstractions, migration/schema edits, unrelated cleanup, or comments. Load testing-strategy before test edits and commit skill before any authorized commit; explicit owned staging only.

**Acceptance:** No callers or definition of the removed schema predicate/constant remain. Supported-schema draft/access creation and replay/concurrency, enqueue failure/retry behavior, notification-only self-tests, speaker-only enrichment, and ordinary delivery on real preparation/enrichment errors remain passing. Guidance requires all migration fields/constraints before feature deploy and distinguishes null source from absent source.

**Verification (repository root):**
```sh
./run rspec spec/services/booking_inquiries/proposal_preparer_spec.rb spec/services/booking_inquiries/notification_sender_spec.rb spec/sidekiq/booking_inquiries/proposal_generation_job_spec.rb spec/sidekiq/booking_inquiries/after_create_job_spec.rb
./run rubocop app/services/booking_inquiries/proposal_preparer.rb app/services/booking_inquiries/notification_sender.rb app/sidekiq/booking_inquiries/proposal_generation_job.rb spec/services/booking_inquiries/proposal_preparer_spec.rb spec/sidekiq/booking_inquiries/proposal_generation_job_spec.rb spec/sidekiq/booking_inquiries/after_create_job_spec.rb
rg -n 'schema_ready\?|REQUIRED_INQUIRY_COLUMNS|has_attribute\?\(:source\)' talkadot-api/app talkadot-api/spec
```
The final search should return no matches (exit 1 is expected). Inspect docs for lingering old-schema promises. Record outcomes, exact owned files, commit SHA, residual risks. Do not run migrations to resolve a failing prerequisite without coordinator guidance.

## Validation and coordination strategy

Use existing lowest-layer behavior coverage: grant model owns validation/precedence, preparer owns atomic access/draft and concurrency, generation job owns enqueue/replay, notification service owns payload/fallback, and AfterCreateJob retains representative end-to-end wiring/error delivery. Removed examples exclusively assert the deliberately retired old-schema contract. No new test is required merely to assert absent methods; if behavior gaps emerge, use a focused red-green test, not expanded E2E coverage. No browser or external-service invocation is necessary. Planning used read-only inspection, not test execution; test outcomes are pending implementation.

Two sequential cohesive todos avoid cross-file dangling references: grant classification first, then all schema predicate consumers and their specs together. Documentation belongs with the consumer change because it explains the changed operating prerequisite. No generic QA/review/cleanup/publishing todo is proposed: the coordinator owns review, acceptance, and publication stages.

After worker evidence, coordinator performs the sole independent review against starting review base `e824b278f7431286b6ed42b0d4aa7b5a4c51f015`. Code-quality review is findings-only; cleanup requires approval. Create narrowly scoped repair tasks only for concrete findings, at most three repair rounds. Consume successful unchanged checks without duplicate runs; broaden only for failures or uncovered concrete risks. Preserve the user's dirty schema file throughout and verify it is excluded from commits.

For publication, load `create-github-pr` and its required skills, verify current branch/remote and both stack relationships, push approved feature commits, and synchronize existing PR #6375 rather than opening a duplicate. Reconcile old-schema guarantees in PR description with schema-first dependency, preserve accurate #6374 stack navigation, and report actual test evidence. Check related stack text for contradictions and correct relevant owned PR guidance without changing migration code. Do not rebase, force-push, merge, or deploy as an incidental publication step. Recheck remote facts at publication; supplied PR metadata is planning context, not fresh publication verification.

## Assumptions and risks

- Complete migration availability and refreshed schema caches are a user-specified deployment precondition, not verified live here. An old/stale schema can now fail rather than skip automation; existing generic delivery fallbacks remain, but unsupported-schema safety is not promised.
- Null-source manual grants are still supported; partially selected objects lacking source are not a supported new contract. Inspection found no such application consumer.
- Docker is the supplied active run mode; `./run` exposes built-in rspec/rubocop wrappers. Environmental failures should be reported, not worked around by modifying user schema or deployment state.
- No concrete blocker to implementation planning. Only concrete-plan approval remains pending.

## State

- Approved revision: SHA256 `d9999898473c43d5a42a531edb28204de32953a4dace461a1c395e3eae4d8b9a` (all content before State); explicitly approved by user
- Repository: `/home/arch/repos/talkadot`
- Branch: `booking-inquiry-auto-proposal`
- Starting HEAD: `e824b278f7431286b6ed42b0d4aa7b5a4c51f015`
- Review base SHA: `e824b278f7431286b6ed42b0d4aa7b5a4c51f015`
- Ordered todo IDs: TODO-f1bbf0f8, TODO-71b36dda
- Accepted commits: [`ac0c6c52e4709c475655be4feb3ef74eb0d398e1`, `4bf4983c122286751df7549288fd9578bfff596d`] — both exact diffs/branch membership verified; model RSpec 39 examples, 0 failures, 3 existing pending; pipeline RSpec 74 examples, 0 failures; RuboCop 9 files clean; removed-symbol search clean; user schema checksum unchanged
- Current stage: complete — both todos closed and accepted; independent review and code-quality APPROVED delivered HEAD, no findings or cleanup; two commits pushed and PR #6375 description synchronized, title unchanged. Remote head verified 4bf4983c122286751df7549288fd9578bfff596d; body readback exact. User schema checksum unchanged. No merge/deployment performed.
- Review record: `/home/arch/.pi/agent/sessions/--home-arch-repos-talkadot--/2026-10-21T12-49-16-024Z_06d976d8-b588dd27-ce1b8cfa-a018.review.md`
- Repair rounds: 0
- Pending decisions: none
