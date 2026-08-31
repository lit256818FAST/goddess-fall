# Milestone A 美术母版

本目录保存主页地图与三张角色卡的无损 PNG 母版，不参与 Vite 的 `public/` 发布流程。

浏览器实际使用的压缩资产位于 `public/assets/images/`：

- `campaign-route-map.webp`
- `portrait-unflagged.webp`
- `portrait-seraphina.webp`
- `portrait-reina.webp`

将母版移出 `public/` 是为了避免把约 9.8MB 的制作源文件复制进 `dist/`。母版没有删除，后续重新裁切或压缩应从本目录读取。
