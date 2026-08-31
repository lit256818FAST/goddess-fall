# 小兵资产批次报告

日期：2026-08-22

本批使用共享 26 骨架与 `img2threejs` 可复现脚本，新增五类轻量敌人。每个模型为单材质、程序化低模、内嵌 GLB，失败时回退至 `procedural-enemy-v1`。

| 类型 | 职能 | 运行时模型 | 体积 | 动作 |
|---|---|---|---:|---|
| 盾卫 | 拦截、占位、近战防线 | `shield-guard.glb` | 61 KB | idle / move / attack_health / hit_health / death_health |
| 斥候 | 高移动力、侧翼追击 | `scout.glb` | 61 KB | idle / move / attack_health / hit_health / death_health |
| 信仰术士 | 信念攻击、远程压制 | `faith-acolyte.glb` | 65 KB | idle / move / attack_faith / hit_health / death_health |
| 工程兵 | 机关、锤击、地形干扰 | `engineer.glb` | 64 KB | idle / move / attack_health / hit_health / death_health |
| 掠骑 | 高机动、粮路袭扰 | `raider-rider.glb` | 67 KB | idle / move / attack_health / hit_health / death_health |

接入规则：战斗单位可通过 `UnitTemplate.visualKey` 指定职业视觉；规则层不依赖模型加载。无指定时保留旧的 `e3 → cultist-melee` fallback，保证旧存档和支线兼容。

验证：`npm run verify:minion-assets`、`npm run verify:mainline-runtime`、`npm test -- --run` 均通过。五个小兵总增量约 315 KB。
