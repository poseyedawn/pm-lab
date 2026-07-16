import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LabProfileSummary } from '@/components/lab/LabProfileSummary';

beforeEach(() => window.localStorage.clear());

describe('LabProfileSummary', () => {
  it('exposes migrated Significant XP on the Lab home', async () => {
    window.localStorage.setItem('pmlab:profile:v1', JSON.stringify({ xp: 550 }));
    render(<LabProfileSummary variant="card" />);

    expect(await screen.findByText('550 XP')).toBeInTheDocument();
  });
});
