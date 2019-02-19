import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {Plugin} from 'metalsmith';
import imagemin from 'imagemin';
import rimraf from 'rimraf';
import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';
import {AssetOptions} from './types/options';
import Files from './types/files';

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const rmrf = promisify(rimraf);

export interface Asset {
  name: string;
  assetPath: string;
  folder: string;
}

export const cleanup = async (outputDirectory: string) => {
  const dir = path.join(path.resolve(), outputDirectory, 'content');

  try {
    await access(outputDirectory, fs.constants.F_OK);
  } catch (err) {
    // tslint:disable-next-line
    console.warn(`
      Warning: The asset output directory ${outputDirectory} did not exist so jdown created it.
    `);
    await mkdir(path.join(path.resolve(), outputDirectory));
  }

  await rmrf(dir);
  return mkdir(dir);
};

export const minify = (
  paths: string[],
  options: AssetOptions
): Promise<imagemin.Result[]> => {
  const assets = paths.map(async assetPath => {
    const asset = await imagemin([assetPath], '', {
      plugins: [
        imageminPngquant(options.png),
        imageminJpegtran(options.jpg),
        imageminGifsicle(options.gif),
        imageminSvgo(options.svg)
      ]
    });
    asset[0].path = assetPath;
    return asset[0];
  });

  return Promise.all(assets);
};

export const assetPaths = (dir: string, files: Files): string[] => {
  return Object.keys(files)
    .filter(file => {
      return file.includes(`assets${path.sep}`) && !file.includes('.DS_Store');
    })
    .map(file => {
      return path.join(dir, file);
    });
};

export const output = (
  contentDirectory: string,
  outputDirectory: string,
  outputPath: string,
  assets: imagemin.Result[]
): Promise<Asset[]> => {
  const dir = contentDirectory.split(path.sep).pop();
  const outputAssets = assets.map(async asset => {
    const {name, ext} = path.parse(asset.path);
    const {mtime} = await stat(asset.path);
    const parts = asset.path.split(path.sep);
    const parent = parts.reverse()[2];
    const hasFolder = parent !== dir && parent !== 'assets';
    const folder = hasFolder ? parent : '';
    const fileName = hasFolder
      ? `${folder}-${name}-${mtime.getTime()}${ext}`
      : `${name}-${mtime.getTime()}${ext}`;
    const actualAssetPath = path.join(outputDirectory, 'content', fileName);
    const assetPath = path.join(outputPath, 'content', fileName);
    await writeFile(actualAssetPath, asset.data, 'binary');
    return {name: `${name}${ext}`, assetPath, folder};
  });

  return Promise.all(outputAssets);
};

export const rewriteAssetPaths = (
  files: Files,
  assets: Asset[],
  contentDirectory: string
) => {
  const dir = contentDirectory.split(path.sep).pop();

  const rewrite = (
    assetRef: string,
    folder: string = '',
    file: string,
    property: string
  ) => {
    const name = assetRef.replace('./assets/', '');
    let asset = assets.find(a => a.folder === folder && a.name === name);

    // Even if there is a folder it's possible this is referencing a top level asset
    if (folder && !asset) {
      asset = assets.find(a => a.name === name);
    }

    if (asset) {
      return (files[file][property] = files[file][property].replace(
        assetRef,
        asset.assetPath
      ));
    }
  };

  Object.keys(files).forEach(file => {
    Object.keys(files[file]).forEach(property => {
      const content = files[file][property];

      if (typeof content !== 'string' || !content.includes('./assets/')) {
        return;
      }

      const parent = file.split(path.sep).reverse()[1];
      const folder = parent !== dir ? parent : '';
      const assetRefs = content.match(/\.\/assets\/.+?(?="|'|\s|$|\))/g) || [];
      assetRefs.forEach(assetRef => rewrite(assetRef, folder, file, property));
    });
  });

  return files;
};

/**
 * Minify assets and rewrite asset paths
 *
 * @param dir - The content directory where the assets are stored
 * @returns A metalsmith Plugin
 */
const transformAssets = (dir: string, options: AssetOptions) => {
  const transform: Plugin = async (files, _, done) => {
    const outputDirectory = options.output as string;
    const outputPath = options.path as string;
    await cleanup(outputDirectory);
    const paths = assetPaths(dir, files);
    const minifiedAssets = await minify(paths, options);
    const assets = await output(
      dir,
      outputDirectory,
      outputPath,
      minifiedAssets
    );
    rewriteAssetPaths(files, assets, dir);
    return Promise.resolve(done());
  };

  return transform;
};

export default transformAssets;
