// Native
import { join, isAbsolute, normalize } from 'path';

// Packages
import { app, protocol } from 'electron';
import isDev from 'electron-is-dev';
import { resolve } from 'app-root-path';
import { findPrefixss, parsePathnameWithAssetPrefix } from './utils';

const relativePath = join(__dirname, '..');
const isInnerLink = (str: string) => str.startsWith(relativePath);
// TODO build 支持多入口
const adjustRenderer = (directories: string[]) => {
  const paths = ['/_next', '/static'];
  const isWindows = process.platform === 'win32';

  const pathPrefixss = findPrefixss(directories);
  const targetDirMap = pathPrefixss.reduceRight(
    (result, current, idx) => {
      current.forEach(str => {
        if (result[str] === undefined) {
          result[str] = directories[idx];
        }
      });
      return result;
    },
    {} as any,
  );

  protocol.interceptFileProtocol('file', (request, callback) => {
    let path = request.url.substr(isWindows ? 8 : 7);
    // de-set assetPrefix
    // /about       `/_m_0/_next` => `/_next`
    if (!path || path === '/') {
      path = join(directories[0], 'out/index.html');
    } else if (path.startsWith('/_m_')) {
      const { idx, subPath } = parsePathnameWithAssetPrefix(path);
      path = join(directories[idx], 'out', subPath);
    } else {
      // index.html   `...A/out/_m_0/_next` => `...A/out/_next`
      path = path.replace(/_m_\d\/(_next|static)/, '$1');
      // 不能以 /Volume 开头，mac T
      if (!isInnerLink(path)) {
        // 跨 inst 跳转链接，会以应用内作为跟路径
        const subPath = `${path}/`.slice(0, path.indexOf('/', 1));
        const targetDir = targetDirMap[subPath];
        if (targetDir) {
          path = join(targetDir, 'out', `${path}.html`);
        }
      }
    }

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
  // 不可前置加载
  const { devServer } = await import('./multiDevServ');
  return await devServer(directories, port, server => {
    app.on('before-quit', () => server.close());
  });
};
