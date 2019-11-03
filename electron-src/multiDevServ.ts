// Native
import { createServer, Server } from 'http';
import { parse } from 'url';

// Packages
import next from 'next';
import * as fs from 'fs';
import * as path from 'path';

export const findLastIndex = function(this: any[], fn: any) {
  const tmpArr = [...this].reverse();
  const idx = tmpArr.findIndex(fn);
  if (idx === -1) {
    return -1;
  }
  return tmpArr.length - 1 - idx;
};

export const findPrefixss = (dirs: string[]) =>
  dirs.map(dir =>
    fs
      .readdirSync(`${dir}/pages`)
      .filter(dir => !dir.startsWith('.'))
      .map(dir => `/${path.basename(dir, path.extname(dir))}`),
  );

export const devServer = async (
  dirs: string[],
  port?: number,
  callback?: (server: Server) => any,
) => {
  // We need to load it here because the app's production
  // bundle shouldn't include it, which would result
  // in an error

  const pathPrefixss = findPrefixss(dirs);

  const nextInsts = dirs.map(dir => next({ dev: true, dir }));
  const requestHandlers = nextInsts.map(inst => inst.getRequestHandler());

  // Build the renderer code and watch the files
  await Promise.all(nextInsts.map(inst => inst.prepare()));

  // But if developing the application, create a
  // new native HTTP server (which supports hot code reloading)
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    const { pathname } = parsedUrl;
    let targetIdx = -1;
    if (pathname) {
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
