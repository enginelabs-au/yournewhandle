import {
  AvailabilityStatus,
  type CheckResult,
} from "@/lib/checker/nick-checkr/abstract-service";

export function getCustomParseResult(
  serviceName: string,
  status: number,
  body: string,
): CheckResult | null {
  switch (serviceName) {
    case "Discord": {
      if (
        body.includes("og_img_discord_home") &&
        !body.includes("Interactive Community")
      ) {
        return {
          status: AvailabilityStatus.Error,
          errorDetail: "Could not verify Discord username",
        };
      }
      if (status === 404) {
        return { status: AvailabilityStatus.Available };
      }
      return { status: AvailabilityStatus.Taken };
    }

    case "Matrix":
      return {
        status: AvailabilityStatus.Error,
        errorDetail: "Matrix profile checks unavailable",
      };

    case "Spotify":
      if (body.includes("Spotify – Web Player")) {
        return {
          status: AvailabilityStatus.Error,
          errorDetail: "Spotify profile page unavailable",
        };
      }
      return null;

    case "Replit":
      if (body.includes("Sign Up - Replit")) {
        return {
          status: AvailabilityStatus.Error,
          errorDetail: "Replit profile page unavailable",
        };
      }
      return null;

    case "Notion":
      return {
        status: AvailabilityStatus.Error,
        errorDetail: "Notion site checks unavailable",
      };

    default:
      return null;
  }
}
