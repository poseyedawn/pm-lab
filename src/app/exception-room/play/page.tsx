import { ExceptionPlayClient } from '@/components/exception-room/ExceptionPlayClient';

interface ExceptionPlayPageProps {
  searchParams: Promise<{ mode?: string; preview?: string }>;
}

export default async function ExceptionPlayPage({ searchParams }: ExceptionPlayPageProps) {
  const { mode, preview } = await searchParams;
  const runMode = mode === 'practice' ? 'practice' : 'campaign';
  const previewSelected = process.env.NEXT_PUBLIC_ENABLE_EXCEPTION_PREVIEW === 'true'
    && preview === 'selected'
    && runMode === 'campaign';
  return <ExceptionPlayClient mode={runMode} previewSelected={previewSelected} />;
}
