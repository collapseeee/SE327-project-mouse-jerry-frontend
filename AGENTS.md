# Autonomous Feature-to-PR Protocol & Visual Rules

## 1. Visual Alignment & Theme Rules (Frontend Mandatory)
- **Reference Image Given**: The frontend implementation must strictly adhere to the user's provided screenshot/image (matching layout, palette, typography, button placement, and spacing).
- **No Reference Image Given**: The agent **MUST proactively provide an image**:
  1. Generate a UI visual mockup or extract screenshots from the baseline project.
  2. Present and confirm this visual mockup with the user before finalizing the UI.
- **Strict Theme Colors (NO Arbitrary Hexes)**: Every color used in the frontend MUST be explicitly defined in `@theme` inside `style.css` (e.g. `primary`, `secondary`, `accent-red`, `accent-yellow`, `accent-orange`, `accent-green`, `bg-light`, `text-dark`). **NEVER use arbitrary inline hex classes like `bg-[#...]` or `text-[#...]`**.
- **Dynamic Authentication vs Static Mockups**: Even though reference screenshots show static placeholder usernames like `thainchai`, the navbar and all user profile elements MUST dynamically display the active user from the authentication state (`authStore.isAuthenticated ? authStore.currentUsername : 'Login'`). **NEVER hardcode `thainchai` or any static username in production templates just to match a screenshot image**.
- **Pull Request Visuals**: Every frontend PR description must include confirmation and visual reference of the implemented UI.

## 2. Feature-to-PR Protocol
When implementing any feature or fix:
1. **Branch**:
   - If continuing work on an **existing open PR**: Stay on that branch. **Do not create a new branch**.
   - If starting a **new feature**: `git checkout development && git pull` -> `git checkout -b feature/<name>`
2. **Code & Test**: Write clean code + unit tests (aiming for >80% Statement & Branch coverage).
3. **Validate**:
   - Frontend: `npm run build && npm test`
   - Backend: `./mvnw clean test`
4. **Atomic Commits (DevOps Principle - One Purpose Per Commit)**:
   - Separate commits by purpose; **NEVER bundle unrelated changes into a single bulk commit**:
     - `feat(<scope>): ...` ── Implementation code only.
     - `test(<scope>): ...` ── Unit and integration tests only.
     - `fix(<scope>): ...` ── Bug remediation only.
     - `style(<scope>): ...` ── CSS theme tokens, design polish only.
     - `ci(<scope>): ...` ── GitHub Actions and workflow updates only.
     - `docs(<scope>): ...` ── Documentation and agent skill runbooks only.
   - Each commit must include the trailer: `Co-authored-by: Antigravity Agent <agent@antigravity.google.com>`.
   - Push commits: `git push origin <branch>`.
5. **Pull Request Handling**:
   - If the branch already has an open PR: **Do NOT run `gh pr create`**. Pushing to remote automatically updates the existing PR.
   - If it is a new branch: Open PR targeting `development` with `--label "agent"`, summary, coverage report, and review checklist.
6. **Automated DeepSource & CI Review Iteration (Continuous Quality Gate)**:
   - After pushing commits or opening a PR, the agent **MUST autonomously monitor and iterate until all checks are green**:
     1. **Monitor Commit Status**: Query GitHub Commit Status API (`https://api.github.com/repos/<owner>/<repo>/commits/<sha>/statuses`) and Check Runs (`/commits/<sha>/check-runs`).
     2. **Fetch Review Comments on Failure**: If DeepSource reports `state == "failure"` or posts review comments:
        - Query `GET https://api.github.com/repos/<owner>/<repo>/pulls/<pr_number>/comments`.
        - Filter comments authored by `deepsource-io[bot]`.
        - Extract the reported file `path`, `line`, and issue description (e.g., cyclomatic complexity $> 5$, unexpected function declaration in setup scope, anti-patterns).
     3. **Auto-Remediate Locally**:
        - Refactor the flagged code directly in the local workspace.
        - Decompose complex functions into single-responsibility helpers with cyclomatic complexity $\le 5$.
        - Run local verification: `npm test && npm run build` (Frontend) or `./mvnw clean test` (Backend).
     4. **Push & Verify**: Commit with atomic message (`fix(<scope>): resolve DeepSource <issue>`), push to the PR branch, and poll/wait for DeepSource to rerun.
     5. **Iterate**: Repeat until DeepSource reports `success` (`"Analysis passed: No blocking issues or failing metrics found"`) and SonarQube/SonarCloud Quality Gate is passed.
7. **Human-in-the-Loop Merge Gate**:
   - The agent must **NEVER auto-merge** PRs into `development` or `main`.
   - Once all CI and DeepSource checks are 100% Green, hand over the PR URL to the user to click **Merge** on GitHub.

## 3. Spring Boot Architecture Rules (Backend Mandatory)
- **Strict 5-Tier Layered Architecture**: Every HTTP request flows strictly through:
  `Controller (@RestController)` -> `Service (Interface + @Service Impl)` -> `DAO (Interface + @Repository Impl with @Profile("db"))` -> `Repository (JpaRepository)` -> `Database (@Entity)`
- **No Layer Skipping**: Controllers must NEVER access Repositories or DAOs directly.
- **DTO Isolation via MapStruct**: Never return raw JPA entities from controllers; always map them to DTOs via `LabMapper.INSTANCE`.
- **Dependency Injection**: Always use constructor injection with `@RequiredArgsConstructor` and `private final` fields.
- **Transactions**: Apply `@Transactional` at the Service implementation level for methods performing mutations.
- **Entity Conventions**: Exclude primary keys/IDs from `@EqualsAndHashCode`: `@EqualsAndHashCode.Exclude`.

