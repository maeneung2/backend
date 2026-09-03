export type RestBlockViolation = {
  workerIndex: number;
  day: number;
  code: "REST_TO_DAY";
};

/** 비번(3) 다음 날 주간(1) 배정을 금지하는 팀 정책을 검증한다. */
export function findRestToDayViolations(
  schedule: number[][],
  enabled: boolean,
): RestBlockViolation[] {
  if (!enabled) return [];
  const violations: RestBlockViolation[] = [];
  schedule.forEach((plan, workerIndex) => {
    for (let day = 0; day < plan.length - 1; day++) {
      if (plan[day] === 3 && plan[day + 1] === 1)
        violations.push({ workerIndex, day: day + 1, code: "REST_TO_DAY" });
    }
  });
  return violations;
}
