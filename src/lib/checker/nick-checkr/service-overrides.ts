import {
  CheckMethod,
  type ServiceDefinition,
} from "@/lib/checker/nick-checkr/abstract-service";

/** Patches for platforms where upstream Standard checks false-positive as taken. */
export const SERVICE_OVERRIDES: Record<
  string,
  Partial<Pick<ServiceDefinition, "url" | "checkMethod" | "bodyMatch">>
> = {
  Facebook: {
    checkMethod: CheckMethod.BodyMatch,
    bodyMatch: "This content isn't available",
  },
  Pinterest: {
    checkMethod: CheckMethod.BodyMatch,
    bodyMatch: "User not found",
  },
  Hashnode: {
    checkMethod: CheckMethod.BodyMatch,
    bodyMatch: "User not found",
  },
  Bluesky: {
    checkMethod: CheckMethod.InvertedBodyMatch,
    bodyMatch: "profile:username",
  },
  GitLab: {
    url: "https://gitlab.com/api/v4/users?username={}",
    checkMethod: CheckMethod.JsonEmptyArray,
  },
  Twitch: {
    url: "https://www.twitch.tv/{}",
    checkMethod: CheckMethod.InvertedBodyMatch,
    bodyMatch: " - Twitch",
  },
  Telegram: {
    checkMethod: CheckMethod.InvertedBodyMatch,
    bodyMatch: "tgme_page_photo",
  },
  Minecraft: {
    checkMethod: CheckMethod.InvertedBodyMatch,
    bodyMatch: "| Minecraft Profile | NameMC",
  },
};

export function applyServiceOverrides(
  definitions: ServiceDefinition[],
): ServiceDefinition[] {
  return definitions.map((definition) => {
    const override = SERVICE_OVERRIDES[definition.name];
    if (!override) {
      return definition;
    }
    return { ...definition, ...override };
  });
}
