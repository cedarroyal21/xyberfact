'use client';

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, AlertTriangle, ShieldOff, Users, HeartPulse, ArrowRight } from 'lucide-react';
import { analyzeUrl } from '@/app/actions';
import type { AnalysisState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AnalysisResults from '@/components/factlens/analysis-results';
import { Header } from '@/components/factlens/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

const initialState: AnalysisState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('analyzing')}
        </>
      ) : (
        t('analyze')
      )}
    </Button>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse mt-12">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-1">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-32" />
            <div className="w-full space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="md:col-span-2 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const { t, language } = useLanguage();
  const [state, formAction] = useFormState(analyzeUrl, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: state.error,
      });
    }
  }, [state, toast, t]);

  useEffect(() => {
    if (state.data && !pending) {
      formRef.current?.reset();
    }
  }, [state.data, pending]);


  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground font-headline fade-in-up">
            {t('uncoverTruth')}
          </h1>
          <p
            className="mt-4 text-lg md:text-xl text-muted-foreground fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {t('subheading')}
          </p>
        </section>

        <Card
          className="max-w-3xl mx-auto mt-8 shadow-lg fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <CardContent className="p-6">
            <form ref={formRef} action={formAction} className="space-y-4">
              <input type="hidden" name="language" value={language} />
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  name="url"
                  type="url"
                  placeholder={t('placeholder')}
                  required
                  className="flex-grow text-base"
                />
                <SubmitButton />
              </div>
              {state.error && !pending && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {state.error}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div
          className="max-w-6xl mx-auto mt-8 fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          {pending ? <LoadingSkeleton /> : state.data && <AnalysisResults result={state.data} />}
        </div>
        
        <section className="max-w-5xl mx-auto mt-16 md:mt-24 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-headline">
              {t('consequencesTitle')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              {t('consequencesSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <ShieldOff className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('erosionOfTrust')}</h3>
              <p className="text-muted-foreground">{t('erosionOfTrustText')}</p>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('socialPolarization')}</h3>
              <p className="text-muted-foreground">{t('socialPolarizationText')}</p>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex justify-center items-center mb-4">
                <div className="bg-primary/10 text-primary p-4 rounded-full">
                  <HeartPulse className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('publicHealthRisks')}</h3>
              <p className="text-muted-foreground">{t('publicHealthRisksText')}</p>
            </div>
          </div>
          <div className="mt-16 text-center bg-card border rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight">{t('whyFactLensMatters')}</h3>
            <p className="mt-3 max-w-3xl mx-auto text-muted-foreground">
              {t('whyFactLensMattersText')}
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mt-16 md:mt-24 py-12 text-center">
          <div className="bg-card border rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight">{t('developedBy')}</h3>
            <p className="mt-3 max-w-3xl mx-auto text-muted-foreground">
              {t('xyberclanMission')}
            </p>
            <Button asChild className="mt-6">
              <a href="https://xyberclan-saas-website.vercel.app/" target="_blank" rel="noopener noreferrer">
                {t('visitXyberclan')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

      </div>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t('factlens')}. {t('allRightsReserved')}
      </footer>
    </main>
  );
}
