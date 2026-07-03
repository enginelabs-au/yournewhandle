import { detectBlockedResponse } from "@/lib/checker/nick-checkr/blocked-detection";
import { getCustomParseResult } from "@/lib/checker/nick-checkr/custom-parsers";

export enum AvailabilityStatus {
  Available = 'AVAILABLE',
  Error = 'ERROR',
  Taken = 'TAKEN',
  Timeout = 'TIMEOUT',
}

export interface CheckResult {
  status: AvailabilityStatus;
  errorDetail?: string;
}

export enum CheckMethod {
  Standard = 'STANDARD',
  BodyMatch = 'BODY_MATCH',
  NotFoundBodyMatch = 'NOT_FOUND_BODY_MATCH',
  InvertedBodyMatch = 'INVERTED_BODY_MATCH',
  JsonEmptyArray = 'JSON_EMPTY_ARRAY',
  DNS = 'DNS',
}

export interface ServiceDefinition {
  name: string;
  url: string;
  category: string;
  checkMethod: CheckMethod;
  bodyMatch?: string | null;
  testAvailableNick?: string;
  testTakenNick?: string;
}

export interface HttpResponse {
  status: number;
  body: string;
}

export type HttpClient = (url: string) => Promise<HttpResponse>;

const BODY_MATCH_METHODS = new Set<CheckMethod>([
  CheckMethod.BodyMatch,
  CheckMethod.NotFoundBodyMatch,
  CheckMethod.InvertedBodyMatch,
]);

export class AbstractService implements ServiceDefinition {
  constructor(
    private readonly httpClient: HttpClient,
    readonly name: string,
    readonly url: string,
    readonly category: string,
    readonly checkMethod: CheckMethod,
    readonly bodyMatch?: string | null,
  ) {
    if (BODY_MATCH_METHODS.has(checkMethod) && typeof bodyMatch !== 'string') {
      throw new Error(
        `bodyMatch is required for checkMethod "${checkMethod}" on service "${name}"`,
      );
    }
  }

  async check(nick: string): Promise<CheckResult> {
    const url = this.url.replace('{}', nick);

    try {
      const response = await this.httpClient(url);
      return this.parseResponse(response.status, response.body);
    } catch (e: unknown) {
      if (e instanceof TimeoutError) {
        return { status: AvailabilityStatus.Timeout, errorDetail: e.message };
      }
      const message = e instanceof Error ? e.message : String(e);
      return { status: AvailabilityStatus.Error, errorDetail: message };
    }
  }

  parseResponse(status: number, body?: string): CheckResult {
    const bodyText = body ?? '';

    const blocked = detectBlockedResponse(this.name, status, bodyText);
    if (blocked) {
      return {
        status: AvailabilityStatus.Error,
        errorDetail: blocked,
      };
    }

    const custom = getCustomParseResult(this.name, status, bodyText);
    if (custom) {
      return custom;
    }

    const bodyContainsMatch =
      typeof this.bodyMatch === 'string' && bodyText.includes(this.bodyMatch);

    switch (this.checkMethod) {
      case CheckMethod.DNS: {
        try {
          const json = JSON.parse(bodyText || '{}');
          return {
            status: json.Status === 3
              ? AvailabilityStatus.Available
              : AvailabilityStatus.Taken,
          };
        } catch {
          return { status: AvailabilityStatus.Error, errorDetail: 'DNS parse error' };
        }
      }

      case CheckMethod.JsonEmptyArray: {
        try {
          const parsed: unknown = JSON.parse(bodyText || '[]');
          if (!Array.isArray(parsed)) {
            return {
              status: AvailabilityStatus.Error,
              errorDetail: 'Unexpected GitLab API response',
            };
          }
          return {
            status:
              parsed.length === 0
                ? AvailabilityStatus.Available
                : AvailabilityStatus.Taken,
          };
        } catch {
          return {
            status: AvailabilityStatus.Error,
            errorDetail: 'GitLab API parse error',
          };
        }
      }

      case CheckMethod.NotFoundBodyMatch:
        if (status !== 200 && bodyContainsMatch) {
          return { status: AvailabilityStatus.Available };
        }
        if (status === 200) {
          return { status: AvailabilityStatus.Taken };
        }
        return {
          status: AvailabilityStatus.Error,
          errorDetail: `HTTP ${status}`,
        };

      case CheckMethod.BodyMatch:
        if (bodyContainsMatch) {
          return { status: AvailabilityStatus.Available };
        }
        if (status === 200 || status === 404) {
          return { status: AvailabilityStatus.Taken };
        }
        return {
          status: AvailabilityStatus.Error,
          errorDetail: `HTTP ${status}`,
        };

      case CheckMethod.InvertedBodyMatch:
        if (bodyContainsMatch) {
          return { status: AvailabilityStatus.Taken };
        }
        if (status === 200) {
          return { status: AvailabilityStatus.Available };
        }
        return {
          status: AvailabilityStatus.Error,
          errorDetail: `HTTP ${status}`,
        };

      default:
        if (status !== 200 && status !== 404) {
          return { status: AvailabilityStatus.Error, errorDetail: `HTTP ${status}` };
        }
        return {
          status: status !== 200
            ? AvailabilityStatus.Available
            : AvailabilityStatus.Taken,
        };
    }
  }
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timeout after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}
