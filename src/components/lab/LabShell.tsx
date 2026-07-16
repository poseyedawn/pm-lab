import { LabHeader } from '@/components/lab/LabHeader';
import { PreferenceRuntime } from '@/components/lab/PreferenceRuntime';

interface LabShellProps {
  children: React.ReactNode;
}

export function LabShell({ children }: LabShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <PreferenceRuntime />
      <LabHeader />
      <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      <footer className="border-t border-ink/10 px-6 py-5 text-center text-xs leading-relaxed text-ink-soft">
        Progress stays in your browser. We use aggregate analytics to improve the games.
      </footer>
    </div>
  );
}
