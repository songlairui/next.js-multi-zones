// Native
import { join, isAbsolute, normalize } from 'path';

// Packages
import { app, protocol } from 'electron';
import isDev from 'electron-is-dev';
import { resolve } from 'app-root-path';
import { devServer } from './multiDevServ';

// TODO build 支持多入口
const adjustRenderer = (directories: string[]) => {
  const paths = ['/_next', '/static'];
  const isWindows = process.platform === 'win32';

  protocol.interceptFileProtocol('file', (request, callback) => {
    let path = request.url.substr(isWindows ? 8 : 7);

    for (const prefix of paths) {
      let newPath = path;

      // On windows the request looks like: file:///C:/static/bar
      // On other systems it's file:///static/bar
      if (isWindows) {
        newPath = newPath.substr(2);
      }

      if (!newPath.startsWith(prefix)) {
        continue;
      }

      // Strip volume name from path on Windows
      if (isWindows) {
        newPath = normalize(newPath);
      }

      newPath = join(directories[0], 'out', newPath);
      path = newPath;
    }

    // Electron doesn't like anything in the path to be encoded,
    // so we need to undo that. This specifically allows for
    // Electron apps with spaces in their app names.
    path = decodeURIComponent(path);

    callback(path);
  });
};

export default async (directory: string[] | string, port?: number) => {
  if (!directory || !directory.length) {
    throw new Error('Renderer location not defined');
  }

  if (!Array.isArray(directory)) {
    directory = [directory];
  }
  const directories = directory.map(item =>
    isAbsolute(item) ? item : resolve(item),
  );

  if (!isDev) {
    adjustRenderer(directories);
    return;
  }

  return await devServer(directories, port, server => {
    app.on('before-quit', () => server.close());
  });
};
