import type { DialogueLine, StoryChapter, StoryNode } from "./types";

type MainlineLine = DialogueLine | { stageDirection: string; text?: never };

type MainlineChapterSpec = {
  id: string;
  title: string;
  subtitle: string;
  artwork: { src: string; alt: string };
  nodeArtwork: { src: string; alt: string };
  location: string;
  battleId: string;
  battleTitle: string;
  briefing: string;
  objectives: string[];
  secondBattleId?: string;
  secondBattleTitle?: string;
  secondBriefing?: string;
  secondObjectives?: string[];
  secondOpening?: string;
  opening: string;
  choiceA: string;
  choiceB: string;
  aftermath: string;
  failure: string;
  introLines: readonly MainlineLine[];
  secondLines?: readonly MainlineLine[];
  aftermathLines: readonly MainlineLine[];
  failureLines: readonly MainlineLine[];
};

const storyLines = (lines: readonly MainlineLine[]): DialogueLine[] => lines.map((line): DialogueLine => typeof line.text === "string" ? line : { text: "", stageDirection: line.stageDirection });

const specs: readonly MainlineChapterSpec[] = [
  {
    id: "arthur-vol-1-iron-fire", title: "第一章·铁与火", subtitle: "刑场苏醒与卫道士军国", artwork: { src: "/assets/images/mainline-iron-fire.webp", alt: "刑场苏醒后通往卫道士城堡的铁与火之路" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-1-execution-turn.webp", alt: "刑场铁环落地后，亚瑟伸手救援平民的关键转折" },
    location: "卫道士军国 · 刑场边境", battleId: "arthur-execution-escape", battleTitle: "刑场逃亡", briefing: "亚瑟在处刑台上醒来。系统给出的第一个指令不是求生，而是判断谁正在把平民推向火线。", objectives: ["护送两名平民离开刑场", "在第 7 回合前关闭处刑机关"], secondBattleId: "arthur-border-blockade", secondBattleTitle: "边境堵截", secondBriefing: "逃出刑场不等于脱离军国。边境哨线已经落闸，亚瑟必须用第一枚军牌换取一条可撤回的通道。", secondObjectives: ["让亚瑟抵达东侧军牌检查点", "阻止敌方封锁三回合"], secondOpening: "军牌还带着刑场的灰。哨兵没有问你是否无辜，只问你能不能让身后的人活着通过。", opening: "铁环落地的声音先于疼痛抵达。一个陌生的界面在亚瑟眼前亮起：力量、意志、危险预警。", choiceA: "先救被押来的平民", choiceB: "先夺取卫道士的盾牌", aftermath: "你没有成为英雄，只是让三个人活过了这一段铁与火。卫道士军国因此给你一枚临时军牌。", failure: "刑场的门还是打开了。亚瑟带着伤势逃入边境，系统第一次记录了失败也能继续的事实。",
    introLines: [
      { stageDirection: "火刑场的铁环仍在发烫。约翰主教擦去鼻下的血，命令刽子手把这个来历不明的异乡人重新按回木桩。" },
      { speakerId: "arthur", emotion: "anger", text: "你拿女神当刀用，还嫌别人不肯把脖子伸过来？" },
      { stageDirection: "话音刚落，亚瑟一头撞在约翰脸上。主教鼻骨歪了，刽子手举刀。系统与女神的白光同时落下，面板只给了三点初始属性和一句警告：活下去。" },
      { speakerId: "arthur", emotion: "doubt", text: "力量三点，敏捷三点。好消息是我没死；坏消息是这点本事连个受训士兵都算不上。" },
      { stageDirection: "亚瑟赤手夺下刽子手的短棍，翻出刑场。卫道士军国的边境巡逻队恰好越境招人，听见约翰主教的名字后，立刻把追兵挡在国界另一边。" },
      { speakerId: "hans", emotion: "resolve", text: "想报仇，先拿稳东西。边军马上会追到这儿，刀和盾你自己挑。" },
    ],
    secondLines: [
      { stageDirection: "巡逻队带着从女神国边村招来的农户回到驻地。亚瑟在路上第一次上阵，用借来的刀枪砍倒三名边军；系统随即把他推到二级。" },
      { speakerId: "arthur", text: "能加一点就先加武器熟练度。我不想下次还靠运气抢刀。" },
      { stageDirection: "全军比武的告示贴在营门：普通场考武器、盾牌和五项指挥反应；精锐场另要自备马匹与铠甲。亚瑟两样都没有。" },
      { speakerId: "asnoka", emotion: "resolve", text: "听说你在边境砍了三个人。来吧，我陪你练。方阵、变阵、打散重组、撤退——军官一喊，你别只会往前冲。" },
      { speakerId: "hans", text: "比武里你赢了贵族家的少爷，进队后他还会盯着你。记住，军营里挨刀的不一定都在战场上。" },
    ],
    aftermathLines: [
      { stageDirection: "比武后，亚瑟被评为新兵二阶，穿上硬皮布甲，领到铁剑、圆盾和军职任务板。第一次大战里，他和战友用军用锤把一名女神骑士拖下马，抢到一柄白银剑。" },
      { speakerId: "arthur", emotion: "resolve", text: "系统说这把剑要十八点力量。那就先挂在腰上，等我够格再拔。" },
      { speakerId: "hans", text: "北线调令下来了。别笑得太早，那里有矮人、鼠人、绿皮，还有最会把新人吃干抹净的军官。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "我没能把人全带出来。系统照样给了结算，像是在提醒我：死人不会因为读档就回来。" },
      { speakerId: "hans", text: "先跟上队伍。北线那边不会因为我们难过就停火。" },
    ],
  },
  {
    id: "arthur-vol-2-exile", title: "第二章·流亡与争抢", subtitle: "各方都想要的系统持有者", artwork: { src: "/assets/images/mainline-exile.webp", alt: "暗影大教堂外的流亡者与撤离灯火" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-2-evacuation-turn.webp", alt: "证人穿过暗影大教堂门槛、传送锚点在身后破裂" },
    location: "暗影大教堂 · 撤离区", battleId: "arthur-cathedral-evacuation", battleTitle: "暗影大教堂撤离", briefing: "女神国、黑色教廷与议会国同时寻找亚瑟。穿过教堂不等于击倒所有敌人，而是让证人和路线一起活下来。", objectives: ["让三名证人抵达北侧出口", "关闭黑色教廷的传送锚点"], secondBattleId: "arthur-council-front", secondBattleTitle: "议会国前线", secondBriefing: "证人离开教堂后，议会国的前线要求你交出名单。传送锚点仍在远处脉动，抓捕与护送必须同时完成。", secondObjectives: ["保护证人到达粮路", "关闭两座传送锚点"], secondOpening: "议会的印章比刀更快。它能把一个人写成证人，也能把一整条粮路写成叛乱。", opening: "流亡者把名字写在粮袋上。有人说亚瑟是钥匙，也有人说他只是一个会走路的灾难。", choiceA: "相信维拉的撤离路线", choiceB: "公开系统的存在换取时间", aftermath: "你带走了证人，也带走了一个无法轻易解释的政治债务。", failure: "传送门吞掉了半条街。亚瑟没有被捕，但从此每一方都把他列为高危目标。",
    introLines: [
      { stageDirection: "新卡瓦拉的粮仓只收留了亚瑟三夜。第四夜，黑色教廷的观察者在城外看见女神人间体的波动，北方的暗影大教堂便多出一条不能写在地图上的撤离线。" },
      { speakerId: "arthur", emotion: "doubt", text: "流亡者把名字写在粮袋上，怕自己在下一次转运里被替换成数字。有人说我是钥匙，也有人说我只是会走路的灾难。" },
      { speakerId: "hans", text: "你带着一个被各方争抢的人，就别把撤离当成胜利。每一扇门后都有人等着把名单换成筹码。" },
      { speakerId: "asnoka", emotion: "resolve", text: "教堂北门通向雾林，南门通向传送锚。路线可以信，也可以被卖；先让知道路的人有第二条退路。" },
      { stageDirection: "远处传来女神国刺客的圣歌。教堂的钟没有响，锚点却已经开始吐出黑甲的影子。" },
    ],
    secondLines: [
      { stageDirection: "证人穿过教堂后，议会国的使者带着空白拘捕令等在粮路口。印章尚未落下，名字却早已写好。" },
      { speakerId: "arthur", emotion: "anger", text: "他们要的不是事实，而是一个能让前线安静的犯人。既然如此，我就把这条路走成每个人都能看见的记录。" },
      { speakerId: "hans", text: "护送不是把人塞进出口。要让粮车、证人和后卫都能互相看见，抓捕的人才没法把谁单独拖走。" },
      { speakerId: "asnoka", text: "传送锚还在跳。我们每多封住一座，追兵就少一条突然出现在背后的路。" },
    ],
    aftermathLines: [
      { speakerId: "arthur", emotion: "resolve", text: "证人活着离开，名单也没有交给任何一方。可从这一刻起，女神国、议会国和黑色教廷都会说我欠了他们一笔政治债。" },
      { speakerId: "hans", text: "债可以慢慢算。先记住今天是谁替谁挡住了门，别让他们把撤离改写成恩赐。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "传送门吞掉了半条街。没有人把我带走，但每个势力都学会了同一句话：亚瑟是值得优先处理的风险。" },
      { speakerId: "asnoka", text: "路还在，只是变窄了。我们带着剩下的人走，不替死去的人假装这是一场完整的撤离。" },
    ],
  },
  {
    id: "arthur-vol-3-new-kavala", title: "第三章·新卡瓦拉守护者", subtitle: "河湾、粮路与三方战场", artwork: { src: "/assets/images/mainline-kavala.webp", alt: "新卡瓦拉河湾的水闸、粮路与森林缓冲区" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-3-watergate-turn.webp", alt: "泥泞低地的水闸关闭，民兵推粮车穿过狭窄堤道" },
    location: "新卡瓦拉 · 马奴低洼地", battleId: "arthur-lowland-ambush", battleTitle: "马奴低洼伏击", briefing: "亚瑟以军事顾问身份回到河湾。洪闸、粮车和三方谈判都在同一张地图上，任何一次冲锋都可能让另一方断粮。", objectives: ["守住水闸控制格两回合", "保护粮车离开低洼地"], secondBattleId: "arthur-army-trials", secondBattleTitle: "河湾军阵试炼", secondBriefing: "低洼地的水位退去后，民兵必须在泥地里证明新的军阵不是纸上谈兵。", secondObjectives: ["让两支民兵完成集结", "保持至少一辆粮车可用"], secondOpening: "水闸合上了，但没人庆祝。真正的考验是让一群互不信任的人在同一声号令里移动。", opening: "阿斯诺卡把一枚湿透的粮票按在地图上：这里不是战场，是一条会决定谁能过冬的线。", choiceA: "先封水闸再护送粮车", choiceB: "先与森林缓冲区谈判", aftermath: "河湾没有给你王冠，只给你一张可以继续使用的粮路通行证。", failure: "水闸提前开了。三方都损失了东西，也都认为亚瑟欠自己一次解释。",
    introLines: [
      { stageDirection: "亚瑟以军事顾问的名义回到新卡瓦拉。灰矛骑士团在城外操练，城内却同时收到了马奴氏族、森林精灵和议会国的最后通牒。" },
      { speakerId: "asnoka", emotion: "resolve", text: "这张粮票泡过水，边缘已经烂了。它比任何军报都诚实：低洼地一断，河湾的人就不知道谁能过冬。" },
      { speakerId: "arthur", text: "我不是回来当领主的。我要把每条能送人回家的路守住，再让想逼我们选边的人看清代价。" },
      { speakerId: "hans", text: "水闸、粮车和谈判桌在同一张地图上。别把任何一格当成普通地形，它们后面都站着一群没带甲的人。" },
      { stageDirection: "远方的马奴骑兵正在试探堤道；森林缓冲区的火把也亮了。没有人愿意先承认自己需要另一方。" },
    ],
    secondLines: [
      { stageDirection: "洪闸合上后，泥地留下深深的车辙。河湾民兵围着粮车列阵，没人庆祝，因为下一场考验不是击退敌人，而是学会彼此听令。" },
      { speakerId: "arthur", emotion: "resolve", text: "军阵不是让人站得好看。它要在混乱里告诉每个人：谁掩护，谁搬粮，谁在撤退时最后离开。" },
      { speakerId: "hans", text: "听令不等于不问。命令必须能说明它要保护什么，否则整齐的队伍也只是更容易被带去送死。" },
      { speakerId: "asnoka", text: "我会把撤离线画到每一面旗旁。谁走散了都知道该往哪里找人。" },
    ],
    aftermathLines: [
      { speakerId: "arthur", text: "河湾没有给我王冠，只给了一张还能使用的粮路通行证。比起被人宣布成英雄，我更愿意先把这张纸守到冬天以后。" },
      { speakerId: "asnoka", emotion: "resolve", text: "通行证会过期，人情也会。可今天三方都看见了：粮路不是谁的私产，断了谁都活不下去。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "水闸提前开了。粮车被冲散，三方都损失了东西，也都觉得亚瑟欠自己一次解释。" },
      { speakerId: "hans", text: "解释不能替人填饱肚子。先把还活着的人聚拢，剩下的责任我们带着往下走。" },
    ],
  },
  {
    id: "arthur-vol-4-reform", title: "第四章·改革与崩溃", subtitle: "女神国改革与四国会战", artwork: { src: "/assets/images/mainline-reform.webp", alt: "四国会战中的改革派指挥台与换边旗帜" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-4-banners-turn.webp", alt: "湿石上的四面战旗与正在撤离的临时盟军" },
    location: "圣辉城 · 四国会战外环", battleId: "white-knight-charge", battleTitle: "白光骑士长", briefing: "改革派、黑色教廷与卫道士军国在同一场会战中换边。亚瑟必须先在白光骑士长面前证明自己能守住阵线。", objectives: ["在骑士长冲锋后保持阵线", "让亚瑟完成一次盾牌格挡"], secondBattleId: "arthur-four-country-war", secondBattleTitle: "四国会战", secondBriefing: "白光骑士长退入烟尘，四国会战才真正开始。临时盟军会换边，任何旗标都不能被当作永恒的忠诚。", secondObjectives: ["让至少两支临时盟军完成集结", "关闭战场上的信仰扩散旗标"], secondOpening: "骑士长留下的白光照在四面旗上。它们看起来都像答案，直到第一支盟军开始后撤。", opening: "宴席上的每个人都说自己愿意改革，直到改革真正要求他们交出一部分权力。", choiceA: "站在改革派一侧", choiceB: "先保存军队，再等待换边", aftermath: "你第一次明白，改革不是一句正确的话，而是一场允许盟友离开的战斗。", failure: "盟军各自撤离。女神国没有立刻崩溃，但它的裂缝已经写进了所有人的档案。",
    introLines: [
      { stageDirection: "女神国的大祭司用辞职换来改革，却没能换来所有人的让步。鸿门宴后的临时协军协议刚刚签下，四国会战的火已经烧到圣辉城外环。" },
      { speakerId: "arthur", emotion: "doubt", text: "宴席上的每个人都愿意改革，直到改革真的要求他们交出一部分权力。原来最难的不是证明旧制度有错，而是决定谁先放下刀。" },
      { speakerId: "hans", emotion: "resolve", text: "白光骑士长的冲锋会撕开最先动摇的那一列。盾牌不是为了赢得掌声，是为了让身后的人还有时间决定要不要站住。" },
      { speakerId: "asnoka", text: "四面旗都在向我们招手。别急着把哪一面当成答案，先看看哪支军队已经开始往后撤。" },
      { speakerId: "white_knight_captain", emotion: "resolve", text: "你们把秩序叫作旧物，只因为还没见过没有秩序时，人会把什么当作理由去杀人。" },
    ],
    secondLines: [
      { stageDirection: "白光退入烟尘，四国的旗帜却同时向前。临时盟军在湿石上换边，信仰扩散旗标像钉子一样把恐慌固定在战场中央。" },
      { speakerId: "arthur", text: "我们不替任何旗去送死。谁愿意守住撤离线，谁就是这一刻的盟军；谁拿平民换冲锋距离，谁就得离开队形。" },
      { speakerId: "hans", text: "阵线会移动，纪律不能。让愿意留下的人先有位置，再谈下一面旗是否值得信。" },
      { speakerId: "asnoka", emotion: "doubt", text: "我会盯着旗标。它们不是信仰本身，却能让所有人误以为身后还有一只不会放手的手。" },
    ],
    aftermathLines: [
      { speakerId: "arthur", emotion: "resolve", text: "改革不是一句正确的话，而是一场允许盟友离开的战斗。我们保住的不是一面旗，而是那些仍能拒绝被旗帜替他们决定的人。" },
      { speakerId: "hans", text: "今天有人离开，也有人留下。把两件事都记下来，别只把留下的人写成忠诚。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "盟军各自撤离。女神国没有在这一夜崩溃，可它的裂缝已经写进了所有人的档案，也写进了每一条撤退路线。" },
      { speakerId: "asnoka", text: "我们带着还愿意同行的人北上。没有人会原谅这场败退，但他们至少不必被留在原地等下一支军队。" },
    ],
  },
  {
    id: "arthur-vol-5-steppe", title: "第五章·草原之主", subtitle: "龙誓、粮食危机与部队编制", artwork: { src: "/assets/images/mainline-steppe.webp", alt: "草原粮线、龙誓矿脉与远方骑兵" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-5-oath-mine-turn.webp", alt: "龙影掠过龙誓矿脉，疲惫士兵在裂开的誓石旁推粮车" },
    location: "北方草原 · 龙誓矿脉", battleId: "arthur-dragon-oath", battleTitle: "龙誓矿脉", briefing: "草原诸部要求你成为名义上的领袖，龙族只承认一份没有被污染的誓约。粮食危机让每个选择都有重量。", objectives: ["保护三辆粮车", "在龙誓祭坛完成一次无武力互动"], secondBattleId: "arthur-steppe-supply", secondBattleTitle: "草原护粮", secondBriefing: "龙誓暂时成立，蛮荒先锋却趁夜切入粮线。亚瑟必须在骑兵机动与粮食分配之间做出可执行的选择。", secondObjectives: ["保护两辆粮车抵达营地", "阻止掠骑切断南侧粮线"], secondOpening: "龙影从矿脉上空掠过，粮车的轮子却还陷在泥里。盟约不会替你把车推出来。", opening: "草原上的风没有旗帜。它只会把粮食的味道带给最先闻到的人。", choiceA: "把粮食优先给伤员", choiceB: "用矿脉换取龙族支援", aftermath: "草原承认你的调度，而不是你的血统。军职等级第一次影响了对话之外的战场编制。", failure: "矿脉没有封住，粮路也没有守住。你仍然拥有一支队伍，但它不再相信每条命令都值得执行。",
    introLines: [
      { stageDirection: "北线突围之后，马奴氏族衰颓的草原迎来新的旗帜。亚瑟拒绝称王，却不得不接过各部落递来的粮册、马匹与求援。" },
      { speakerId: "arthur", text: "草原上的风没有旗帜，它只会把粮食的味道带给最先闻到的人。谁想领兵，先回答下一车粮该送给谁。" },
      { speakerId: "hans", emotion: "resolve", text: "石心的重步兵会合后，我们终于有了能守住线的兵。可铠甲不能煮成汤，饥饿会先打散最整齐的阵列。" },
      { speakerId: "asnoka", text: "龙誓矿脉能换来盟约，也会招来所有闻到铁味的人。三辆粮车不是补给数字，是三支队伍能不能继续信你。" },
      { stageDirection: "天空掠过一条龙影。祭坛的誓石裂开一道细缝，像在等待有人先用武力回答。" },
    ],
    secondLines: [
      { stageDirection: "龙影从矿脉上空掠过，粮车的轮子却还陷在泥里。蛮荒掠骑趁夜切入南侧粮线，盟约没有替任何人把车推出来。" },
      { speakerId: "arthur", emotion: "resolve", text: "我们不能把所有粮都押在最强的部队身上。能打的队伍若先吃饱，守不住的人就会先倒下，最后仍没人能打。" },
      { speakerId: "hans", text: "把重甲放在最窄的口子，给车队留出转身的路。战斗里最贵的不是冲锋，是还能撤回的一步。" },
      { speakerId: "asnoka", text: "我带游骑去追掠骑，但不会追过粮线。我们守的是营地，不是为了赢一场追逐赛把冬天也追丢。" },
    ],
    aftermathLines: [
      { speakerId: "arthur", emotion: "resolve", text: "草原承认的是调度，不是血统。军职第一次不只写在军牌上：谁能带多少人、守哪条线，都要对领到的粮负责。" },
      { speakerId: "asnoka", text: "誓约没有让人变得更好，只让背弃它的人不能再假装没人看见。对现在的草原，这已经够珍贵。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "矿脉没有封住，粮路也没有守住。我们仍有一支队伍，可他们开始怀疑每一道命令是否真的值得拿命去执行。" },
      { speakerId: "hans", text: "怀疑不是背叛。把没做好的部分写清楚，下次列阵时才有人愿意再把盾牌交给你。" },
    ],
  },
  {
    id: "arthur-vol-6-evil-god", title: "第六章·邪神崛起", subtitle: "造神圣殿与生者防线", artwork: { src: "/assets/images/mainline-evil-god.webp", alt: "造神圣殿的污染仪式环与生者防线" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-6-sanctum-turn.webp", alt: "造神圣殿中生者防线围住昏暗祭坛，审判官站在仪式屏幕后" },
    location: "造神圣殿 · 生者防线", battleId: "night-judge", battleTitle: "永夜殿审查", briefing: "新神、女神、黑色教廷和邪神同时介入。审判官不只攻击亚瑟的生命，还会把你与各方的关系变成可见的敌方意图。", objectives: ["保护生者防线四回合", "打断审判官的内心审查"], opening: "审判官没有问你做过什么。他问的是：如果所有人都知道，你还会做同样的选择吗？", choiceA: "承认曾经的失败", choiceB: "把责任推给系统", aftermath: "意志不再是隐藏数值。它成为一条可以被队友看见、也可以被敌人利用的线。", failure: "审查没有结束，只是换了一个记录者。亚瑟带着污染和更高的军职压力进入湖都。",
    introLines: [
      { stageDirection: "女神国残部在黑色教廷的秘密输血下重燃，造神国与魔法教廷合并，鲜血王庭和深渊的信号又从西方升起。各方终于不再能把战争解释成两国边境的旧账。" },
      { speakerId: "night_judge", emotion: "resolve", text: "我不问你做过什么，亚瑟。我只问：如果每一个被你放弃的人都站在这里，你还会不会做同样的选择？" },
      { speakerId: "arthur", emotion: "doubt", text: "系统能显示敌人的属性，却没有一条数值告诉我该怎样承担。我救过人，也让人死在来不及抵达的地方。" },
      { speakerId: "hans", text: "承认代价不是把自己交出去。真正的审查，是让你以为只要说出一句正确的话，所有人就该替你原谅。" },
      { speakerId: "asnoka", emotion: "resolve", text: "生者防线不是一面墙，是还愿意把彼此留在阵里的那些人。别让他把我们的犹豫变成彼此的刀。" },
    ],
    aftermathLines: [
      { speakerId: "arthur", emotion: "resolve", text: "意志不再是藏在面板里的数值。它成为队友能看见、敌人能利用、而我必须亲自回答的一条线。" },
      { speakerId: "hans", text: "湖都还在等我们。把今天说出口的责任带上，不要把它留给下一位审判官改写。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "审查没有结束，只是换了一个记录者。污染跟着我进入湖都，军职压力也比任何盔甲更沉。" },
      { speakerId: "asnoka", text: "没人能带着干净的手走到这里。重要的是别把沾上的血说成别人的选择。" },
    ],
  },
  {
    id: "arthur-vol-7-finale", title: "第七章·终局之战", subtitle: "湖都会战与凡人的秩序", artwork: { src: "/assets/images/mainline-finale.webp", alt: "湖都三路会战与信仰发散器" }, nodeArtwork: { src: "/assets/images/mainline-nodes/chapter-7-three-roads-turn.webp", alt: "三条路径汇向湖都庭院的三个装置，赤白双核在水面上对峙" },
    location: "湖都外围 · 信仰发散器", battleId: "lake-dual-god", battleTitle: "湖都双邪神战", briefing: "三路分兵，三个目标，两个神力核心。胜利不是杀死 Boss，而是关闭信仰发散器，让凡人重新拥有决定秩序的权利。", objectives: ["三路各完成一项关闭装置任务", "让亚瑟活着抵达湖都中庭"], opening: "湖都的钟声同时来自三座神殿。亚瑟终于看见系统最初没有告诉他的那一行字：世界不会替你选择秩序。", choiceA: "关闭发散器，放走其中一个核心", choiceB: "让两股神力互噬，承担失控风险", aftermath: "你拒绝成为皇帝，也拒绝成为神。新的秩序从一份允许失败继续推进的记录开始。", failure: "湖都没有被拯救成一个完美的结局，但幸存者仍然拥有争论下一步的资格。",
    introLines: [
      { stageDirection: "湖都外围，圣骑士团、灰矛骑士团、游骑队、石心重步兵与精灵猎手终于在同一条堤道会合。天空有龙影，海面有一月舰队，城下却只有三座仍在运转的信仰发散器。" },
      { speakerId: "arthur", emotion: "doubt", text: "湖都的钟声同时来自三座神殿。系统终于补上最初没有告诉我的那一行字：世界不会替你选择秩序。" },
      { speakerId: "lake_dual_god", emotion: "anger", text: "关闭装置，你们便失去庇护；保留装置，便只能接受由神决定谁值得活。凡人总把无力说成自由。" },
      { speakerId: "hans", emotion: "resolve", text: "那就用我们的队形回答。左路封住仪式环，中路断开引导塔，右路护送关闭钥匙。没人替我们完成，但每一路都有人能回来。" },
      { speakerId: "asnoka", text: "别被双核引到中庭去拼命。它们想让我们盯着神，装置才是把整座大陆绑进来的绳结。" },
      { stageDirection: "发散器的光穿过湖面。死亡与恶魔的神力互相咬住，等待凡人先替其中一方让路。" },
    ],
    aftermathLines: [
      { speakerId: "arthur", emotion: "resolve", text: "我拒绝成为皇帝，也拒绝成为神。发散器停下后，湖都没有得到完美答案，只得到一个不再由神替人书写结论的早晨。" },
      { speakerId: "hans", text: "把阵亡者、撤离者和做错的命令都写进会议记录。新的秩序若只纪念胜利，迟早会长成下一座发散器。" },
      { speakerId: "asnoka", text: "路从废墟里分出去。我们不用替每个人决定去向，只要别再把他们堵回同一扇门。" },
    ],
    failureLines: [
      { speakerId: "arthur", emotion: "doubt", text: "湖都没有被拯救成一个完美的结局。发散器只被迫停歇，幸存者仍得在废墟边争论下一步该相信谁。" },
      { speakerId: "hans", text: "争论的资格不是小事。至少今天，没有哪一个神替他们把话说完。" },
      { speakerId: "asnoka", text: "我们离开中庭，带走能带走的名字。以后会有人质问我们为何没能更多，但不会再有人说他们从未有选择。" },
    ],
  },
];

function buildChapter(spec: MainlineChapterSpec): StoryChapter {
  const intro = `${spec.id}-intro`;
  const battle = `${spec.id}-battle`;
  const secondBattle = spec.secondBattleId ? `${spec.id}-second-battle` : undefined;
  const secondIntro = secondBattle ? `${spec.id}-second-intro` : undefined;
  const victory = `${spec.id}-victory`;
  const defeat = `${spec.id}-defeat`;
  const nodes: Record<string, StoryNode> = {
    [intro]: {
      id: intro, kind: "dialogue", title: spec.location, artwork: spec.nodeArtwork,
      lines: storyLines(spec.introLines),
      choices: [
        { id: `${spec.id}-a`, label: spec.choiceA, hint: "获得一点战前情报", effects: { statChanges: { wardenTrust: 1, publicFaith: 1 } }, next: battle },
        { id: `${spec.id}-b`, label: spec.choiceB, hint: "保留一次失败后的撤退余地", effects: { statChanges: { civilianSafety: 1, goddessTrust: -1 } }, next: battle },
      ],
    },
    [battle]: {
      id: battle, kind: "battle", battleId: spec.battleId, title: spec.battleTitle,
      briefing: spec.briefing, objectives: spec.objectives,
      victoryNext: secondIntro ?? victory, defeatNext: secondIntro ?? defeat,
    },
    [victory]: {
      id: victory, kind: "ending", endingId: "order", title: `${spec.title} · 余火未灭`,
      lines: storyLines(spec.aftermathLines), summary: "胜利不是清空棋盘，而是让下一章仍然拥有选择。",
    },
    [defeat]: {
      id: defeat, kind: "ending", endingId: "failure", title: `${spec.title} · 失败仍会推进`,
      lines: storyLines(spec.failureLines), summary: "伤势、资源和政治后果会写入存档，但主线不会被迫读档。",
    },
  };
  if (secondBattle && secondIntro && spec.secondBattleTitle && spec.secondBriefing && spec.secondObjectives && spec.secondOpening) {
    nodes[secondIntro] = {
      id: secondIntro, kind: "dialogue", title: spec.secondBattleTitle,
      lines: storyLines(spec.secondLines ?? []),
      choices: [
        { id: `${spec.id}-second-a`, label: "保持原定军令", hint: "保留当前阵线与情报", effects: { statChanges: { wardenTrust: 1 } }, next: secondBattle },
        { id: `${spec.id}-second-b`, label: "临时改变部署", hint: "牺牲一条路线换取撤退窗口", effects: { statChanges: { civilianSafety: 1, publicFaith: -1 } }, next: secondBattle },
      ],
    };
    nodes[secondBattle] = {
      id: secondBattle, kind: "battle", battleId: spec.secondBattleId!, title: spec.secondBattleTitle,
      briefing: spec.secondBriefing, objectives: spec.secondObjectives, victoryNext: victory, defeatNext: defeat,
    };
  }
  return { id: spec.id, title: spec.title, subtitle: spec.subtitle, artwork: spec.artwork, startNodeId: intro, actionNodeIds: [intro, battle, ...(secondIntro ? [secondIntro, secondBattle!] : [])], nodes };
}

export const mainlineChapters: readonly StoryChapter[] = specs.map(buildChapter);
export const mainlineChapterByWeek: Readonly<Record<number, StoryChapter>> = Object.fromEntries(mainlineChapters.map((chapter, index) => [index + 1, chapter]));

/** The twelve battle IDs used by the seven-volume campaign. */
export const mainlineBattleIds = Object.freeze([
  "arthur-execution-escape", "arthur-border-blockade", "arthur-army-trials", "white-knight-charge", "arthur-cathedral-evacuation", "arthur-council-front", "arthur-lowland-ambush", "arthur-four-country-war", "arthur-steppe-supply", "arthur-dragon-oath", "night-judge", "lake-dual-god",
]);
