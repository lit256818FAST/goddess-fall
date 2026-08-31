# 3D 模型库存

这里保存项目的 GLB 模型、manifest、来源说明和许可证文件。

这些文件不在 `public/` 内，因此不会被主游戏的 Vite 构建复制，也不会被战斗运行时请求。需要检查模型时执行：

```bash
npm run build
npm run build:gallery
```

`build:gallery` 会把本库存复制到可选的 `dist/model-inventory/`，供独立的 `model-gallery.html` 使用；主游戏仍使用 2D 立绘或程序化模型 fallback。
