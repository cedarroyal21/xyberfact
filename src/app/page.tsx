'use client';

import React, { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, AlertTriangle, ShieldOff, Users, HeartPulse, ArrowRight, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { analyzeUrl, analyzeImage } from '@/app/actions';
import type { AnalysisState, ImageAnalysisState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AnalysisResults from '@/components/factlens/analysis-results';
import ImageAnalysisResult from '@/components/factlens/image-analysis-result';
import { Header } from '@/components/factlens/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const initialUrlState: AnalysisState = {};
const initialImageState: ImageAnalysisState = {};

function UrlSubmitButton() {
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

function ImageSubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('analyzingImage')}
        </>
      ) : (
        t('analyzeImage')
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

function ImageUploadForm({ language }: { language: string }) {
  const [imageState, formAction] = useActionState(analyzeImage, initialImageState);
  const { toast } = useToast();
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hiddenImageData, setHiddenImageData] = useState<string>('');
  const { pending } = useFormStatus();

  useEffect(() => {
    if (imageState.error) {
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: imageState.error,
      });
    }
  }, [imageState, toast, t]);

  useEffect(() => {
    if (imageState.data && !pending) {
      formRef.current?.reset();
      setImagePreview(null);
      setHiddenImageData('');
    }
  }, [imageState.data, pending]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setHiddenImageData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setHiddenImageData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="language" value={language} />
        <input type="hidden" name="image" value={hiddenImageData} />
        
        <label
          htmlFor="image-upload"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-md" />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <Upload className="h-10 w-10" />
              <p>{t('dragAndDrop')}</p>
              <p className="text-sm">{t('orClickToUpload')}</p>
            </div>
          )}
        </label>
        <Input
          id="image-upload"
          ref={fileInputRef}
          name="image-file"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <div className="flex justify-center">
          <ImageSubmitButton />
        </div>

        {imageState.error && !pending && (
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {imageState.error}
          </p>
        )}
      </form>
      {pending ? <LoadingSkeleton /> : imageState.data && <ImageAnalysisResult result={imageState.data} preview={imagePreview} />}
    </div>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const [urlState, urlFormAction] = useActionState(analyzeUrl, initialUrlState);
  const { toast } = useToast();
  const urlFormRef = React.useRef<HTMLFormElement>(null);
  const { pending: urlPending } = useFormStatus();

  useEffect(() => {
    if (urlState.error) {
      toast({
        variant: 'destructive',
        title: t('analysisFailed'),
        description: urlState.error,
      });
    }
  }, [urlState, toast, t]);
  
  useEffect(() => {
    if (urlState.data && !urlPending) {
      urlFormRef.current?.reset();
    }
  }, [urlState.data, urlPending]);


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

        <Tabs defaultValue="url" className="max-w-3xl mx-auto mt-8 fade-in-up" style={{ animationDelay: '0.6s' }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <FileText className="mr-2 h-4 w-4" />
              {t('analyzeUrl')}
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="mr-2 h-4 w-4" />
              {t('analyzeImage')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <Card>
              <CardContent className="p-6">
                <form ref={urlFormRef} action={urlFormAction} className="space-y-4">
                  <input type="hidden" name="language" value={language} />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      name="url"
                      type="url"
                      placeholder={t('placeholder')}
                      required
                      className="flex-grow text-base"
                    />
                    <UrlSubmitButton />
                  </div>
                  {urlState.error && !urlPending && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {urlState.error}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="image">
             <Card>
              <CardContent className="p-6">
                <ImageUploadForm language={language} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div
          className="max-w-6xl mx-auto mt-8 fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          {urlPending ? <LoadingSkeleton /> : urlState.data && <AnalysisResults result={urlState.data} />}
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
