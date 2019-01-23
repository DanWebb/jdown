import path from 'path';
import {Plugin} from 'metalsmith';

const transfomBufferToString = () => {
  const transform: Plugin = (files, _, done) => {
    Object.keys(files).forEach(file => {
      if (file.includes('.DS_Store') || file.includes(`assets${path.sep}`)) {
        return;
      }

      files[file].contents = files[file].contents.toString('utf8');
    });

    return Promise.resolve(done());
  };

  return transform;
};

export default transfomBufferToString;
