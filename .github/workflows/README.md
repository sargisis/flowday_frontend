# GitHub Actions Workflows

This directory contains CI/CD workflows for the Flowday project.

## Workflows

### `ci.yml`
Main CI workflow that runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **test**: Runs linter, type check, tests, and build
- **build-check**: Verifies production build and uploads artifacts

### `pr-checks.yml`
PR-specific checks that run on pull requests.

**Checks:**
- Lint
- TypeScript type checking
- Tests
- Build verification

## Usage

These workflows run automatically when:
- Code is pushed to `main` or `develop` branches
- Pull requests are opened/updated targeting `main` or `develop`

## Requirements

- Node.js 20.x
- npm (comes with Node.js)

## Status Badge

Add this to your README to show CI status:

```markdown
![CI](https://github.com/yourusername/flowday_frontend/workflows/CI/badge.svg)
```
