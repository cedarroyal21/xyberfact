import type { AnalysisResult } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrustScoreDisplay } from './trust-score-display';
import { Badge } from '@/components/ui/badge';
import { FileText, Megaphone, Scale, ShieldQuestion, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const { reliability, analysis, verification } = result;
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-8 sticky top-8">
        <TrustScoreDisplay
          score={reliability.reliabilityScore}
          rationale={reliability.evaluationRationale}
        />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" />
              {t('contentBreakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{analysis.summary}</p>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="key-claims">
                <AccordionTrigger className="text-base font-semibold">
                  <Megaphone className="mr-2 h-5 w-5 text-primary" /> {t('keyClaims')}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-6">
                    {analysis.keyClaims.map((claim, index) => (
                      <li key={index}>{claim}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="arguments">
                <AccordionTrigger className="text-base font-semibold">
                  <Scale className="mr-2 h-5 w-5 text-primary" /> {t('mainArguments')}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-6">
                    {analysis.arguments.map((argument, index) => (
                      <li key={index}>{argument}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <ShieldQuestion className="text-primary" />
               {t('factCheckAnalysis')}
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-green-600"/> {t('factualityAssessment')}</h3>
                <p className="text-muted-foreground mt-1">{verification.factualityAssessment}</p>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2"><ThumbsDown className="h-5 w-5 text-destructive"/> {t('potentialBiases')}</h3>
                <p className="text-muted-foreground mt-1">{verification.potentialBiases}</p>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
