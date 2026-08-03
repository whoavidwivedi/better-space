<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:bun-rules -->
# Bun Everywhere
Always use `bun` as the package manager and runtime runner for everything in this repository:
- `bun install` / `bun add` / `bun remove`
- `bun run dev`, `bun run build`, `bun run lint`, `bun run typecheck`, `bun run format`
- `bunx` instead of `npx`
<!-- END:bun-rules -->

<!-- BEGIN:ponytail-rules -->
# Ponytail — Lazy Senior Dev Mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:
1. **Does this need to exist at all?** (YAGNI) Speculative need = skip it.
2. **Already in this codebase?** Reuse the helper, util, or pattern already here.
3. **Does the standard library do it?** Use it.
4. **Native platform feature covers it?** Use it (native HTML/CSS over JS libs).
5. **Already-installed dependency solves it?** Use it. Never add unnecessary dependencies.
6. **Can it be one line?** Make it one line.
7. **Only then:** the minimum code that works.

Rules:
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins.
- Never compromise on security, data validation, error handling, or accessibility.
<!-- END:ponytail-rules -->
