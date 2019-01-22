import path from 'path';
import camelcase from 'camelcase';
import {Plugin} from 'metalsmith';
import Files from './types/files';

const removeUnwanted = (files: Files) => {
  Object.keys(files).forEach(file => {
    if (file.includes('.DS_Store') || file.includes(`assets${path.sep}`)) {
      delete files[file];
    }
  });

  return files;
};

const rename = (files: Files) => {
  Object.keys(files).forEach(file => {
    const parts = file.split(path.sep) || [];
    const fileName = camelcase((parts.pop() || '').replace(/.html|.md/, ''));
    const newFilePath = parts.join(path.sep) + path.sep + fileName;
    files[newFilePath] = files[file];
    delete files[file];
  });

  return files;
};

const populateProperties = (files: Files) => {
  Object.keys(files).forEach(file => {
    delete files[file].mode;
    delete files[file].stats;
  });

  return files;
};

const group = (files: Files) => {
  Object.keys(files).forEach(file => {
    const thisFile = {...files[file]};
    const parts = file.split(path.sep) || [];
    const collection = parts[0] === 'collections' && parts[1];
    const section = parts[1] && parts[0];
    const fileName = parts[1];
    delete files[file];

    if (collection) {
      return (files[collection] = files[collection]
        ? [...files[collection], thisFile]
        : [thisFile]);
    }

    if (section) {
      return (files[section] = files[section]
        ? {...files[section], [fileName]: thisFile}
        : {[fileName]: thisFile});
    }

    return (files[fileName] = thisFile);
  });

  return files;
};

/**
 * Convert & restructure file objects into Jdown objects
 *
 * @returns A metalsmith Plugin
 */
const transformContent = () => {
  const transform: Plugin = (files, _, done) => {
    removeUnwanted(files);
    populateProperties(files);
    rename(files);
    group(files);
    return Promise.resolve(done());
  };

  return transform;
};

export default transformContent;
