# Contributing to ndx

Thank you for your interest in contributing to ndx! This guide will help you get started.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Node.js](https://nodejs.org/) v18+ (for Playwright)

### Getting Started

```bash
git clone https://github.com/because-and/ndx.git
cd ndx
bun install
bun run dev          # Start dev server at localhost:5173
```

### Verify Everything Works

```bash
bun run test         # Unit + integration tests
bun run test:e2e     # E2E browser tests (requires Playwright browsers)
bun run lint         # Lint + format check
bun run build        # Production build
```

## Project Architecture

ndx follows Clean Architecture with strict layer separation:

```
src/domain/    → Pure JS value objects + calculator (no DOM)
src/state/     → Immutable state management (observer pattern)
src/ui/        → Template, styles, differential renderer
src/ndx-calc-element.js → Custom Element entry point
```

**Key constraint:** Domain layer must NEVER import from `ui/` or depend on DOM APIs.

See [docs/architecture.md](docs/architecture.md) for detailed documentation.

## Coding Standards

### Style

- **No TypeScript** — Use JSDoc annotations for type information
- **Biome** handles linting and formatting — run `bun run lint:fix` before committing
- **ES2022+ private class fields** (`#field`) for encapsulation
- **BEM-like CSS naming**: `.ndx__block`, `.ndx__block--modifier`
- **CSS Custom Properties** prefixed with `--ndx-`

### Principles

- **Zero dependencies** — No external runtime dependencies, ever
- **Immutability** — Value objects and state are immutable; methods return new instances
- **Pure functions** — Domain layer has no side effects
- **Shadow DOM isolation** — Styles must not leak in or out

## Making Changes

### Branch Naming

- `feat/description` — New features
- `fix/description` — Bug fixes
- `refactor/description` — Code improvements
- `docs/description` — Documentation updates
- `test/description` — Test additions/improvements

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add stack filter support
fix: correct bulb extrapolation for ND20
refactor: simplify DiffRenderer cache
docs: update CSS API reference
test: add boundary tests for Aperture clamping
```

### Before Submitting a PR

1. **All tests pass**: `bun run test && bun run test:e2e`
2. **Lint passes**: `bun run lint`
3. **Build succeeds**: `bun run build`
4. **No new dependencies added** (unless discussed in an issue first)

## Pull Request Process

1. Fork the repository and create your branch from `main`
2. Make your changes with appropriate tests
3. Ensure all checks pass locally
4. Submit a PR with a clear description of what and why
5. Address any review feedback

## Reporting Issues

- Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template for bugs
- Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template for ideas
- Check existing issues before creating a new one

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
