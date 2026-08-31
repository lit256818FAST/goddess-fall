# 第三方美术资源台账

本项目只允许使用来源明确、可追溯且允许游戏内再分发的资源。原始下载包存放于
`vendor-staging/`，修改后的 Blender 母版与握手样板存放于
`art-source/free-asset-handshake/`。这些工作文件不会被网页运行时加载。

## Quaternius — Universal Base Characters

- 官方页面：https://quaternius.com/packs/universalbasecharacters.html
- 官方下载来源：Quaternius 官方 itch.io 下载页
- 下载日期：2026-07-23
- 原始文件名：`Universal Base Characters Standard.zip`
- 本地文件大小：128,968,391 bytes
- 许可证：CC0 1.0 Universal（公共领域贡献）
- 本地许可证：
  `vendor-staging/quaternius-universal-base-characters/extracted/Universal Base Characters[Standard]/License_Standard.txt`
- 当前用途：`unflagged-handshake` 的人体、骨架与基础材质研究。
- 备注：Standard 免费包实际只包含 Superhero 男/女基础体；项目未声称拥有页面所列的其他付费基础体。

## KayKit — Character Animations 1.1

- 官方页面：https://kaylousberg.itch.io/kaykit-character-animations
- 官方下载来源：KayKit 官方 itch.io 下载页
- 下载日期：2026-07-23
- 原始文件名：`KayKit Character Animations Free 1.1.zip`
- 本地文件大小：14,858,957 bytes
- 许可证：CC0 1.0 Universal（公共领域贡献）
- 本地许可证：
  `vendor-staging/kaykit-character-animations/extracted/KayKit_Character_Animations_1.1/License.txt`
- 当前用途：握手样板的移动、攻击、受击与死亡动画来源。

## Quaternius — Ultimate Animated Character Pack

- 官方页面：https://quaternius.com/packs/ultimatedanimatedcharacter.html
- 官方下载来源：页面链接的 Quaternius 官方 Google Drive 公共文件夹
- 下载日期：2026-07-23
- 已下载的原始文件（Google Drive 标注为 glTF Binary，本地以 `.glb` 保存）：
  - `Ninja_Male.gltf` → `Ninja_Male.glb`，1,808,187 bytes
  - `Witch.gltf` → `Witch.glb`，2,114,096 bytes
  - `Worker_Female.gltf` → `Worker_Female.glb`，2,020,830 bytes
  - `Knight_Male.gltf` → `Knight_Male.glb`，1,852,024 bytes
  - `Soldier_Male.gltf` → `Soldier_Male.glb`，1,829,457 bytes
  - `OldClassy_Female.gltf` → `OldClassy_Female.glb`，2,103,966 bytes
- 许可证：CC0 1.0 Universal（公共领域贡献）
- 本地许可证：
  `vendor-staging/quaternius-ultimate-animated-character/License.txt`
- 当前用途：六名主角完整穿戴母版与共享动作；正式候选记录于
  `art-source/free-asset-handshake/FORMAL_SIX_REPORT.md`。
- 备注：六名正式候选已通过视觉闸门和实机验收，运行时文件位于
  `public/assets/models/heroes/`；候选母版与验证材料仍保留在 `art-source/`。

## 握手样板状态

`unflagged-handshake.glb` 与 `cultist-handshake.glb` 是基于以上 CC0 资源制作的
内部管线样板。它们已经通过 Three.js 加载、AnimationMixer 播放与
SkeletonUtils 克隆测试；正式六人资源现已通过美术与实机闸门并进入 `public`。
握手样板继续只作来源可追溯和回归参考，不会覆盖正式运行时资源。

## OpenGameArt — CC0 场景音乐

三条运行时 OGG 音乐来自 OpenGameArt 官方页面，均按页面列明的 CC0 1.0
Universal 使用。作者、官方页面、直接文件地址、原始文件名、本地大小、场景映射
与懒加载策略详见 [`AUDIO_ASSETS.md`](AUDIO_ASSETS.md)。

- 本地许可证：`public/assets/audio/LICENSE-CC0-1.0.txt`
- 运行时目录：`public/assets/audio/`
- 唯一音轨合计：6,484,486 bytes

剧情、胜利结算和失败结算使用本项目代码原创生成的 Web Audio 音乐层，
不含第三方录音、采样或音色库，因此没有新增第三方授权项。程序化 source
标识、频率设计与自动化验证接口也记录在 `AUDIO_ASSETS.md`。
