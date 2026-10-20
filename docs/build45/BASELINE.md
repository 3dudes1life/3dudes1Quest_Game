# Build 4.5 starting gates

All starting gates passed before implementation:

- PR15 merged at `0ca1a2bc79246a08e567dfc92f28052b611a2c81`, matching the owner-specified baseline and main.
- [Main stability CI](https://github.com/3dudes1life/3dudes1Quest_Game/actions/runs/39460302154) completed successfully.
- [Pages deployment](https://github.com/3dudes1life/3dudes1Quest_Game/actions/runs/39460300440) completed successfully.
- [Sixteen production file hashes](evidence/production.json) match that exact commit, including all entries, release metadata, runtime, viewport, interface, artwork renderer and worker.
- [Production smoke](evidence/production-smoke.json): isolated desktop and touch-emulated contexts, genuine movement/jump/attack/switch in all three worlds. Direct navigation smoke, not a continuous campaign claim.
- Remote rollback `codex/rollback-build4-0ca1a2b` was pushed and verified at that exact commit.
- `codex/build45-cross-platform` was created from the baseline after verification.

This is a review candidate. Build 4.5 is an internal build name; the existing public version3.4.1 is retained and the candidate cache revision is distinct. No merge or deployment is authorized by this branch.
