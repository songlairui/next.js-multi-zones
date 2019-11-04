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

export const parsePathnameWithAssetPrefix = (
  pathname: string,
  prefix = '/_m_',
) => {
  const len = prefix.length;
  const subSlashIdx = pathname.indexOf('/', len);
  const idx = parseInt(pathname.slice(len, subSlashIdx)) || 0;
  const subPath = pathname.slice(subSlashIdx);
  return { idx, subPath };
};
