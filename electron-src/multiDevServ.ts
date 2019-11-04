// Native
import { createServer, Server } from 'http';
import { parse } from 'url';

// Packages
import next from 'next';

import {
  findPrefixss,
  parsePathnameWithAssetPrefix,
  findLastIndex,
} from './utils';

const dev = process.env.NODE_ENV !== 'production';

export const devServer = async (
  dirs: string[],
  port?: number,
  callback?: (server: Server) => any,
) => {
  // We need to load it here because the app's production
  // bundle shouldn't include it, which would result
  // in an error

  const pathPrefixss = findPrefixss(dirs);

  const nextInsts = dirs.map(dir => next({ dev, dir }));
  const requestHandlers = nextInsts.map(inst => inst.getRequestHandler());

  // Build the renderer code and watch the files
  await Promise.all(
    nextInsts.map((inst, idx) => {
      inst.prepare().then(() => {
        inst.setAssetPrefix(`_m_${idx}`);
      });
    }),
  );

  // But if developing the application, create a
  // new native HTTP server (which supports hot code reloading)
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    const { pathname } = parsedUrl;
    let targetIdx = -1;
    if (!pathname) {
      requestHandlers[0](req, res);
    } else if (pathname.startsWith('/_m_')) {
      // 渲染 /_m_x/_next 等资源
      const { idx, subPath } = parsePathnameWithAssetPrefix(pathname);
      targetIdx = idx;
      req.url = subPath;
    } else if (pathname) {
      targetIdx = findLastIndex.call(pathPrefixss, (prefixs: string[]) =>
        prefixs.some((prefix: string) => pathname.startsWith(prefix)),
      );
    }
    // 找到对应的 handler
    const targetHandler = requestHandlers[targetIdx] || requestHandlers[0];
    targetHandler(req, res);
  });

  return new Promise(r => {
    server.listen(port || 8000, () => {
      r();
      callback && callback(server);
    });
  });
};
