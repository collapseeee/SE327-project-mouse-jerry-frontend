---
name: feature-pr
description: >-
  Autonomous Feature-to-PR Protocol for the Vue Frontend. Use this skill whenever the user requests implementing, enhancing, or fixing a frontend feature (e.g., "Implement feature: ...", "Fix bug: ..."). Guides creating a semantic feature branch off development, writing Vue 3 + TypeScript code with Vitest tests, strictly following reference images (or providing an image mockup if none was given), verifying build and test coverage, committing, pushing, and creating a Pull Request on GitHub for human review.
---

# Autonomous Feature-to-PR Protocol (Frontend)

This skill guides the automated end-to-end lifecycle of implementing a feature or bugfix in `se327-mouse-jerry-frontend`, adhering to the SE327 Git Workflow, Quality Gate, and Visual Alignment standards.

## Workflow Steps

### Step 1: Branch Preparation & Existing PR Detection
1. Ensure the working directory is `se327-mouse-jerry-frontend`.
2. Check git status to ensure working directory is clean.
3. **Check for Existing Open PR**:
   - If the user is requesting changes, fixes, or review feedback on an **already open PR**:
     - **DO NOT create a new branch or a new PR**.
     - Stay on the current PR feature branch (e.g. `fix/navbar-search-input-label`).
     - Proceed directly to Step 2 (Implementation & Testing).
   - If starting a **NEW feature or bugfix**:
     - Switch to `development` and pull latest changes:
       ```bash
       git checkout development
       git pull origin development
       ```
     - Create and checkout a semantic feature branch off `development`:
       ```bash
       git checkout -b feature/<short-descriptive-kebab-name>
       # Or for bugfixes: git checkout -b fix/<short-descriptive-kebab-name>
       ```

### Step 2: Implementation, Visual Alignment & Testing
1. **🎨 Visual Design & UI Alignment (STRICT REQUIREMENT)**:
   - **When a Reference Image is Provided**: The frontend implementation must strictly follow the reference image/screenshot provided by the user (exact layout, theme color scheme, typography, button placement, icons, and card proportions).
   - **When No Reference Image is Provided**:
     - The agent **MUST proactively provide an image**:
       1. Generate a UI visual mockup (or pull reference screenshots from the baseline project).
       2. Present this visual image/mockup to the user for visual confirmation before finalizing implementation.
2. **🎨 Strict Theme Colors (NO Arbitrary Hexes)**: Every color used in components MUST exist in `@theme` inside `style.css` (e.g. `primary`, `secondary`, `accent-red`, `accent-yellow`, `accent-orange`, `accent-green`, `bg-light`, `text-dark`). **NEVER use arbitrary inline hex classes like `bg-[#...]` or `text-[#...]`**.
3. **👤 Dynamic Authentication Over Static Mockups**: Even though reference screenshots show static placeholder usernames like `thainchai`, navbar and user profile components MUST dynamically display the active user from the authentication store (`authStore.isAuthenticated ? authStore.currentUsername : 'Login'`). **NEVER hardcode `thainchai` or any static username in production templates just to match a screenshot image**.
4. **Clean Implementation**: Implement the requested Vue 3 / TypeScript components, views, or Pinia stores adhering strictly to Tailwind CSS theme tokens.
5. **Mandatory Test Coverage**: Always write corresponding Vitest unit tests in `__tests__/` with `@vue/test-utils` to maintain high **Statement and Branch coverage** (required by SE327 Software Metrics rubric).
6. **Local Verification**: Run local verification before committing:
   ```bash
   npm run build
   npm test
   ```
7. Verify that:
   - Build completes with zero TypeScript or Vite errors.
   - All Vitest test suites pass with 100% success rate.
   - Statement and Branch coverage metrics meet the quality gate standard (>80%).
   - If any test or build fails, fix the code immediately before proceeding.

### Step 3: Atomic Commits & Remote Push (DevOps Principle)
1. **DevOps Atomic Commit Principle (One Logical Purpose Per Commit)**:
   - **What is an Atomic Commit?** An atomic commit represents a single, indivisible, self-contained unit of change that builds cleanly, passes tests, and can be independently reviewed, reverted, or cherry-picked without breaking the repository.
   - **Strict Prohibition on Bulk Commits**: **NEVER run `git add .` or `git add -A`** when multiple layers or concerns are modified. Staging all modified files in a single pass violates the atomic commit principle.
   - **Strict Concern Separation**: Implementation code (`feat`), test suites (`test`), CSS styling/tokens (`style`), and bugfixes (`fix`) MUST NEVER be bundled together into a single commit. Always isolate them into separate, ordered atomic commits:
     - **Layer 1: Types & API Services**:
       ```bash
       git add src/types/* src/services/*
       git commit -m "feat(<scope>): define data models and API client service" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 2: State Management (Pinia Stores)**:
       ```bash
       git add src/stores/*
       git commit -m "feat(<scope>): implement reactive Pinia store and actions" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 3: UI Components & Views**:
       ```bash
       git add src/components/<Component>.vue src/views/<View>.vue src/router/*
       git commit -m "feat(<scope>): implement views and components matching visual design" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 4: Styling & Theme Tokens**:
       ```bash
       git add src/assets/style.css
       git commit -m "style(<scope>): update tailwind theme tokens and layout styles" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 5: Unit & Branch Coverage Tests**:
       ```bash
       git add src/**/__tests__/<Test>.spec.ts
       git commit -m "test(<scope>): add unit and branch coverage tests" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 6: Bug Fixes & Code Smells**:
       ```bash
       git add <fixed-file>
       git commit -m "fix(<scope>): <description of bugfix or remediation>" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 7: CI Workflows & Tooling**:
       ```bash
       git add .github/workflows/<file>.yml
       git commit -m "ci(<scope>): update continuous integration workflow" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Layer 8: Documentation & Agent Skills**:
       ```bash
       git add *.md .agents/skills/*
       git commit -m "docs(<scope>): update documentation and agent skill runbooks" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```

2. **Conventional Commit Message Standard**:
   - Every commit message MUST adhere to the following structure:
     ```
     <type>(<scope>): <short imperative subject line>

     [optional body explaining rationale and detailing changes]
     - Detail 1: ...
     - Detail 2: ...

     Co-authored-by: Antigravity Agent <agent@antigravity.google.com>
     ```
   - **Allowed Types**: `feat`, `fix`, `test`, `style`, `refactor`, `perf`, `docs`, `chore`, `ci`.
   - **Scope**: Lowercase module/feature identifier (e.g., `cart`, `catalog`, `auth`, `navbar`, `admin`, `skills`).
   - **Subject Line**: Imperative mood, lowercase, no trailing period, concise (< 72 characters).
   - **Mandatory Co-Author Trailer**: Every commit MUST include the trailer:
     `Co-authored-by: Antigravity Agent <agent@antigravity.google.com>`

3. **Push the Branch**:
   ```bash
   git push -u origin <branch-name>
   ```

### Step 4: Pull Request Handling (Strict Template Compliance)
1. **If updating an EXISTING open PR**:
   - Pushing the branch in Step 3 **automatically updates the existing PR on GitHub**.
   - **DO NOT run `gh pr create`**.
   - Output the existing PR link confirming new commits were pushed.
2. **If creating a NEW Pull Request**:
   - **Strict Adherence to Repository PR Template**: When generating the PR description, **NEVER bypass or alter** the sections defined in `.github/pull_request_template.md`. You MUST fill out every single section thoroughly:
     - `## Summary`: Explain what changes were made, architectural motivation, and link related issues (e.g., `Closes #123`).
     - `## Changes`: Comprehensive bulleted list of all changes across components, stores, services, and tests.
     - `## How it was tested`: Full breakdown of Vitest test suites, Statement & Branch coverage metrics, and build status.
     - `## Checklist`: Complete all checklist items from `.github/pull_request_template.md`.
     - `## Visual Alignment`: Reference screenshot comparison or visual preview confirming UI alignment.
   - Write the formatted markdown description to a temporary file `pr_body.md`:
     ```bash
     cat << 'EOF' > pr_body.md
     ## Summary
     Comprehensive implementation of <feature-name> according to visual design and business logic requirements.
     Closes #<issue-number>

     ## Changes
     - **Services & Models**: Added `<Service>.ts` and data transfer interfaces.
     - **State Management**: Implemented Pinia store `<Store>.ts` for reactive state handling.
     - **Components & Views**: Created `<Component>.vue` and `<View>.vue` adhering to Tailwind CSS theme tokens.
     - **Testing**: Added comprehensive Vitest unit and branch coverage tests in `<Test>.spec.ts`.

     ## How it was tested
     - **Build**: `npm run build` passed with zero TypeScript and Vite compiler errors.
     - **Unit Tests**: `npm test` passed with 100% success rate across all test suites.
     - **Coverage Metrics**:
       - Statement Coverage: XX.X%
       - Branch Coverage: XX.X%
       - Function Coverage: XX.X%
       - Line Coverage: XX.X%

     ## Visual Alignment
     - Visual design strictly matches the provided reference screenshot (layout, theme palette, typography, button placement, and dynamic auth state).

     ## Checklist
     - [x] Branch is up to date with `main`/`development` and the build is green
     - [x] Tests added or updated for new behavior
     - [x] SonarCloud / DeepSource quality gate passes
     - [ ] Reviewed by the other team member
     EOF
     ```
   - Create the Pull Request targeting `development` with the `agent` label using GitHub CLI (`gh`):
     ```bash
     branch=$(git branch --show-current)
     case "$branch" in
       feature/*) pr_type=feat ;;
       fix/*)     pr_type=fix ;;
       *)         pr_type=chore ;;
     esac
     gh pr create --base development --head "$branch" --label "agent" --title "${pr_type}(<scope>): <Title>" --body-file pr_body.md
     rm pr_body.md
     ```
     *(If `gh` CLI is not installed or authenticated, provide the direct GitHub PR URL output by git push)*

### Step 5: Review Gate (STOP)
- Output the created Pull Request URL clearly to the user.
- **DO NOT** auto-merge the PR into `development`.
- Halt execution and prompt the user to conduct human code review on GitHub.
