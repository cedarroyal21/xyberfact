'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

const newsData = [
  {
    titleKey: 'newsArticle1Title',
    descriptionKey: 'newsArticle1Desc',
    image: 'https://picsum.photos/seed/news1/600/400',
    link: '#',
  },
  {
    titleKey: 'newsArticle2Title',
    descriptionKey: 'newsArticle2Desc',
    image: 'https://picsum.photos/seed/news2/600/400',
    link: '#',
  },
  {
    titleKey: 'newsArticle3Title',
    descriptionKey: 'newsArticle3Desc',
    image: 'https://picsum.photos/seed/news3/600/400',
    link: '#',
  },
];

export default function NewsSection() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-headline">
          {t('newsTitle')}
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {t('newsSubtitle')}
        </p>
      </div>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {newsData.map((item, index) => (
          <Card key={index} className="flex flex-col overflow-hidden fade-in-up" style={{animationDelay: `${index * 150}ms`}}>
            <div className="relative w-full h-48">
                <Image
                    src={item.image}
                    alt={t(item.titleKey as any)}
                    fill
                    style={{objectFit: 'cover'}}
                />
            </div>
            <CardHeader>
              <CardTitle>{t(item.titleKey as any)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm">{t(item.descriptionKey as any)}</p>
            </CardContent>
            <CardFooter>
              <Button variant="link" asChild className="p-0 h-auto">
                <a href={item.link}>
                  {t('readMore')} <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
