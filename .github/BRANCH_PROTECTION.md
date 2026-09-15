# HealthSphere Enterprise Branch Protection Recommendations

To maintain HIPAA, SOC2, and healthcare data integrity standards, the following GitHub branch protection rules must be configured for the primary branches (`main`, `master`, `develop`).

---

## 1. Protected Branches
- `main` / `master`: Production-ready release branch
- `develop`: Primary integration branch for verified feature merges

---

## 2. Recommended Branch Rulesets

### A. Pull Request Reviews
- **Require a pull request before merging**: Enabled
- **Required approvals**: Minimum **2 approvals** from designated Healthcare Security & Lead Architects.
- **Dismiss stale pull request approvals when new commits are pushed**: Enabled.
- **Require review from Code Owners (`CODEOWNERS`)**: Enabled.
- **Restrict who can dismiss pull request reviews**: Lead Architects only.

### B. Status Checks & Quality Gates
- **Require status checks to pass before merging**: Enabled
- **Require branches to be up to date before merging**: Enabled (strict merge)
- **Mandatory Required Status Checks**:
  1. `Code Hygiene & Type Safety` (`npm run lint`, `npx tsc --noEmit`)
  2. `Comprehensive Healthcare Test Suite` (`npm test -- --run`)
  3. `Production Web Bundle Build` (`npm run build`)
  4. `Security & Vulnerability Audit` (`npm audit --audit-level=high`)
  5. `Trivy Container Vulnerability Scan`

### C. Commit Integrity & Safety
- **Require signed commits**: Enabled (GPG / SSH cryptographic verification).
- **Require linear history**: Enabled (Squash & merge or Rebase & merge).
- **Include administrators**: Enabled (enforces policy on all team members without exceptions).
- **Do not allow bypassing the above settings**: Enabled.
- **Restrict deletions**: Enabled.
- **Block force pushes**: Enabled on `main`, `master`, and `develop`.

---

## 3. Automated Emergency Bypass Protocol
In catastrophic patient-care scenarios where an emergency hotfix must deploy within 5 minutes:
- Incident Commander invokes `.github/workflows/rollback.yml` with authenticated incident ticket ID.
- All actions are permanently written to `server/models/AuditLog.js` and retained for 7 years.
