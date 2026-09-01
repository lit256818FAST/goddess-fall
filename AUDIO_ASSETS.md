# 音频资源与场景台账

项目的声音由三部分组成：

1. 用户提供的 MP3 场景音乐库（启动、主页、剧情、战斗与 Boss），按场景懒加载；
2. 原有 OpenGameArt CC0 OGG、项目代码原创 WAV 与程序化结算音乐层，作为回退；运行时 WAV 采用 16kHz 单声道以控制网页包体。
3. `art-source/legacy-audio/` 保存了重新压缩前的旧 WAV 版本，便于以后替换或重新导出。

OGG 只在场景首次使用、且用户通过点击或键盘操作解锁浏览器声音后请求。
`Audio` 元素使用 `preload="none"`，不会随首页一次性下载全部音乐。

本地 CC0 许可证：
`public/assets/audio/LICENSE-CC0-1.0.txt`

## 场景映射

| 场景 | 稳定 source 标识 | 实现 | 听感与用途 |
|---|---|---|---|
| 启动标题 | `/assets/audio/music-lazy/Archive%20Gate.mp3` | 用户提供 MP3，懒加载 | 标题入口；旧主页音乐保留为回退 |
| 主页 / 路线 / 阵容 / 战前准备 | `/assets/audio/music-lazy/Lantern%20Map.mp3` | 用户提供 MP3，懒加载 | 地图、路线与整备循环 |
| 剧情 | `/assets/audio/music-lazy/Lantern%20Map_1.mp3` | 用户提供 MP3，按文本情绪切换 | 温暖、悲伤、激动段落分别切换备用曲 |
| 普通战斗 | `/assets/audio/music-lazy/Shadow%20Council%20March.mp3` | 用户提供 MP3，懒加载 | 主线战斗；无旗支线用 `Abyss%20Gatefall_1.mp3` |
| Boss | `/assets/audio/music-lazy/Shadow%20Council%20March_1.mp3` / `Abyss%20Gatefall.mp3` | 用户提供 MP3，按阶段切换 | 第一阶段 / 第二阶段 |
| 胜利结算 | `procedural:result-victory` | Web Audio 原创循环乐句 | 上行四音、明亮持续和声；持续到离开结算 |
| 失败结算 | `procedural:result-defeat` | Web Audio 原创循环乐句 | 下行四音、低频持续和声；持续到离开结算 |

`src/audio/AudioManager.ts` 中的 `SCENE_AUDIO` 是上述映射的唯一运行时合同。
每次请求、开始、实际播放或文件失败回退都会派发 `goddess:audio-scene`
浏览器事件，并把当前场景、source 和状态同步到 `.audio-controls` 的
`data-audio-scene`、`data-audio-source`、`data-audio-state`，供自动化验收。

## Unsolved Investigation

- 作者：isaiah658
- 官方页面：https://opengameart.org/content/unsolved-investigation
- 官方文件：https://opengameart.org/sites/default/files/Unsolved-Investigation-isaiah658_0.ogg
- 原始文件名：`Unsolved-Investigation-isaiah658.ogg`
- 本地文件：`public/assets/audio/music-lazy/unsolved-investigation.ogg`
- 本地大小：2,200,350 bytes
- 许可证：CC0 1.0 Universal
- 用途：旧主页回退音乐（当前主页主曲为 `Lantern Map`）

## 原创程序化音乐

当前场景音乐由项目代码生成并以 WAV 播放；胜利与失败仍由 Web Audio 实时合成。
只使用浏览器的 oscillator、gain 与定时器节点，没有复制、嵌入或派生任何
第三方旋律、录音、SoundFont 或采样，因此没有新增第三方授权义务。

- `procedural:story-archive`：43.65Hz 与 65.41Hz 的缓慢双音持续层。
- `procedural:result-victory`：98Hz/146.83Hz 和声底，加
  196/246.94/293.66/392Hz 上行循环乐句。
- `procedural:result-defeat`：41.2Hz/55Hz 和声底，加
  82.41/73.42/61.74/55Hz 下行循环乐句。

结算仍保留短提示音作为入场重音，但提示音不再承担整个结算音乐。

## 加载、回退与体积

- 主页 CC0 OGG 保留；原创 WAV 由场景按需加载，不会随启动页全部请求。
- 16kHz 导出后，运行时音频约 9.18 MiB；旧版本保存在 `art-source/legacy-audio/`，不进入发布包。
- 场景切换使用短淡入淡出；离开场景会停止对应节点或循环。
- OGG 解码、网络或播放失败时自动回退到对应场景的 Web Audio 环境层。
- 音量、静音和偏好持久化继续使用 `goddess-fall:audio:v1`。
- 浏览器自动播放限制通过首次指针或键盘交互解锁，不主动绕过浏览器策略。

## 待选音乐试听库（2026-08-22）

用户提供的 10 首 MP3 已解压到 `art-source/audio-inbox/`，暂不进入发布包，也没有替换现有场景音乐。该目录包含：

- `音频试听目录.html`：可双击打开并逐首试听；
- `音频分类建议.md`：按启动、主页、剧情、普通战斗、政治压力、Boss 的第一轮分组；
- 10 首原始 MP3（含每首的 `_1` 备用版本）。

解压后约 50.4 MiB。确定曲目后再复制到运行时资源，并按“首屏核心音乐 + 其他场景懒加载”接入，避免突破首次可玩包体目标；现有音乐继续保留为 fallback。

## 已确认的运行时分配

已将 10 首曲目复制到 `public/assets/audio/music-lazy/`，使用 `preload="none"` 按场景请求：

| 场景 | 运行时主曲 | 备用/阶段 |
|---|---|---|
| 启动标题 | `Archive Gate` | 原有主页音乐作为回退 |
| 主页、战斗路线、阵容、战前准备 | `Lantern Map` | `Lantern Map_1` 用于剧情备用 |
| 剧情 | `Lantern Map_1` | 温暖段落使用 `Archive Gate_1`；悲伤段落使用 `Ashes on the Map` / `_1`；激动过渡使用 `Shadow Council March` |
| 藏书馆、档案 | `Archive Gate_1` | 原有档案/藏书馆 WAV 作为回退 |
| 普通战斗（主线） | `Shadow Council March` | 无旗使团支线使用 `Abyss Gatefall_1` |
| Boss 第一阶段 | `Shadow Council March_1` | — |
| Boss 第二阶段 | `Abyss Gatefall` | — |

`src/audio/AudioManager.ts` 的 `sceneTrackFor()` 是分配合同；Boss 阶段切换和无旗使团战斗会自动选择对应曲目。由于压缩包未附授权说明，台账将这些曲目标为 `user-provided`，正式公开部署前请确认你拥有或获得了相应使用权。
