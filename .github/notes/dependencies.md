# bun audit

> [!NOTE]
> This file is the canonical record of dependency-audit overrides/exceptions (`bun audit --audit-level high` runs in the pre-push hook on canary). It intentionally exists even when no overrides are required, do not delete it.

> bun audit --level high

## Catalog ranges

Every `catalog` entry uses a caret range, and `.github/scripts/deps-manager.ts` enforces it on `postinstall`:

- An exact version (`1.2.3`), a partial (`4.7`, `5`) or a tilde (`~1.2.3`) is rewritten to a caret, and each change is printed under `[INFO] Normalized catalog ranges to caret`.
- Normalization runs _after_ the auto-move step, so a spec promoted into the catalog from a workspace dep is caught in the same run. That matters because `bun add` writes a workspace dep, and `bun add -E` writes an exact one.
- Anything it cannot convert safely is left untouched and reported under `[INFO] Catalog ranges that are not caret and cannot be converted safely`: compound ranges (`>=4.4.3 <5`), wildcards (`2.x`), and dist-tags (`latest`). Fix those by hand.
- Non-range specs are skipped silently, since a caret is meaningless for them: `workspace:`, `file:`, `link:`, `portal:`, `npm:` aliases, `github:owner/repo`, and git or http URLs.

The rule has **no opt-out**, so no pin survives an install, whatever reason is recorded here. Pinning something deliberately means changing the rule itself in `.github/scripts/deps-manager.ts`, for example adding an allowlist it skips, and writing down why in this file.

## Active overrides

### `postcss` → `^8.5.23`

- **Advisory:** [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) and [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) (high): arbitrary `.map` file read and path traversal via an attacker-controlled `sourceMappingURL` in CSS comments. Affects `postcss <=8.5.11`.
- **Why an override:** a stale `postcss@8.4.31` is pinned transitively (through `@tailwindcss/postcss`, `next`, and `shadcn`) even though the tree already resolves a patched `8.5.x` elsewhere, so only an override forces the old copy up. `8.5.23` is the latest `8.x` and is backward compatible.
- **Risk:** low. `postcss` runs at build time on our own CSS (Tailwind), not on attacker-controlled stylesheets, and `8.x` is API-stable.
- **Exit criteria:** remove the override once every transitive parent depends on `postcss >=8.5.12`.

### `sharp` → `^0.35.3`

- **Advisory:** [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) (high): inherited libvips vulnerabilities (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591). Affects `sharp <0.35.0`.
- **Why an override:** our direct `sharp` (catalog `^0.35.3`) is already patched, but `next` pulls a second, vulnerable `sharp@0.34.5` transitively and `16.2.11` (latest stable) still pins it. The override dedupes the whole tree onto `0.35.3`, the version we already ship.
- **Risk:** low. It converges the transitive copy onto the exact version our own image pipeline (OG rendering, `compress-images.ts`) already uses.
- **Exit criteria:** remove the override once `next` depends on `sharp >=0.35.0`.

## Accepted moderate exposure

Kept as a record so a returning advisory is recognised rather than re-investigated from scratch.

- **`@hono/node-server` `<2.0.5`** ([GHSA-frvp-7c67-39w9](https://github.com/advisories/GHSA-frvp-7c67-39w9), moderate): path traversal in `serve-static` on Windows via encoded backslash (`%5C`). The API server's own copy resolves `2.0.11` (patched); the vulnerable `1.19.15` rides in through `@modelcontextprotocol/sdk`, which `shadcn` (a dev tool) pulls for its docs MCP server. It is never shipped to production, and the advisory is moderate, so `bun audit --audit-level high` (the pre-push gate) stays green.
- **Re-evaluate** when `@modelcontextprotocol/sdk` bumps to `@hono/node-server >=2.0.5`, or if the API ever starts running `serve-static`.
