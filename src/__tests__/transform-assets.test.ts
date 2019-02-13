import fs from 'fs';
import rimraf from 'rimraf';
import path from 'path';
import test from 'ava';
import {promisify} from 'util';
import {
  cleanup,
  minify,
  assetPaths,
  output,
  rewriteAssetPaths
} from '../transform-assets';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const readdir = promisify(fs.readdir);
const rmrf = promisify(rimraf);

const contentDir = path.join(
  path.resolve(),
  '.',
  'src',
  '__tests__',
  'content'
);

test('The asset output directory is cleaned', async t => {
  const outputDirectory = path.join('.', 'src', '__tests__', 'clean');
  const dir = path.join(path.resolve(), outputDirectory, 'content');
  const filePath = path.join(dir, 'empty.txt');
  await rmrf(outputDirectory);
  await mkdir(outputDirectory);
  await mkdir(dir);
  await writeFile(filePath, '');
  await t.notThrowsAsync(access(dir, fs.constants.F_OK));
  await t.notThrowsAsync(access(filePath, fs.constants.F_OK));
  await t.notThrowsAsync(cleanup(outputDirectory));
  await t.notThrowsAsync(access(dir, fs.constants.F_OK));
  await t.throwsAsync(access(filePath, fs.constants.F_OK));
  rmrf(outputDirectory);
});

test('Assets with paths are returned from minify', async t => {
  const paths = [
    path.join(contentDir, 'assets', 'logo.png'),
    path.join(contentDir, 'assets', 'logo.svg')
  ];
  const assets = await minify(paths, {});
  t.true(assets.length === 2);
  t.true(assets[0].path === paths[0]);
  t.true(assets[1].path === paths[1]);
});

test('Asset paths are returned correctly', t => {
  const paths = assetPaths('dir', {
    [path.join('assets', 'logo.png')]: {},
    [path.join('coll', 'logo.svg')]: {},
    '.DS_Store': {}
  });
  t.deepEqual(paths, [path.join('dir', 'assets', 'logo.png')]);
});

test('Assets are output and new file path info is returned', async t => {
  const contentDirectory = path.join('.', 'src', '__tests__', 'content');
  const outputDirectory = path.join('.', 'src', '__tests__', 'temp');
  const outputPath = '/static/';
  const paths = [
    path.join(contentDir, 'assets', 'logo.png'),
    path.join(contentDir, 'assets', 'logo.svg'),
    path.join(contentDir, 'home', 'assets', 'logo.png')
  ];
  await rmrf(outputDirectory);
  await mkdir(outputDirectory);
  await mkdir(path.join(outputDirectory, 'content'));
  const assets = await minify(paths, {});
  const outputAssets = await output(
    contentDirectory,
    outputDirectory,
    outputPath,
    assets
  );
  t.true(outputAssets.length === 3);
  const files = await readdir(path.join(outputDirectory, 'content'));
  t.true(files.length === 3);
  rmrf(outputDirectory);
});

test('Asset paths in file contents are rewritten to match generated assets', async t => {
  const files = {
    file: {contents: ''},
    fileTwo: {contents: '<img src="./assets/asset.jpg"/>'},
    fileThree: {contents: '![](./assets/asset-two.png)'},
    [path.join('home', 'file')]: {
      contents: '![](./assets/asset.jpg)![](./assets/asset-two.png)'
    },
    [path.join('collections', 'collection', 'file')]: {
      contents: '![](./assets/collection-asset.svg)'
    }
  };
  const assets = [
    {name: 'asset.jpg', assetPath: 'rewrote.jpg', folder: ''},
    {name: 'asset-two.png', assetPath: 'rewrote.png', folder: ''},
    {name: 'asset.jpg', assetPath: 'home-rewrote.jpg', folder: 'home'},
    {
      name: 'collection-asset.svg',
      assetPath: 'collection-rewrote.svg',
      folder: 'collection'
    }
  ];
  const contentDirectory = '/src/content';
  rewriteAssetPaths(files, assets, contentDirectory);
  t.deepEqual(files, {
    file: {contents: ''},
    fileTwo: {contents: '<img src="rewrote.jpg"/>'},
    fileThree: {contents: '![](rewrote.png)'},
    [path.join('home', 'file')]: {
      contents: '![](home-rewrote.jpg)![](rewrote.png)'
    },
    [path.join('collections', 'collection', 'file')]: {
      contents: '![](collection-rewrote.svg)'
    }
  });
});
