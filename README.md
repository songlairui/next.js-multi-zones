# Electron with Multi Next Instance

> Typescript

## Main at electron-next.ts

## Usage

### 开发

```
yarn build-electron # 输出 main 文件夹
yarn dev:web
```

### 运行

```
yarn build-electron # 输出 main 文件夹
yarn build:web
yarn start:web
```

## 参考

官方文档: https://nextjs.org/docs#multi-zones  
官方 zones example: https://github.com/zeit/next.js/tree/canary/examples/with-zones  
演示: https://with-zones.songlairui.now.sh/  

## Next App 之间跳转

**重要的变化**: 当跨实例跳转时 `<Link href='/site/B/path'/>` 需要改成 `<a href='/site/B/path'/>`

因此 跨实例跳转之后, 跳转走的实例状态清空

### Possible way

- 两个实例挂载在同一个 HTML 中，分别挂载 `#root_1` `#root_2`
- 实例允许嵌套, \_document.js 中嵌套两个实例
