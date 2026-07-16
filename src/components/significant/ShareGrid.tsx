import { ShareControl } from '@/components/significant/ShareControl';

export function ShareGrid({ text }: { text: string }) {
  return <ShareControl text={text} surface="daily" label="Share result" color="brand" className="w-full" />;
}
