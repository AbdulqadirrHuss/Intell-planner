# IntelliDay Planner — Claude Instructions

## Git Rules

- Always develop directly on `master`. Never create feature branches.
- To push changes, run `./push.sh` instead of bare `git push`.
  `push.sh` auto-detects the correct proxy port and handles retries.
- Never use `git checkout -b`. Never push to any branch other than `master`.
- Commit messages should be clear and descriptive.

## Branches

Single branch: `master`. No pull requests, no feature branches.
