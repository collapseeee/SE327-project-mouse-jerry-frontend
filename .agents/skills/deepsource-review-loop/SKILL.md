---
name: deepsource-review-loop
description: >-
  Autonomous review, remediation, and thread-resolution runbook for DeepSource static analysis and PR checks.
  Activate this skill whenever a pull request is created or updated, when creating or modifying features,
  when DeepSource reports failures, anti-patterns, or cyclomatic complexity issues,
  or when DeepSource review comments are posted on a GitHub PR that need to be resolved.
---

# DeepSource Review Loop & Quality Gate Runbook

This skill defines the autonomous procedure for monitoring DeepSource analysis, ingesting review comments, remediating code issues locally, re-verifying, pushing fixes, and resolving GitHub PR review threads.

## When to Use This Skill

- When creating or modifying a feature/bugfix and preparing to merge a Pull Request.
- When DeepSource status reports `failure` on a PR commit.
- When `deepsource-io[bot]` leaves review comments on a GitHub PR.
- When verifying that a PR meets the project's Grade A / 0 blocking issues Quality Gate.

---

## Autonomous Step-by-Step Execution

### Step 1: Monitor DeepSource Commit Status

Query GitHub's Commit Status API for the latest commit SHA:

```powershell
curl.exe -s "https://api.github.com/repos/<owner>/<repo>/commits/<sha>/statuses" | ConvertFrom-Json | Select-Object context, state, description, target_url
```

- If `state == "success"`, DeepSource passed with zero blocking issues.
- If `state == "pending"`, wait 20-30 seconds using `schedule` and check again.
- If `state == "failure"`, proceed to **Step 2**.

---

### Step 2: Ingest DeepSource Review Comments from GitHub PR

Query the PR review comments API:

```powershell
curl.exe -s "https://api.github.com/repos/<owner>/<repo>/pulls/<pr_number>/comments" | ConvertFrom-Json | Where-Object { $_.user.login -eq "deepsource-io[bot]" } | Select-Object path, line, body
```

Extract the affected file `path`, `line`, rule ID, and message (e.g. cyclomatic complexity, arrow functions, anti-patterns).

Alternatively, if DeepSource run URL is provided in the status `target_url`, fetch the run details directly to identify remaining blocking issues.

---

### Step 3: Local Remediation Patterns

Apply standard clean-code patterns based on the flagged issue:

| DeepSource Rule | Symptom | Remediation Pattern |
| :--- | :--- | :--- |
| **`JS-R1005`** | Cyclomatic complexity $> 5$ | Decompose function into small, single-responsibility helper functions with complexity $\le 4$. Extract typed predicate helpers (`isRecord`, `isNonEmptyString`). |
| **`JS-0067`** | Unexpected function declaration in setup/global scope | Convert top-level `function foo() {}` to arrow function `const foo = () => {}`. |
| **`JS-0339`** | Non-null assertion operator `!` | Replace with defensive conditional check: `if (elem) await elem.trigger(...)`. |
| **`JS-0323`** | `as any` type casting | Use typed assertions: `as unknown as ReturnType<typeof ...>` or exact interfaces. |
| **`JS-0066`** | Double negation `!!` | Use explicit boolean conversion: `Boolean(val)`. |
| **`JS-0116`** | `async` function has no `await` | Remove `async` on synchronous tests or return `Promise.resolve(...)` in mocks. |
| **`JS-C1003`** | Wildcard import `import * as` | Use named imports with `vi.mock` and `vi.mocked(...)`. |
| **`JS-0295`** | `@ts-ignore` missing explanation | Add $\ge 3$ character descriptive comment: `// @ts-ignore: vitest config augmentation`. |
| **`JS-C1002`** | Identifier name too short | Rename 1-letter variables (e.g. `q` $\rightarrow$ `queryParam`). |

---

### Step 4: Verify Local Quality Gates (Shift-Left)

Before pushing, verify that all local checks pass:

- **Frontend**:
  ```powershell
  npm test
  npm run build
  ```
  Ensure all unit tests pass with >80% coverage and `vue-tsc -b` produces 0 type errors.

- **Backend**:
  ```powershell
  ./mvnw clean test
  ```
  Ensure all Spring Boot context and unit tests pass.

---

### Step 5: Atomic Commit & Push

Commit changes with single-concern message and co-author tag:

```powershell
git add -A
git commit -m "fix(<scope>): resolve DeepSource <issue>`n`nCo-authored-by: Antigravity Agent <agent@antigravity.google.com>"
git push origin <branch>
```

---

### Step 6: Verify DeepSource Re-Run

Wait 30-45 seconds for DeepSource to analyze the new commit. Verify that the commit status transitions to:

```
context: DeepSource: JavaScript (or Java/SQL)
state: success
description: Analysis passed: No blocking issues or failing metrics found
```

If issues remain, repeat Steps 2-5.

---

### Step 7: Automatically Resolve PR Review Threads

Once the fix is verified and DeepSource reports `success`, resolve all open review comment threads using the helper script:

```powershell
powershell.exe -File ".agents/skills/deepsource-review-loop/scripts/resolve-threads.ps1" -Owner "<owner>" -Repo "<repo>" -PrNumber <pr_number>
```

The script queries all unresolved review threads on GitHub via GraphQL and executes `resolveReviewThread` mutations for each thread.

---

### Step 8: Human-in-the-Loop Merge Gate

- The agent must **NEVER auto-merge** PRs into `development` or `main`.
- Once all review threads are marked **Resolved**, DeepSource is **Green**, and SonarQube Quality Gate is passed, hand over the PR URL to the user to click **Merge** on GitHub.
