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
4. **Local Verification**: Run local verification before committing:
   ```bash
   npm run build
   npm test
   ```
5. Verify that:
   - Build completes with zero TypeScript or Vite errors.
   - All Vitest test suites pass with 100% success rate.
   - Statement and Branch coverage metrics meet the quality gate standard (>80%).
   - If any test or build fails, fix the code immediately before proceeding.

### Step 3: Atomic Commits & Remote Push (DevOps Principle)
1. **Enforce Atomic Commits (One Purpose Per Commit)**:
   - **Never bulk commit unrelated files together (`git add .`)**. Stage and commit files by individual concern:
     - **Component / Feature Implementation**:
       ```bash
       git add src/components/<Component>.vue src/views/<View>.vue
       git commit -m "feat(<scope>): <description of feature>" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Unit / Coverage Tests**:
       ```bash
       git add src/**/__tests__/<Test>.spec.ts
       git commit -m "test(<scope>): add unit and branch coverage tests" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Styling / Theme Tokens**:
       ```bash
       git add src/assets/style.css
       git commit -m "style(<scope>): update tailwind theme tokens" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **Bug Fixes**:
       ```bash
       git add <fixed-file>
       git commit -m "fix(<scope>): <description of bugfix>" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
     - **CI Workflows or Tooling**:
       ```bash
       git add .github/workflows/<file>.yml
       git commit -m "ci: <description of workflow update>" -m "Co-authored-by: Antigravity Agent <agent@antigravity.google.com>"
       ```
2. **Push the Branch**:
   ```bash
   git push -u origin <branch-name>
   ```

### Step 4: Pull Request Handling (No Duplicate PRs)
1. **If updating an EXISTING open PR**:
   - Pushing the branch in Step 3 **automatically updates the existing PR on GitHub**.
   - **DO NOT run `gh pr create`**.
   - Output the existing PR link confirming new commits were pushed.
2. **If creating a NEW Pull Request**:
   - Write the formatted markdown description to a temporary file `pr_body.md`:
     ```bash
     cat << 'EOF' > pr_body.md
     ## 📌 Summary of Changes
     - Detailed description of what feature was implemented and key components touched.

     ## 🖼️ Visual Alignment & Verification
     - Confirmation of adherence to the reference screenshot (or attached visual preview/mockup).

     ## 🧪 Test Coverage & Metrics
     - **Statement Coverage**: X%
     - **Branch Coverage**: X%
     - All Vitest test suites passing (`npm test`).

     ## ✅ Review Checklist
     - [ ] UI visually matches the reference image.
     - [ ] Unit & branch tests pass cleanly.
     - [ ] Ready to merge into `development`.
     EOF
     ```
   - Create the Pull Request targeting `development` with the `agent` label using GitHub CLI (`gh`):
     ```bash
     gh pr create --base development --head feature/<short-descriptive-kebab-name> --label "agent" --title "feat(<scope>): <Title>" --body-file pr_body.md
     rm pr_body.md
     ```
     *(If `gh` CLI is not installed or authenticated, provide the direct GitHub PR URL output by git push)*

### Step 5: Review Gate (STOP)
- Output the created Pull Request URL clearly to the user.
- **DO NOT** auto-merge the PR into `development`.
- Halt execution and prompt the user to conduct human code review on GitHub.
