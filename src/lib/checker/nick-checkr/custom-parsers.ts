import {
  AvailabilityStatus,
  type CheckResult,
} from "@/lib/checker/nick-checkr/abstract-service";

export function getCustomParseResult(
  _serviceName: string,
  _status: number,
  _body: string,
): CheckResult | null {
  return null;
}
