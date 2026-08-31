# 守幕圣所（veil-sanctum）环境包 — 包体报告

日期：2026-08-12 · 交付方：Kimi / K3（3D 美术技术） · 管线：程序化低模 + 章节共享图集 + GLB + Three.js 0.178（与前两章完全一致）

## 1. 结论

**10 件全部通过 Three.js 实机验证（217/217 PASS，含 raycast 点击冒烟、emissive 白名单门禁、浮空件贴地豁免与中心原点检查、manifest 交叉 sanity）；shenghui / anvil-frontier 回归各 216/216 无退化。** 本章合计 145.7 KB / 1,425 tris，远低于 1–2MB 目标。本章恢复旧金（宗教语义部位：神座饰带、火盆沿环半圈、柱顶残线），emissive 白名单两件（statue-base 断口污火缝、corrupted-brazier 污火炭床），冷紫污火 intensity 1.3（压低于圣辉炭火 1.5）。

## 2. 逐件规格表

| id | tris | bytes | 长×深×高 (m) | min.y | footprint | blocksMovement | interactable | anchors | occupancy |
|---|---|---|---|---|---|---|---|---|---|
| statue-base | 360 | 31,364 | 0.700×0.700×1.501 | 0.000 | [1,1] | true | true | — | full-block |
| corrupted-brazier | 346 | 30,548 | 0.551×0.551×0.947 | +0.002 | [1,1] | true | true | FxFlame | full-block |
| stone-steps | 72 | 9,360 | 1.213×1.282×0.450 | 0.000 | [1,1] | false | false | — | floor |
| floating-shard-a | 44 | 7,712 | 0.773×0.683×0.594 | 浮空* | [1,1] | false | false | — | decor |
| floating-shard-b | 16 | 5,692 | 0.364×0.358×0.403 | 浮空* | [1,1] | false | false | — | decor |
| black-bush | 25 | 6,856 | 0.398×0.375×0.472 | +0.008 | [1,1] | false | false | — | half |
| black-tree | 148 | 15,188 | 1.171×0.835×2.353 | 0.000 | [1,1] | true | false | — | full-block |
| ritual-ring | 132 | 13,172 | 1.314×1.314×0.020 | +0.010 | [1,1] | false | true | — | floor |
| veil-pillar | 116 | 12,888 | 0.518×0.500×2.200 | 0.000 | [1,1] | true | false | — | full-block |
| fallen-bell | 166 | 16,384 | 1.096×1.019×0.631 | +0.002 | [1,1] | true | true | — | full-block |
| **本章合计** | **1,425** | **149,164 (145.7 KiB)** | | | | | | | |
| **三章总计** | **5,437** | **527,208 (514.9 KiB)** | shenghui 2,286 / 210,480 B + anvil 1,726 / 167,564 B + 本章实测 | | | | | | |

\* 浮空件：原点 = bbox 几何中心（验证器豁免贴地，查中心偏移 ±0.08，实测 0.000）；manifest 含 `"floating": true, "hoverAmplitude": 0.05` 扩展字段。

全部件：1 mesh / 1 材质 / 1 draw call、无动画无骨骼、贴图内嵌（本章 512 图集 2.9KB + emissive 伴侣图集 1.5KB）、Y-up、非浮空件 min.y∈±0.02、visualScale=1.0、license=procedural (K3)。本章两个材质：VeilStone（8 件，无 emissive）+ VeilTaint（statue-base / corrupted-brazier，emissive 污火图集，strength 1.3）。

## 3. 造型要点

- **statue-base**：两级石台 + 四角壁柱 + 旧金饰带（z≈1.04）+ 顶板 + 6 条紫黑爬纹（两段折线细盒，微凸台面，taint/taint_dark）+ 顶部脚位残桩（双脚盒 + 错位双踝桩，stone_dark 断面——"女神不在"）+ 2 条 taint_fire emissive 断缝。
- **corrupted-brazier**：shenghui 三足盆克隆黑化——盆体外壁后半圈 blackwood/taint_dark 交替、内壁全污、沿环半 gold_old 半 taint（残金被污痕吞没的分界）、横撑黑木化、炭床 taint_fire 冷紫 emissive + 污炭块，FxFlame 挂点。
- **stone-steps**：4 级递减台阶（末级半宽缺角）+ 缺角碎块 + 散落碎块，72 tris。
- **floating-shard-a/b**：5 边 / 4 边双锥台主体（微倾），stone_cold + taint 脉络面；a 伴生 2 小碎盒。原点几何中心归零。
- **black-bush**：5 根外撇 4 边尖刺（blackwood/blackwood_mid）+ 底座扇面，25 tris 近黑剪影。
- **black-tree**：3 干段 + 5 枝（rotation_difference 定向贴干）+ 4 尖梢 + 2 根爪 + 1 条 taint 细脉，148 tris，比前两章枯树更扭曲、近黑。
- **ritual-ring**：12 边双环刻槽（外带 stone_dark / 内槽 shadow）+ 心盘 + 6 块残缺符文平盒（2 块 taint 色），h 0.020m。
- **veil-pillar**：shenghui 柱克隆——环带色自底向顶 taint_dark→taint→stone_cold→stone_mid（下半截侵蚀渐变）+ 中段单侧错位 + 顶部断裂参差 + 仅存 1 条细 gold_old 残线 + 剥落块。
- **fallen-bell**：8 边锥台钟体侧倒（bronze_dark，钟口朝 (-x,+y) 镜头向，沿自定义轴手排 ring）+ 沿口端面 + 暗内膛 + 2 裂缝暗条 + 钟锤小筒 + 残钟梁 + 2 碎块，166 tris，贴地归一。

## 4. 验证摘要（three-test.log，217/217 PASS）

- 逐件：GLTFLoader 解析、根节点命名、1 mesh / 1 材质 / 1 draw call、tris 预算（地板件 steps/ring ≤200 放宽下限 30；浮空 b ≤80；灌木 ≤50；黑树 ≤150）、bbox 预算、无动画无骨骼、贴图内嵌。
- **emissive 白名单门禁**：仅 statue-base / corrupted-brazier 允许 emissiveMap，intensity 按 spec 数值校验 1.3±0.2（检查从写死 1.5 改为按 spec.emissive 数值，shenghui 两件保持 1.5 不变）；其余 8 件断言无 emissiveMap 且无自发光色。
- **浮空件新检查**：豁免 min.y 贴地，改查 bbox 中心≈原点（±0.08，实测 0.000）；manifest 断言 `floating===true` 且 `hoverAmplitude` 非空。
- **raycast 冒烟**：等距 5 射线 10 件均可命中（含贴地刻环与浮空碎石）。
- **manifest sanity**：14 必填字段齐全、tris/bytes 与 GLB 实测一致、bbox 落入声明 footprint×1.5m、blocksMovement⇔occupancy 语义一致。
- **跨章回归**：shenghui 216/216、anvil-frontier 216/216，验证器改动（emissive 数值化 + 浮空分支）无退化。

## 5. 渲染验收（previews/）

单件 800×800 等距 ×10 + `lineup-iso.png` 全员合影（两排摆位，浮空碎石按 lineup.json 第 4 元素 z 抬高 1.0/1.1m 展示——k3_render_env.py 新增可选 z 支持，向后兼容 [name,x,y,"path"] 旧格式）。自评：合影距离下全员一眼识别——**紫黑爬纹神座 + 冷紫污火火盆 + 黑化植被构成明确的"污染圣所"语义**，与 shenghui 干净暖金宗教、anvil 锈橙工业一眼可分；污火冷紫与圣辉橙火色温截然不同。lineup.json 摆位：back 排 pillar/tree/statue/brazier/bell，front 排 ring/steps/shard-a/bush/shard-b。

## 6. 自改记录（1 轮，修复后复验）

1. 初版构建后：corrupted-brazier min_z −0.0017 穿地（腿外撇所致，加贴地归一 → +0.002）；stone-steps 散落碎块使宽度 1.367m 超预算上限 1.30（碎块内移 → 1.282m）→ 全量重建（避免 build-summary.json 被单件构建覆盖）后 217/217 一次通过。
2. 渲染评审一轮通过：污染语义、污火色温、黑化剪影均达验收线，未触发造型返工。

## 7. 遗留问题

1. glTF Validator 未跑（本机离线），正式合并前建议补验（同前两章批次）。
2. **fallen-bell 钟口朝向**：单件 iso 相机方位固定，钟口 (-x,+y) 朝镜头对侧，单件预览读作"圆顶棕块"；合影与游戏内等距视角下侧倒姿态 + 裂缝 + 残钟梁可读。如需更强单件剪影，可把钟轴方位角参数化。
3. **black-bush 底座扇面**在极低视角下呈薄片状（fan_cap 单面），建议接入层避免贴地平拍；或后续把底座改为双层环。
4. 浮空件 hoverAmplitude=0.05 为建议初值，运行时悬浮动画（正弦周期/相位随机化）由接入层实现，模型侧无动画轨道（无动画断言已锁死）。
5. statue-base 的 taint_fire 断缝与 VeilTaint 材质绑定（整件 1 draw call），若运行时需对断缝独立做闪烁，建议在着色层按 emissive 图集 UV 区域处理，无需拆件。

## 8. 复跑链

```
python scripts/gen_atlas_veil.py                                      # 本章图集 + 色格（17 cells）
"$B" -b --factory-startup -P scripts/k3_build_env_veil.py -- <root>   # 构建+导出+summary
python scripts/k3_gen_manifest_veil.py <root>                         # manifest（含 floating 扩展字段）
"$B" -b --factory-startup -P scripts/k3_render_env.py -- <models_dir> <previews_dir>
node env-verify.mjs <models_dir> <log_path> [chapter]                 # 于 goddess-fall-web；chapter 可省略（按路径推断）
```
