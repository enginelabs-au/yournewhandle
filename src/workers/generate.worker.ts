import type { GenerationParams } from "@/lib/types";
import { generateBatch } from "@/lib/engine/generate";

export type GenerateWorkerRequest = {
  params: GenerationParams;
};

export type GenerateWorkerResponse = {
  candidates: ReturnType<typeof generateBatch>;
};

self.onmessage = (event: MessageEvent<GenerateWorkerRequest>) => {
  const { params } = event.data;
  const candidates = generateBatch(params);
  const response: GenerateWorkerResponse = { candidates };
  self.postMessage(response);
};

export {};
