import type { StoryChapter } from "./types";
import {veiledDawnExpansionNodes} from "./chapterVeiledDawnExpansion";
import {veiledDawnRequiredStoryNodes} from "./chapterRequiredStory";

const evidenceAll = ["lamp_oil_ledger", "cold_ash", "broken_wrench"] as const;

export const veiledDawnChapter: StoryChapter = {
  id: "veiled-dawn",
  title: "第三章：帷幕后之光",
  subtitle: "能被证明的是装置、谎言与选择，不是神本身。",
  artwork: {
    src: "/assets/images/chapter-veiled-dawn.webp",
    alt: "雾门深处帷幕与无名圣像交叠的幽暗光景",
  },
  startNodeId: "mist-guests",
  actionNodeIds: ["mist-guests", "silent-march", "three-chains", "final-battle"],
  nodes: {
    "mist-guests": {
      id: "mist-guests",
      kind: "dialogue",
      title: "雾中的来客",
      lines: [
        { text: "阿格尼丝带着被删改的抄本走出雾门。名册记录的不是罪行，而是被要求反复自证内心的人。" },
        { speakerId: "agnes", emotion: "doubt", text: "我没有因为逃走就失去信仰。我只是拒绝让审查者替我描述内心。" },
      ],
      choices: [
        { id: "offer-rest", label: "让伤员休整后再护送档案", hint: "保留体力，但雾门守卫会完成部署。", effects:{setFlags:["agnes_restored_witnesses"],statChanges:{civilianSafety:6}},next: "veiled-letter-at-dusk" },
        { id: "negotiate-passage", label: "要求守卫公开通行条件", hint: "留下谈判记录，敌方意图仍会公开。", effects:{setFlags:["agnes_negotiated_passage"],statChanges:{goddessTrust:1}},next: "veiled-letter-at-dusk" },
      ],
    },
    ...veiledDawnExpansionNodes,
    ...veiledDawnRequiredStoryNodes,
    "silent-march": {
      id: "silent-march",
      kind: "battle",
      battleId: "silent-march",
      title: "无声行军",
      briefing: "护送禁抄本穿过雾门。信念型敌人会优先攻击携带档案的同伴。",
      objectives: ["护送档案通过三处雾门", "保住阿格尼丝的抄本", "击退无声追兵"],
      victoryNext: "three-chains",
      defeatNext: "three-chains",
    },
    "three-chains": {
      id: "three-chains",
      kind: "dialogue",
      title: "三条证据链",
      lines: [
        { text: "守灯账簿证明圣火需要人工补给；无温余烬证明幻光掩盖了熄灭时间；折断的扳手证明嫁祸来自本地工坊。三条链彼此咬合，却都没有回答光最初为何被称为神迹。" },
        { speakerId: "reina", emotion: "doubt", text: "我能解释容器、燃料和伪造，不能把无法测量的部分直接判成不存在。" },
        { speakerId: "seraphina", emotion: "resolve", text: "我也不能因为仍有空白，就允许制度替女神说话。" },
      ],
      choices: [
        {
          id: "submit-complete-chain",
          label: "提交三件证物，要求公开检验",
          hint: "证据路线：无需让圣像替任何一方裁决。",
          condition: { evidenceAll: [...evidenceAll] },
          effects: { setFlags: ["completed_three_witnesses", "chose_evidence"] },
          next: "final-battle",
        },
        {
          id: "open-vessel",
          label: "拆开圣像容器，保存每一个机械部件",
          hint: "生命路线：进入两阶段战斗，以物理结构结束裁决。",
          effects: { setFlags: ["chose_vessel"] },
          next: "final-battle",
        },
        {
          id: "answer-with-faith",
          label: "让塞拉菲娜质问信仰为何需要一座武器",
          hint: "信念路线：进入两阶段战斗，从共同确信处解除圣像。",
          effects: { setFlags: ["chose_faith"] },
          next: "final-battle",
        },
      ],
    },
    "final-battle": {
      id: "final-battle", kind: "battle", battleId: "veiled-avatar", title: "Tier 3 Boss：守幕圣像",
      briefing: "击破裁决外壳后，圣像会展开无名光室；生命与信念核心同时成为可见目标。",
      objectives: ["击破裁决外壳", "以所选路线解除无名光室", "保住三方见证人"],
      victoryNext: "first-night-without-the-statue", defeatNext: "failure-ending",
    },
    "final-resolution": {
      id: "final-resolution",
      kind: "dialogue",
      title: "光室停止以后",
      lines: [{ text: "守幕圣像停止裁决。使团必须按进入圣所前选择的方式处理容器与见证。" }],
      choices: [
        { id: "record-evidence", label: "公开三件证物及其仍未回答的问题", condition: { flagsAll: ["chose_evidence"], flagsNone: ["chose_vessel", "chose_faith"] }, next: "truth-ending" },
        { id: "record-vessel", label: "封存并公开所有机械残件", condition: { flagsAll: ["chose_vessel"], flagsNone: ["chose_evidence", "chose_faith"] }, next: "order-ending" },
        { id: "record-faith", label: "记录信念解除裁决的全过程", condition: { flagsAll: ["chose_faith"], flagsNone: ["chose_evidence", "chose_vessel"] }, next: "truth-ending" },
      ],
    },
    "truth-ending": {
      id: "truth-ending", kind: "ending", endingId: "truth", title: "结局：无人垄断的黎明",
      lines: [
        { text: "三件证物被同时公开。人们知道圣火曾被维护、伪装与利用，却没有人获得证明女神存在或不存在的最后一句话。" },
        { speakerId: "the_unflagged", text: "不确定不是空白。它只是拒绝让权力替所有人写完答案。" },
      ],
      summary: "证据成为公共记录，圣所失去独占解释的权力；信仰与怀疑都必须在没有最终裁决的世界里继续生活。",
    },
    "order-ending": {
      id: "order-ending", kind: "ending", endingId: "order", title: "结局：被拆开的容器",
      lines: [
        { text: "守幕圣像被逐件拆解，所有齿轮和光管都有编号。仍有人在空下来的穹顶祈祷，也有人把光只称为工程。" },
        { speakerId: "reina", emotion: "doubt", text: "机器已经解释完了。人们为何在这里听见回答，还没有。" },
      ],
      summary: "裁决装置被永久停用，三国共同保管残件；女神的真实性没有被机械结构替代。",
    },
    "failure-ending": {
      id: "failure-ending", kind: "ending", endingId: "failure", title: "结局：带出帷幕的见证",
      lines: [
        { text: "使团没能让圣像停下，但见证人带着三份互相印证的抄本离开。圣所仍亮着，光却再也无法只拥有一种解释。" },
      ],
      summary: "战斗失败，证据链仍被保全并公开；第一季以未完成的检验结束，而非以神谕定案。",
    },
  },
};

export default veiledDawnChapter;
