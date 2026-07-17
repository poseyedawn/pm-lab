import { ExceptionPlayClient } from '@/components/exception-room/ExceptionPlayClient';

interface ExceptionPlayPageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function ExceptionPlayPage({ searchParams }: ExceptionPlayPageProps) {
  const { preview } = await searchParams;
  return <ExceptionPlayClient previewSelected={preview === 'selected'} />;
}
