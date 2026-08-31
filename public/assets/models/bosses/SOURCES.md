# Boss 运行时模型来源

这三项资源只在相应 Boss 战中按需加载。所有外部模型均保留原始动画和内嵌贴图；项目仅通过 manifest 调整缩放、朝向、动作别名及回退路径。

## 奥德里克（`odric-judgment.glb`）

- 来源：项目内已验收的奥德里克正式角色 GLB 副本。
- 制作基座：Quaternius Ultimate Animated Character Pack，CC0 1.0。
- 项目修改：角色造型与动作整理；Boss manifest 放大轮廓并配置阶段动作。
- SHA-256：`3BBDD0B0434B6E494933EE31EDA11A73B50AFEF60E24EE3F0AA4A807A21EBA1F`
- 运行时回退：`/assets/models/heroes/odric.glb`，再失败则使用程序化模型。

## 铁窗壁垒（`iron-bulwark.glb`）

- 来源：KayKit Character Pack: Adventurers 1.0，`Barbarian.glb`。
- 作者：Kay Lousberg（KayKit）。
- GitHub：https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
- 固定版本：commit `672074b7`。
- 许可证：CC0 1.0；原文见同目录 `LICENSE-KAYKIT-CC0.txt`。
- SHA-256：`CEFC311A0E10C7858B6141F5ADA7E33268727564FB8AC1347AAB97D000669CC6`
- 运行时回退：K3 红衣教团近战模型，再失败则使用程序化模型。

## 守幕圣像（`veiled-avatar.glb`）

- 来源：项目内已验收的阿格尼丝正式角色母版，制作基座为 Quaternius Ultimate Animated Character Pack。
- 作者：Quaternius。
- 官方来源：https://quaternius.com/packs/ultimatedanimatedcharacter.html
- 许可证：CC0 1.0；原始许可证保存在 `vendor-staging/quaternius-ultimate-animated-character/License.txt`。
- 项目修改：去除手持卷轴和预览底座；重制为炭黑、石灰、暗红与旧金配色；增加八芒旧金圣像光环；保留正式共享动作集。
- 可复现源：`art-source/free-asset-handshake/build_veiled_boss.py` 与 `art-source/free-asset-handshake/bosses/veiled-avatar.blend`。
- SHA-256：`7748F69FC49FF426485BCADC3296972FB9BDEFFF260D6197D0413ED3FA1299A6`
- 视觉复核：2026-07-31 以 1440×1024 实机同机位重新截图；炭黑、石灰、暗红与旧金为主色，未保留童话礼盒或鲜艳玩具式配色。
- 运行时回退：塞拉菲娜正式模型，再失败则使用程序化模型。
