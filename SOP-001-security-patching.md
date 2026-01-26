# Standard Operating Procedure (SOP-001)

## Security Vulnerability Patching Process

**Document ID:** SOP-001  
**Version:** 1.0  
**Effective Date:** 2026-01-26  
**Review Date:** 2026-07-26  
**Owner:** Security Team

---

## Purpose

Define the standard process for identifying, assessing, and patching security vulnerabilities in the SOLFUNMEME production environment.

---

## Scope

This SOP applies to:
- All npm/node dependencies
- Production and staging environments
- All branches deployed to Vercel

---

## Procedure

### 1. Vulnerability Detection

**Frequency:** Weekly (automated) + On-demand

```bash
cd /path/to/solfunmeme
git checkout feature/v1
npm audit
```

**Severity Levels:**
- Critical: Immediate action (within 24 hours)
- High: Urgent action (within 7 days)
- Moderate: Scheduled action (within 30 days)
- Low: Next maintenance window

---

### 2. Create Change Request

**For High/Critical vulnerabilities:**

1. Create CRQ document:
   ```bash
   cp CRQ-TEMPLATE.md CRQ-XXX-description.md
   ```

2. Document:
   - Affected systems
   - Vulnerability details (CVE, severity)
   - Proposed resolution
   - Risk assessment
   - Testing plan

3. Get approval from:
   - Technical Lead
   - Security Officer (for Critical)

---

### 3. Create Security Branch

```bash
git checkout feature/v1
git pull origin feature/v1
git checkout -b security/patch-crq-XXX
```

**Branch naming:** `security/patch-crq-XXX`

---

### 4. Apply Patches

```bash
# Run automatic fixes
npm audit fix

# Check remaining issues
npm audit

# Apply force fixes if needed (review breaking changes)
npm audit fix --force

# Verify all resolved
npm audit
```

**Expected output:** `found 0 vulnerabilities`

---

### 5. Testing

**Required tests:**

```bash
# 1. Build test
npm run build

# 2. Verify output
# - Check for errors
# - Verify all pages generated
# - Note any warnings

# 3. Local runtime test (optional)
npm run dev
# Test critical paths:
# - Homepage loads
# - Wallet connection works
# - Navigation functional
```

**Acceptance Criteria:**
- ✅ Build completes successfully
- ✅ No new errors introduced
- ✅ All pages generate
- ✅ 0 vulnerabilities remaining

---

### 6. Commit Changes

```bash
git add package.json package-lock.json
git commit -m "security: [CRQ-XXX] brief description

- List vulnerabilities fixed
- Note version updates
- Reference CVEs
- Confirm testing completed"
```

**Commit message format:**
- Prefix: `security:`
- Include CRQ reference
- List all CVEs addressed
- Confirm testing

---

### 7. Code Review

**Required reviewers:** 1 (Technical Lead for High/Critical)

**Review checklist:**
- [ ] CRQ document complete
- [ ] All vulnerabilities addressed
- [ ] Build test passed
- [ ] No breaking changes
- [ ] Commit message follows format
- [ ] package-lock.json updated

---

### 8. Deployment

```bash
# Push to remote
git push origin security/patch-crq-XXX

# Create PR to feature/v1
# Title: "[CRQ-XXX] Security Patch: Brief Description"
# Link CRQ document in PR description

# After approval, merge to feature/v1
git checkout feature/v1
git merge security/patch-crq-XXX
git push origin feature/v1
```

**Vercel auto-deploys on push to feature/v1**

---

### 9. Post-Deployment Verification

**Within 15 minutes:**
```bash
# Check deployment status
curl -I https://www.solfunmeme.com

# Verify site loads
curl -s https://www.solfunmeme.com | grep -i "solfunmeme"
```

**Within 24 hours:**
- Monitor Vercel logs for errors
- Check user reports
- Verify wallet functionality
- Document completion in CRQ

---

### 10. Documentation

Update CRQ with:
- Deployment timestamp
- Verification results
- Any issues encountered
- Final approval signatures

Archive CRQ in `/docs/crq/` directory.

---

## Emergency Rollback

**If critical issues detected:**

```bash
# Option 1: Revert commit
git revert <commit-hash>
git push origin feature/v1

# Option 2: Rollback in Vercel dashboard
# Deployments → Select previous deployment → Promote to Production
```

**Notify:**
- Technical Lead
- Security Team
- Stakeholders

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Security Team | Identify vulnerabilities, create CRQs |
| Developer | Apply patches, test, commit |
| Technical Lead | Review, approve, deploy |
| Security Officer | Approve Critical patches |

---

## Tools Required

- Git
- Node.js 20+
- npm
- Access to Vercel dashboard
- Access to GitHub repository

---

## Related Documents

- CRQ-TEMPLATE.md
- SECURITY_POLICY.md
- DEPLOYMENT.md

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-26 | Initial version | Security Team |
