# Coding principles

## 1. Understand first

- Read the task and the code it touches; trace the real flow before choosing a fix. A small diff in the wrong place is a second bug.
- Check what the change could break for users: data it could destroy or expose, callers that stop working.
- State assumptions that change the approach. Proceed if the choice is safe and reversible; ask if it affects correctness, scope, or risk.
- Name a simpler alternative when one exists; push back when warranted.

## 2. Smallest complete change

- Build only what was asked: no extra features, options, abstractions, wrappers, type conversions, or handling for impossible cases.
- Reuse in order: a helper, type, or pattern already in the repo, used the way neighbouring code uses it; then the standard library or platform; then an installed dependency. The project's own wrapper beats a standard or native one. Never add a dependency for a few lines.
- Shortest diff wins only once you know everything it must reach. Between equal-size options, take the one correct on edge cases; a one-liner that needs decoding is not simpler.
- Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, or anything requested. Moved or merged code keeps its validation and error handling.

## 3. Reach everything, touch nothing else

- Before editing, list every place the change must reach (callers, tests, fixtures, types, config, exports) and finish all of them; the change is not done until it typechecks.
- Bug fix: find every caller, fix the root cause once in shared code.
- Match existing style and structure. No unrelated refactors, formatting, or comment edits.
- Remove imports and code your change made unused; leave pre-existing dead code, mention it if relevant.
