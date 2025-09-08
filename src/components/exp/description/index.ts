import type { CoreTokenType } from "@/utils/tokenize"

export interface ActivatedToken {
  token: string;
  type: CoreTokenType;
  count: number;
}

export interface FeatureStatistic {
  activatedMoleculePct: Record<string, number>;
  activatedTokens: Record<string, ActivatedToken[]>;
}