# 战斗动画模板

本轮以 Three.js `AnimationMixer` 播放 GLB 动作，以代码模板补足低成本的命中与职业反馈。模板不依赖贴图或第三方特效库，随场景释放几何体和材质，默认 260–620ms；`prefers-reduced-motion` 时跳过。

| 模板 | 触发 | 表现 | 适用对象 |
| --- | --- | --- | --- |
| `moveDust` | 移动开始/结束 | 三个低模尘屑圆片淡出 | 主角、小兵、Boss |
| `healthSlash` | 生命攻击/物理技能 | 朝攻击方向的暖色斩击弧 | 盾卫、斥候、骑手、亚瑟等 |
| `healthImpact` | 生命命中 | 红色冲击环与两枚撞击楔 | 所有生命攻击 |
| `faithBurst` | 信念攻击 | 金色外环、蓝白内环、短光柱 | 侍从、塞拉菲娜、阿格尼丝、湖都双核 |
| `skillPulse` | 非伤害技能/辅助技能 | 角色脚下脉冲环与旋转菱晶 | 护持、侦察、鼓舞、修复 |
| `deathBurst` | 阵亡 | 阵亡格暗色退场环 | 友军、敌军、Boss |

技能动作现在通过 `BattleAnimation { type: "skill" }` 统一进入 `Battlefield`，因此亚瑟、汉斯、阿斯诺卡与六名支线角色的技能不会再只改变数值而没有画面反馈。GLB 中存在的 `idle/move/attack/hit/death/skill` 仍由正式动作驱动，模板只负责空间反馈和层次感。

参考实现采用 Three.js 官方的 GLTFLoader/AnimationMixer 与 skinning 组织方式：

- [Three.js GLTF loader 示例](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_loader_gltf.html)
- [Three.js skinning 示例](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_tsl_skinning.html)
