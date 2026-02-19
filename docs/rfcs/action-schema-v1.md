# RFC: Action Schema v1

- Status: Proposed (target as project default)
- Version: `action-schema/v1`
- Last Updated: 2026-02-19
- Scope: `nextclaw` config UI + config API

## 1. Summary

This RFC defines a **schema-driven action system** for configuration flows.

Goal: eliminate channel/provider-specific frontend branches (for example, custom Feishu-only verify logic) and replace them with a unified, declarative contract:

- `Config Schema` for fields
- `UI Hints` for presentation
- `Action Manifest` for operational actions

With this design, special requirements remain possible, but special implementations are removed.

## 2. Decision

Adopt a single architecture principle:

1. Field rendering is fully schema-driven.
2. Action rendering/execution is fully manifest-driven.
3. Frontend contains no business-channel branching by channel/provider id.
4. Backend executes only registered built-in action handlers.

## 3. Goals

- Remove hardcoded per-channel/per-provider action UI logic.
- Make new actions ship by metadata/config changes, not custom page code.
- Keep action execution auditable, secure, and policy-controlled.
- Preserve clear separation: field config vs operational actions.

## 4. Non-Goals

- No arbitrary remote code execution from action definitions.
- No long-term dual-track compatibility layer for legacy UI action paths.
- No plugin-level custom JavaScript injected into UI runtime.

## 5. Architecture

## 5.1 Three Contracts

1. **Config Schema**
   - Defines field types, validation, defaults.
2. **UI Hints**
   - Defines labels/help/group/order/advanced/sensitive/readOnly.
3. **Action Manifest**
   - Defines action button/flow behavior and backend execution mapping.

## 5.2 Runtime Components

- `Action Registry` (backend): stores action manifests by id and scope.
- `Action Executor` (backend): validates, authorizes, dispatches to built-in handlers.
- `Action Runner` (frontend): generic renderer + trigger/feedback controller.

## 6. Data Model

## 6.1 Action Manifest (normative)

```json
{
  "id": "channels.feishu.verifyConnection",
  "version": "1",
  "scope": "channels.feishu",
  "title": "Verify Connection",
  "description": "Check whether Feishu credentials are valid and bot is reachable.",
  "type": "httpProbe",
  "trigger": "manual",
  "requires": [
    "channels.feishu.appId",
    "channels.feishu.appSecret"
  ],
  "request": {
    "method": "POST",
    "path": "/api/channels/feishu/probe",
    "body": {
      "appId": "$channels.feishu.appId",
      "appSecret": "$channels.feishu.appSecret"
    },
    "timeoutMs": 12000
  },
  "success": {
    "when": "response.ok == true",
    "message": "Feishu connection verified"
  },
  "failure": {
    "message": "Feishu verification failed"
  },
  "resultMap": {
    "channels.feishu.status.botName": "response.data.botName",
    "channels.feishu.status.botOpenId": "response.data.botOpenId"
  },
  "policy": {
    "roles": ["admin"],
    "rateLimitKey": "channels.feishu.verifyConnection",
    "cooldownMs": 5000,
    "audit": true
  }
}
```

## 6.2 Required Fields

- `id`: globally unique action id.
- `version`: manifest version, starts at `1`.
- `scope`: config path prefix this action belongs to.
- `type`: one of built-in action handler types.
- `trigger`: `manual` or `afterSave`.
- `request`: transport + payload mapping.
- `policy`: execution control + audit requirements.

## 6.3 Built-in Action Types (v1)

- `httpProbe`: call internal endpoint and evaluate success.
- `oauthStart`: request OAuth start URL and open/redirect.
- `webhookVerify`: send verification payload/challenge.
- `openUrl`: open official setup/documentation url.
- `copyToken`: retrieve short-lived token and copy/show once.

All action types must be implemented as backend built-in handlers.

## 7. API Contract

## 7.1 Schema Read API

`GET /api/config/schema`

Response must include:

- `schema`
- `uiHints`
- `actions` (new)
- `version`
- `generatedAt`

## 7.2 Execute API

`POST /api/config/actions/:id/execute`

Request:

```json
{
  "scope": "channels.feishu",
  "draftConfig": {
    "channels": {
      "feishu": {
        "appId": "cli_xxx",
        "appSecret": "sec_xxx"
      }
    }
  },
  "context": {
    "actor": "admin",
    "traceId": "trace-123"
  }
}
```

Response:

```json
{
  "ok": true,
  "status": "success",
  "message": "Feishu connection verified",
  "data": {
    "botName": "nextclaw-bot",
    "botOpenId": "ou_xxx"
  },
  "patch": {
    "channels": {
      "feishu": {
        "status": {
          "botName": "nextclaw-bot",
          "botOpenId": "ou_xxx"
        }
      }
    }
  },
  "nextActions": []
}
```

## 7.3 Error Codes (v1)

- `ACTION_NOT_FOUND`
- `ACTION_SCOPE_MISMATCH`
- `ACTION_FORBIDDEN`
- `ACTION_PRECONDITION_FAILED`
- `ACTION_RATE_LIMITED`
- `ACTION_TIMEOUT`
- `ACTION_EXECUTION_FAILED`
- `ACTION_RESULT_INVALID`

## 8. Frontend Requirements

- Render actions only from `actions` contract.
- Evaluate `requires` before trigger; show disabled state + reason.
- Support `manual` and `afterSave` triggers.
- Show consistent running/success/failure feedback.
- Apply `patch` from execute response in a generic way.

No frontend module may hardcode action behavior by channel/provider name.

## 9. Backend Requirements

- Validate action manifest structure at startup.
- Validate request payload + preconditions at runtime.
- Enforce policy (auth, cooldown, rate limit, audit).
- Execute only built-in handlers.
- Return normalized response envelope.

## 10. Security and Compliance

- Never expose sensitive fields in action responses unless explicitly allowed.
- Redact secrets in logs and audit payloads.
- Use short timeouts and bounded retries.
- Require role checks for operational actions.

## 11. Compatibility Policy

To align with project rule `avoid-stack-bloat-and-unnecessary-legacy-compat`:

- Do not maintain long-term dual implementations (legacy custom action logic + manifest logic).
- Legacy path, if temporarily needed for migration, must have a strict removal deadline.
- Compatibility exceptions are allowed only when critical (core user impact, compliance, production stability).

## 12. Rollout Plan

1. Introduce `actions` in schema API and backend action executor.
2. Build frontend generic `Action Runner` and wire it to channel/provider forms.
3. Migrate Feishu verify flow to manifest.
4. Remove old hardcoded action branches.
5. Enforce lint/code review guardrail: no channel/provider branching for actions.

## 13. Acceptance Criteria

- A new channel action can be shipped by adding/updating manifest + built-in handler registration.
- Frontend action UI requires no channel/provider-specific code change.
- Existing migrated action flow (Feishu verify) works via generic runner only.
- No long-term legacy action path remains enabled.

## 14. Future Extensions (non-blocking)

- Expression DSL hardening (`when`/`requires` grammar standardization).
- Action chaining with transactional semantics.
- Dry-run mode for preflight checks.
- Signed remote action manifests (if plugin ecosystem needs it).
