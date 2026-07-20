import { LabHeader } from '@/components/lab/LabHeader';
import { PreferenceRuntime } from '@/components/lab/PreferenceRuntime';

interface LabShellProps {
  children: React.ReactNode;
}

export function LabShell({ children }: LabShellProps) {
  return (
    <div className="lab-frame flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <PreferenceRuntime />
      <LabHeader />
      <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      <footer className="border-t border-ink/10 px-6 py-5 text-center text-xs leading-relaxed text-ink-soft">
        Saved progress stays in your browser. Analytics record coarse interaction events.
      </footer>
    </div>
  );
}
