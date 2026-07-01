#!/usr/bin/env node
/**
 * Regenerates PR Pulse icon assets from SVG sources.
 * Requires: sharp (pnpm exec), macOS iconutil for .icns
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pulseDir = path.join(root, 'assets/pr-pulse');

async function renderSvg(name, size, outPath) {
  const svgPath = path.join(pulseDir, `${name}-source.svg`);
  await sharp(svgPath).resize(size, size).png().toFile(outPath);
}

/** Clip app icon artwork to the macOS squircle (transparent corners). */
async function applyMacIconMask(pngPath) {
  const maskPath = path.join(root, 'assets/macos-squircle-mask.png');
  const masked = await sharp(pngPath)
    .ensureAlpha()
    .composite([{ input: maskPath, blend: 'dest-in' }])
    .png()
    .toBuffer();
  await writeFile(pngPath, masked);
}

async function buildIcns(png1024) {
  const iconset = path.join(pulseDir, 'icon.iconset');
  await rm(iconset, { recursive: true, force: true });
  await mkdir(iconset, { recursive: true });

  const sizes = [
    [16, 'icon_16x16.png'],
    [32, 'icon_16x16@2x.png'],
    [32, 'icon_32x32.png'],
    [64, 'icon_32x32@2x.png'],
    [128, 'icon_128x128.png'],
    [256, 'icon_128x128@2x.png'],
    [256, 'icon_256x256.png'],
    [512, 'icon_256x256@2x.png'],
    [512, 'icon_512x512.png'],
    [1024, 'icon_512x512@2x.png'],
  ];

  for (const [size, filename] of sizes) {
    const out = path.join(iconset, filename);
    if (size === 1024) {
      await writeFile(out, await sharp(png1024).png().toBuffer());
    } else {
      await sharp(png1024).resize(size, size).png().toFile(out);
    }
  }

  const icnsPath = path.join(pulseDir, 'icon.icns');
  await execFileAsync('iconutil', ['-c', 'icns', iconset, '-o', icnsPath]);
  await rm(iconset, { recursive: true, force: true });
}

async function main() {
  const iconPng = path.join(pulseDir, 'icon.png');
  await renderSvg('icon', 1024, iconPng);
  await applyMacIconMask(iconPng);
  await renderSvg('tray-template', 22, path.join(pulseDir, 'tray-template.png'));
  await renderSvg('tray-template', 44, path.join(pulseDir, 'tray-template@2x.png'));

  if (process.platform === 'darwin') {
    await buildIcns(iconPng);
    console.log('Wrote icon.png, tray-template.png, tray-template@2x.png, icon.icns');
  } else {
    console.log('Wrote icon.png, tray-template.png, tray-template@2x.png (skipped icon.icns — not on macOS)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
