import assert from "node:assert/strict";
import test from "node:test";
import { findRestToDayViolations } from "./restBlocksNextDayDay";

test("reports a day shift immediately after rest when enabled", () => {
  assert.deepEqual(findRestToDayViolations([[0, 3, 1, 0]], true), [
    { workerIndex: 0, day: 2, code: "REST_TO_DAY" },
  ]);
});

test("does not report the rule when the team policy is disabled", () => {
  assert.deepEqual(findRestToDayViolations([[3, 1]], false), []);
});
