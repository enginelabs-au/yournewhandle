"use client";

import { useCallback, useState } from "react";

export type WorkflowDirection = "generate-check" | "check-generate";
export type StudioZone = "check" | "generate";

export function useWorkflowDirection() {
  const [direction, setDirection] = useState<WorkflowDirection>("check-generate");
  const [activeZone, setActiveZone] = useState<StudioZone>("check");

  const flipDirection = useCallback(() => {
    setDirection((current) =>
      current === "generate-check" ? "check-generate" : "generate-check",
    );
    setActiveZone((zone) => (zone === "check" ? "generate" : "check"));
  }, []);

  const selectCheckZone = useCallback(() => {
    setActiveZone("check");
    setDirection("check-generate");
  }, []);

  const selectGenerateZone = useCallback(() => {
    setActiveZone("generate");
    setDirection("generate-check");
  }, []);

  const focusCheck = useCallback(() => {
    selectCheckZone();
  }, [selectCheckZone]);

  const focusGenerate = useCallback(() => {
    selectGenerateZone();
  }, [selectGenerateZone]);

  return {
    direction,
    activeZone,
    flipDirection,
    selectCheckZone,
    selectGenerateZone,
    focusCheck,
    focusGenerate,
  };
}
