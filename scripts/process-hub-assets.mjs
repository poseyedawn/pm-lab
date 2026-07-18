import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sourceRoot = '/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f';
const outputRoot = fileURLToPath(new URL('../public/lab/', import.meta.url));

const assets = [
  {
    input: `${sourceRoot}/exec-fc87d46f-8008-4764-9154-5752475f71ab.png`,
    output: 'significant-depth-card.webp',
    width: 1400,
    threshold: 42,
    mode: 'connected',
    globalThreshold: 16,
  },
  {
    input: `${sourceRoot}/exec-2ffa2a2a-ef4b-4c78-a4d2-27d23e87c150.png`,
    output: 'ship-it-depth-card.webp',
    width: 1400,
    threshold: 42,
    mode: 'connected',
    globalThreshold: 16,
  },
  {
    input: `${sourceRoot}/exec-8d3850ba-35f4-40ca-b1f1-94a61f7e22e5.png`,
    output: 'exception-room-depth-card.webp',
    width: 1400,
    threshold: 30,
    mode: 'connected',
    globalThreshold: 12,
  },
  {
    input: `${sourceRoot}/exec-5c083810-4da1-4f0a-9f96-dc5ac5632223.png`,
    output: 'bubble.webp',
    width: 192,
    threshold: 28,
    mode: 'global',
  },
  {
    input: `${sourceRoot}/exec-398c6986-1d5a-469d-ad87-4748f0608671.png`,
    output: 'ring.webp',
    width: 192,
    threshold: 28,
    mode: 'global',
  },
  {
    input: `${sourceRoot}/exec-b190237f-f93b-48a7-94f3-e1978d2e28cd.png`,
    output: 'squiggle.webp',
    width: 192,
    threshold: 28,
    mode: 'global',
  },
  {
    input: `${sourceRoot}/exec-67f8b57c-4dd4-4c55-8f3d-176409d1f075.png`,
    output: 'sparkle.webp',
    width: 128,
    threshold: 28,
    mode: 'global',
  },
  {
    input: `${sourceRoot}/exec-1a642e7a-66d2-4ec0-a9ec-6cd102acf0e2.png`,
    output: 'flask.webp',
    width: 160,
    threshold: 28,
    mode: 'global',
  },
];

function isBackground(data, offset, threshold) {
  return data[offset] <= threshold
    && data[offset + 1] <= threshold
    && data[offset + 2] <= threshold;
}

function removeGlobalBlack(data, pixelCount, threshold) {
  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * 4;
    if (isBackground(data, offset, threshold)) data[offset + 3] = 0;
  }
}

function removeConnectedBlack(data, width, height, threshold) {
  const visited = new Uint8Array(width * height);
  const stack = [];

  const queue = (index) => {
    if (visited[index]) return;
    visited[index] = 1;
    if (!isBackground(data, index * 4, threshold)) return;
    stack.push(index);
  };

  for (let x = 0; x < width; x += 1) {
    queue(x);
    queue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    queue(y * width);
    queue(y * width + width - 1);
  }

  while (stack.length > 0) {
    const index = stack.pop();
    data[index * 4 + 3] = 0;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) queue(index - 1);
    if (x < width - 1) queue(index + 1);
    if (y > 0) queue(index - width);
    if (y < height - 1) queue(index + width);
  }
}

async function processAsset(asset) {
  const { data, info } = await sharp(asset.input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (asset.mode === 'global') {
    removeGlobalBlack(data, info.width * info.height, asset.threshold);
  } else {
    removeConnectedBlack(data, info.width, info.height, asset.threshold);
    if (asset.globalThreshold) {
      removeGlobalBlack(data, info.width * info.height, asset.globalThreshold);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(`${outputRoot}${asset.output}`);
}

await mkdir(outputRoot, { recursive: true });
await Promise.all(assets.map(processAsset));
