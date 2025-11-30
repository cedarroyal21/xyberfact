'use client';

import type { AnalyzeImageOriginOutput } from '@/ai/flows/analyze-image-origin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, getScoreColor } from '@/lib/utils';
import { BrainCircuit, Cpu } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface ImageAnalysisResultProps {
  result: AnalyzeImageOriginOutput;
  preview: string | null;
}

const ConfidenceMeter = ({ score, className }: { score: number; className?: string }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full">
      <div className="relative h-3 w-full rounded-full bg-muted">
        <div
          className={cn('absolute h-3 rounded-full', className)}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};


export default function ImageAnalysisResult({ result, preview }: ImageAnalysisResultProps) {
  const { isAiGenerated, confidence, explanation } = result;
  const { t } = useLanguage();
  const confidenceColor = getScoreColor(100 - confidence);

  const verdict = isAiGenerated
    ? t('verdictAiGenerated')
    : t('verdictLikelyHuman');

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {preview && (
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('analyzedImage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={preview} alt="Analyzed image" className="rounded-md w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className={cn("lg:col-span-2 space-y-6", !preview && "lg:col-span-3")}>
        <Card className="fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="text-primary" />
              {t('originAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold">{t('verdict')}</h3>
              <p className={cn("text-3xl font-bold mt-2", isAiGenerated ? 'text-destructive' : 'text-green-500')}>
                {verdict}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                {t('confidenceLevel')}
              </h4>
               <p className="text-muted-foreground text-sm">{t('confidenceExplanation')}</p>
               <div className='pt-2'>
                <ConfidenceMeter score={confidence} className={confidenceColor} />
                 <p className={cn("text-center font-bold text-lg pt-2", confidenceColor)}>{confidence}%</p>
               </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">{t('assessmentRationale')}</h4>
              <p className="text-muted-foreground">{explanation}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
