# IntelliDay Planner — Claude Instructions

## Git Rules

- Always develop directly on `main`. Never create feature branches.
- To push changes, run `./push.sh` instead of bare `git push`.
  `push.sh` auto-detects the correct proxy port and handles retries.
- Never use `git checkout -b`. Never push to any branch other than `main`.
- Commit messages should be clear and descriptive.

## Branches

Single branch: `main`. No pull requests, no feature branches.
