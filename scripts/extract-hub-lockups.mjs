import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const referencePath = '/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-3b985fb1-8c88-426f-91f9-1a29018a3864.png';
const outputRoot = '/tmp/pm-lab-lockups';

const lockups = [
  {
    name: 'pick-field-test-logo',
    crop: { left: 96, top: 158, width: 670, height: 238 },
    minimumComponentArea: 220,
  },
  {
    name: 'product-lab-wordmark',
    crop: { left: 110, top: 48, width: 294, height: 62 },
    minimumComponentArea: 70,
  },
];

function isBackdrop(data, offset) {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];

  return red > 118
    && red > green * 1.35
    && red > blue * 1.15
    && blue > 32;
}

function removeSmallComponents(data, width, height, minimumArea, name) {
  const visited = new Uint8Array(width * height);

  for (let start = 0; start < width * height; start += 1) {
    if (visited[start] || data[start * 4 + 3] === 0) continue;

    const stack = [start];
    const component = [];
    const bounds = {
      minX: width,
      minY: height,
      maxX: 0,
      maxY: 0,
    };
    visited[start] = 1;

    while (stack.length > 0) {
      const index = stack.pop();
      component.push(index);
      const x = index % width;
      const y = Math.floor(index / width);
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxY = Math.max(bounds.maxY, y);
      const neighbors = [];

      if (x > 0) neighbors.push(index - 1);
      if (x < width - 1) neighbors.push(index + 1);
      if (y > 0) neighbors.push(index - width);
      if (y < height - 1) neighbors.push(index + width);

      for (const neighbor of neighbors) {
        if (visited[neighbor] || data[neighbor * 4 + 3] === 0) continue;
        visited[neighbor] = 1;
        stack.push(neighbor);
      }
    }

    const isTitleDecoration = name === 'pick-field-test-logo'
      && (
        (bounds.maxX < 130 && bounds.maxY < 90)
        || (bounds.minX > 530 && bounds.minY < 95)
      );

    if (component.length >= minimumArea && !isTitleDecoration) continue;
    for (const index of component) data[index * 4 + 3] = 0;
  }
}

async function extractLockup({ name, crop, minimumComponentArea }) {
  const { data, info } = await sharp(referencePath)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < info.width * info.height; index += 1) {
    const offset = index * 4;

    if (name === 'product-lab-wordmark') {
      const brightnessFloor = Math.min(data[offset], data[offset + 1], data[offset + 2]);
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = Math.max(0, Math.min(255, Math.round((brightnessFloor - 120) / 90 * 255)));
    } else if (isBackdrop(data, offset)) {
      data[offset + 3] = 0;
    }
  }

  removeSmallComponents(data, info.width, info.height, minimumComponentArea, name);

  const pipeline = sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });

  if (name === 'product-lab-wordmark') pipeline.flatten({ background: '#ffffff' });

  await pipeline.png({ compressionLevel: 9 }).toFile(`${outputRoot}/${name}.png`);
}

await mkdir(outputRoot, { recursive: true });
await Promise.all(lockups.map(extractLockup));
