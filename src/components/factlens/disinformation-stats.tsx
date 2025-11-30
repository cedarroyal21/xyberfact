'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from 'next-themes';

export function DisinformationStats() {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();

  const data = [
    { name: t('cameroon'), percentage: 78, fill: 'hsl(var(--chart-1))' },
    { name: t('africa'), percentage: 65, fill: 'hsl(var(--chart-2))' },
    { name: t('world'), percentage: 56, fill: 'hsl(var(--chart-3))' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {label}
              </span>
              <span className="font-bold text-muted-foreground">
                {`${payload[0].value}%`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const tickColor = resolvedTheme === 'dark' ? '#A1A1AA' : '#71717A'; // zinc-400 or zinc-500

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('disinformationStatsTitle')}</CardTitle>
        <CardDescription>{t('disinformationStatsSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--input))'} />
                <XAxis dataKey="name" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} label={{ value: t('exposurePercentage'), angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 12, dx: -10 }} />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
