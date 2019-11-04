// Native
import { isAbsolute } from 'path';

// Packages
import { resolve } from 'app-root-path';
import { devServer } from './multiDevServ';

export async function prepareNext(directory: string[] | string, port?: number) {
  if (!directory || !directory.length) {
    throw new Error('Renderer location not defined');
  }

  if (!Array.isArray(directory)) {
    directory = [directory];
  }
  const directories = directory.map(item =>
    isAbsolute(item) ? item : resolve(item),
  );

  return await devServer(directories, port, () => {
    console.info(`Listening ${port}`);
  });
}

(async function main() {
  await prepareNext(['./A', './B']);
})();
