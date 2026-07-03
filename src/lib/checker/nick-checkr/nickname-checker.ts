import { Impit } from "impit";
import {
  AbstractService,
  CheckMethod,
  TimeoutError,
  type CheckResult,
  type HttpClient,
} from "@/lib/checker/nick-checkr/abstract-service";
import { services } from "@/lib/checker/nick-checkr/data/services";
import { applyServiceOverrides } from "@/lib/checker/nick-checkr/service-overrides";
import { getSpecialChecker } from "@/lib/checker/nick-checkr/special-checkers";

const TIMEOUT_MS = 10_000;
const DNS_TIMEOUT_MS = 5_000;

const impit = new Impit({ browser: "chrome" });

function createHttpClient(): HttpClient {
  return async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await impit.fetch(url, {
        signal: controller.signal,
      });
      const body = await response.text();
      return { status: response.status, body };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(TIMEOUT_MS);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
}

function createDnsClient(): HttpClient {
  return async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/dns-json" },
        signal: controller.signal,
      });
      const body = await response.text();
      return { status: response.status, body };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(DNS_TIMEOUT_MS);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
}

class NicknameChecker {
  private readonly services: AbstractService[];
  private readonly byName = new Map<string, AbstractService>();

  constructor() {
    const httpClient = createHttpClient();
    const dnsClient = createDnsClient();
    this.services = applyServiceOverrides(services).map(
      (service) =>
        new AbstractService(
          service.checkMethod === CheckMethod.DNS ? dnsClient : httpClient,
          service.name,
          service.url,
          service.category,
          service.checkMethod,
          service.bodyMatch,
        ),
    );
    for (const service of this.services) {
      this.byName.set(service.name, service);
    }
  }

  getServiceNames(): string[] {
    return this.services.map((service) => service.name);
  }

  check(nick: string, serviceName: string): Promise<CheckResult> {
    const special = getSpecialChecker(serviceName);
    if (special) {
      return special(nick);
    }

    const service = this.byName.get(serviceName);
    if (!service) {
      throw new Error(`Service "${serviceName}" not found`);
    }
    return service.check(nick);
  }
}

export const nicknameChecker = new NicknameChecker();
