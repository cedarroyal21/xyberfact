import type { AnalyzeWebpageContentOutput } from '@/ai/flows/analyze-webpage-content';
import type { VerifyFactualityOfClaimsOutput } from '@/ai/flows/verify-factuality-of-claims';
import type { EvaluateSourceReliabilityOutput } from '@/ai/flows/evaluate-source-reliability';

export type AnalysisResult = {
  analysis: AnalyzeWebpageContentOutput;
  verification: VerifyFactualityOfClaimsOutput;
  reliability: EvaluateSourceReliabilityOutput;
};

export type AnalysisState = {
  data?: AnalysisResult;
  error?: string;
};
