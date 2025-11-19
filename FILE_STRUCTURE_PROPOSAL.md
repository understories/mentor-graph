# File Structure Cleanup Proposal

## Quick Summary

**Goal**: Organize the project for better maintainability, discoverability, and professional structure.

**Main Changes**:
- Move 12+ documentation files from root → `docs/` (organized by category)
- Move 3 example scripts from root → `examples/basic/`
- Keep existing good structure (`src/`, `pages/`, `scripts/`)
- Clean root level to only essential files

**Impact**: 
- ✅ Cleaner root directory
- ✅ Better documentation organization
- ✅ Clear separation of examples vs production code
- ✅ Easier for new contributors to navigate

---

## Current State Analysis

### Issues Identified
1. **Documentation scattered at root** - 12+ markdown files at root level
2. **Example/test scripts at root** - `createProfile.ts`, `read_example.ts`, `write_example.ts`
3. **No clear documentation organization** - Mix of guides, reports, and specs
4. **Some files may be outdated** - Example scripts might be superseded by actual implementation

### Current Structure
```
mentor-graph/
├── Root level (cluttered)
│   ├── 12+ .md files (documentation)
│   ├── 3 example .ts files
│   ├── package.json, tsconfig.json, etc.
│
├── src/ (well organized)
│   ├── arkiv/ (entity helpers)
│   ├── hooks/ (React hooks)
│   ├── lib/ (utilities like jitsi)
│   ├── styles/ (responsive design tokens)
│   ├── utils/ (touch targets)
│   ├── config.ts
│   └── wallet.ts
│
├── pages/ (Next.js structure)
│   ├── api/ (API routes)
│   ├── _app.tsx, _document.tsx
│   └── index.tsx, me.tsx, network.tsx, profiles.tsx
│
├── scripts/ (seed scripts)
│   ├── seedDummyData.ts
│   └── seedSimple.ts
│
└── tutorial-source-code/ (ignored, reference only)
```

## Proposed Clean Structure

### Root Level (Clean)
```
mentor-graph/
├── README.md                    # Main project documentation
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.js
├── .gitignore
├── .env.example                 # Template for environment variables
│
├── docs/                        # All documentation organized
│   ├── README.md                # Documentation index
│   │
│   ├── guides/                  # How-to guides
│   │   ├── deployment.md        # Vercel deployment guide
│   │   ├── jitsi-integration.md  # Jitsi setup and usage
│   │   └── mobile-optimization.md # Mobile optimization details
│   │
│   ├── architecture/            # Technical documentation
│   │   ├── design.md            # Design philosophy
│   │   ├── spec-compliance.md  # Spec compliance report
│   │   └── arkiv-operations.md  # Arkiv operations documentation
│   │
│   ├── development/            # Development docs
│   │   ├── runbook.md          # Developer experience notes
│   │   ├── rate-limits.md      # Rate limit information
│   │   └── troubleshooting.md  # Deployment troubleshooting
│   │
│   └── reference/              # Reference materials
│       ├── dummy-data.md       # Dummy data for testing
│       └── api-examples.md     # API usage examples
│
├── examples/                    # Example scripts and tutorials
│   ├── README.md                # Examples index
│   ├── basic/                   # Basic Arkiv examples
│   │   ├── create-profile.ts
│   │   ├── read-entity.ts
│   │   └── write-entity.ts
│   └── advanced/                # Advanced examples (if needed)
│
├── scripts/                     # Build and utility scripts
│   ├── seed-dummy-data.ts       # Full dummy data seeding
│   └── seed-simple.ts           # Simple asks/offers seeding
│
├── src/                         # Source code (keep as is)
│   ├── arkiv/                   # Arkiv entity helpers
│   │   ├── asks.ts
│   │   ├── offers.ts
│   │   ├── profiles.ts
│   │   ├── sessions.ts
│   │   ├── feedback.ts
│   │   ├── trustEdges.ts
│   │   ├── subscriptions.ts
│   │   └── client.ts
│   │
│   ├── hooks/                   # React hooks
│   │   └── useTouchFeedback.ts
│   │
│   ├── lib/                     # Library utilities
│   │   └── jitsi.ts
│   │
│   ├── styles/                  # Styling utilities
│   │   └── responsive.ts
│   │
│   ├── utils/                   # General utilities
│   │   └── touchTargets.ts
│   │
│   ├── config.ts                # Configuration
│   └── wallet.ts                # Wallet utilities
│
├── pages/                       # Next.js pages (keep as is)
│   ├── api/                     # API routes
│   │   ├── asks.ts
│   │   ├── offers.ts
│   │   ├── me.ts
│   │   ├── network.ts
│   │   ├── profiles.ts
│   │   ├── subscribe.ts
│   │   └── wallet.ts
│   │
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── me.tsx
│   ├── network.tsx
│   └── profiles.tsx
│
└── public/                      # Static assets (if needed)
    └── (images, fonts, etc.)
```

## File Movement Plan

### Documentation Files → `docs/`

**Root → `docs/guides/`:**
- `VERCEL_DEPLOY.md` → `docs/guides/deployment.md`
- `VERCEL_TROUBLESHOOTING.md` → `docs/development/troubleshooting.md`
- `jitsi.md` → `docs/guides/jitsi-integration.md`
- `MOBILE_OPTIMIZATION_PLAN.md` → `docs/guides/mobile-optimization.md`

**Root → `docs/architecture/`:**
- `design.md` → `docs/architecture/design.md`
- `SPEC_COMPLIANCE_REPORT.md` → `docs/architecture/spec-compliance.md`
- `ARKIV_OPERATIONS.md` → `docs/architecture/arkiv-operations.md`

**Root → `docs/development/`:**
- `runbook.md` → `docs/development/runbook.md`
- `RATE_LIMIT_INFO.md` → `docs/development/rate-limits.md`
- `DEPLOYMENT_FIX.md` → `docs/development/troubleshooting.md` (merge or append)

**Root → `docs/reference/`:**
- `DUMMY_DATA.md` → `docs/reference/dummy-data.md`

**Root → Keep:**
- `README.md` (main project README, stays at root)

### Example Scripts → `examples/`

**Root → `examples/basic/`:**
- `createProfile.ts` → `examples/basic/create-profile.ts`
- `read_example.ts` → `examples/basic/read-entity.ts`
- `write_example.ts` → `examples/basic/write-entity.ts`

### Scripts (Rename for consistency)

**Keep in `scripts/` but rename:**
- `seedDummyData.ts` → `seed-dummy-data.ts` (kebab-case consistency)
- `seedSimple.ts` → `seed-simple.ts` (already correct)

## Benefits of This Structure

### 1. **Clear Separation of Concerns**
- Documentation is organized by purpose (guides, architecture, development)
- Examples are separate from production code
- Scripts are clearly utility/build tools

### 2. **Better Discoverability**
- New developers can find docs in `docs/`
- Examples are clearly marked in `examples/`
- All related files are grouped logically

### 3. **Scalability**
- Easy to add new documentation categories
- Examples can grow without cluttering root
- Scripts can be organized by purpose if needed

### 4. **Professional Structure**
- Follows Next.js and TypeScript best practices
- Aligns with common open-source project patterns
- Makes the project more approachable for contributors

### 5. **Maintainability**
- Clear where to add new documentation
- Easy to find and update related files
- Reduces root-level clutter

## Implementation Steps

### Phase 1: Create Directory Structure
```bash
mkdir -p docs/{guides,architecture,development,reference}
mkdir -p examples/basic
```

### Phase 2: Move Documentation Files
```bash
# Guides
mv VERCEL_DEPLOY.md docs/guides/deployment.md
mv jitsi.md docs/guides/jitsi-integration.md
mv MOBILE_OPTIMIZATION_PLAN.md docs/guides/mobile-optimization.md

# Architecture
mv design.md docs/architecture/design.md
mv SPEC_COMPLIANCE_REPORT.md docs/architecture/spec-compliance.md
mv ARKIV_OPERATIONS.md docs/architecture/arkiv-operations.md

# Development
mv runbook.md docs/development/runbook.md
mv RATE_LIMIT_INFO.md docs/development/rate-limits.md
mv VERCEL_TROUBLESHOOTING.md docs/development/troubleshooting.md
# Optionally merge DEPLOYMENT_FIX.md into troubleshooting.md

# Reference
mv DUMMY_DATA.md docs/reference/dummy-data.md
```

### Phase 3: Move Example Scripts
```bash
mv createProfile.ts examples/basic/create-profile.ts
mv read_example.ts examples/basic/read-entity.ts
mv write_example.ts examples/basic/write-entity.ts
```

### Phase 4: Update References
- Update `README.md`:
  - Line 4: `./docs/runbook.md` → `./docs/development/runbook.md`
  - Line 129: `VERCEL_TROUBLESHOOTING.md` → `docs/development/troubleshooting.md`
- Update `package.json` scripts (if renaming):
  - `scripts/seedDummyData.ts` → `scripts/seed-dummy-data.ts`
- Update any internal documentation links
- Update `.gitignore` if needed (PROGRESS.md location)

### Phase 5: Create Index Files
- `docs/README.md` - Documentation index with navigation
- `examples/README.md` - Examples index with descriptions

### Phase 6: Optional Improvements
- Create `.env.example` template
- Add `CHANGELOG.md` if desired
- Review and potentially remove outdated example scripts

### Phase 7: Verify
- All imports still work
- Documentation links are updated
- No broken references
- Scripts in `package.json` still work
- Test that documentation is accessible

## Notes

- **tutorial-source-code/**: Already in `.gitignore`, can stay as reference
- **Example scripts**: Review if they're still needed or if they're superseded by actual implementation
- **Documentation**: Some files might be merged (e.g., deployment troubleshooting)
- **Naming**: Use kebab-case for files, camelCase for TypeScript modules

## Additional Considerations

### Current References to Update

1. **README.md** already references `./docs/runbook.md` (line 4), but file is at root
   - This suggests the move was planned but not completed
   - Moving to `docs/development/runbook.md` will fix this

2. **README.md** references `VERCEL_TROUBLESHOOTING.md` (line 129)
   - Update to `docs/development/troubleshooting.md`

3. **package.json** scripts reference:
   - `scripts/seedDummyData.ts` → Update to `scripts/seed-dummy-data.ts` if renaming
   - `scripts/seedSimple.ts` → Already correct

4. **Internal documentation links** may need updating after moves

### Files to Review Before Moving

1. **Example scripts** (`createProfile.ts`, `read_example.ts`, `write_example.ts`):
   - Check if they're still useful for learning
   - May be superseded by actual implementation in `src/arkiv/`
   - Consider if they should be kept as learning examples or removed

2. **PROGRESS.md**:
   - Currently in `.gitignore`
   - Development tracking file
   - Consider: Keep in `docs/development/` or remove if no longer needed

3. **DEPLOYMENT_FIX.md**:
   - One-time fix documentation
   - Consider merging into `docs/development/troubleshooting.md`

## Questions to Consider

1. Are the example scripts (`createProfile.ts`, etc.) still useful, or are they superseded by the actual implementation?
2. Should `MOBILE_OPTIMIZATION_PLAN.md` be kept as a detailed plan, or condensed into the main docs?
3. Do we want to keep `PROGRESS.md` or is it just for development tracking?
4. Should we create a `CHANGELOG.md` for version tracking?
5. Should we rename scripts to kebab-case (requires updating `package.json`)?
6. Do we want to create an `.env.example` file as a template?

