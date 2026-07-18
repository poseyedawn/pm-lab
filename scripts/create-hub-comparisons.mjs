import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const referencePath = '/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-3b985fb1-8c88-426f-91f9-1a29018a3864.png';
const evidenceRoot = fileURLToPath(new URL('../docs/audits/assets/2026-07-17-floating-hub/', import.meta.url));
const implementationPath = `${evidenceRoot}01-hub-390x844.png`;

await mkdir(evidenceRoot, { recursive: true });

const referenceMobile = await sharp(referencePath)
  .resize({ width: 390 })
  .extract({ left: 0, top: 0, width: 390, height: 844 })
  .png()
  .toBuffer();

const implementationMobile = await sharp(implementationPath)
  .resize(390, 844)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 820,
    height: 876,
    channels: 4,
    background: '#e6edf7',
  },
})
  .composite([
    { input: referenceMobile, left: 12, top: 16 },
    { input: implementationMobile, left: 418, top: 16 },
  ])
  .png()
  .toFile(`${evidenceRoot}05-reference-comparison.png`);

const referenceCard = await sharp(referencePath)
  .resize({ width: 390 })
  .extract({ left: 14, top: 220, width: 362, height: 200 })
  .png()
  .toBuffer();

const implementationCard = await sharp(implementationPath)
  .extract({ left: 14, top: 222, width: 362, height: 200 })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 756,
    height: 232,
    channels: 4,
    background: '#e6edf7',
  },
})
  .composite([
    { input: referenceCard, left: 8, top: 16 },
    { input: implementationCard, left: 386, top: 16 },
  ])
  .png()
  .toFile(`${evidenceRoot}06-card-reference-comparison.png`);

const referenceTitle = await sharp(referencePath)
  .resize({ width: 390 })
  .extract({ left: 0, top: 0, width: 390, height: 212 })
  .png()
  .toBuffer();

const implementationTitle = await sharp(implementationPath)
  .extract({ left: 0, top: 0, width: 390, height: 212 })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 820,
    height: 244,
    channels: 4,
    background: '#e6edf7',
  },
})
  .composite([
    { input: referenceTitle, left: 12, top: 16 },
    { input: implementationTitle, left: 418, top: 16 },
  ])
  .png()
  .toFile(`${evidenceRoot}07-title-reference-comparison.png`);
