# Verified production baseline

Owner approval and PR14 merge were explicitly authorized in this chat. PR14 is merged at **c3aba0f47f58c32870bf1e64ebd1a463295dd362**; it was main when Build4 began.

- [Exact-commit main stability checks](https://github.com/3dudes1life/3dudes1Quest_Game/actions/runs/39440122949): completed successfully before implementation began.
- [Exact-commit Pages deployment](https://github.com/3dudes1life/3dudes1Quest_Game/actions/runs/39440136959): completed successfully.
- Production `https://3dudes1quest.com/`: all12 checked HTML/runtime/style/worker/story files matched that commit byte-for-byte. [Hashes](baseline/build4-production-verification.json).
- Isolated desktop/mobile production smoke: genuine movement, jump, attack and switching in all three worlds; merged Survival/outline cache observed. This smoke used direct world navigation, not a continuous campaign claim. [Evidence](baseline/smoke.json).
- Verified remote rollback: `codex/rollback-build3-c3aba0f` points to the exact baseline SHA. It was pushed and checked with `git ls-remote` before implementation.
- Build4 branch: `codex/build4-gameplay-ui-polish`, created from that exact commit after the checks passed.

Build4 is a draft release candidate. It does not merge or deploy itself. Approved artwork, published version3.4.1, story timing and world order are preserved; only the candidate cache revision changes.
