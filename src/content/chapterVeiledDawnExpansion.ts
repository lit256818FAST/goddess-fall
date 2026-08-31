import type { DialogueNode } from "./types";

export const veiledDawnExpansionNodes: Record<string, DialogueNode> = {
  "veiled-letter-at-dusk": {
    id: "veiled-letter-at-dusk",
    kind: "dialogue",
    title: "没有王印的来信",
    focusCharacterId: "agnes",
    lines: [
      {
        text: "雾门外的驿屋只剩半面屋顶，雨水沿烧黑的梁柱滴进铜盆。阿格尼丝把禁抄本摊在最干燥的桌角，一页页垫上从旧祭衣拆下的布。她不肯让任何人替她翻页，仿佛每一道指纹都会成为审查者追索原主人的路标。",
        stageDirection: "黄昏压在湿透的窗纸上。一只带海盐气味的灰羽信鸟撞了三次窗框，脚环没有任何国家纹章。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "这几页不是教义，也不是反教义。它们只是名字、日期和被划去的疑问。审查官总说删去一句话能保护写下它的人，可名字一旦从卷宗里消失，那个人受过的审问也会被说成从未发生。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "信鸟来自东南海。火漆上只有一道横线，是一月王国给无旗使团的旧记号。他们不盖王印，因为第一批流亡者离岸时，带走的印章属于一个已经处死他们的国家。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "他们在信里问什么？问圣火是不是骗局，还是问我们有没有找到一句足够锋利、可以把所有祈祷一次割断的话？如果他们只接受后一种答案，我们交出的就不是证据，而是另一种预写好的神谕。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "他们问使团是否愿意举起流亡者的旗，以换取船、药和一条不受雾门控制的退路。他们还承诺把禁抄本印成一万份，但印本的序言必须写明：这些记录已经证明女神从未存在。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "那不是援助，是替我的抄本指定供词。教廷删掉不合教义的句子，他们则想在每页前面加上合乎自己结论的句子。一个用黑墨遮住人的犹疑，一个用红墨把犹疑改成确定；被挤掉的仍是写字的人。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "可那条退路能救伤员。雾门守卫正在合拢，靠我们的粮食撑不到第三天。我厌恶他们索要结论，却也无法要求担架上的人为了我们的清白继续淋雨。拒绝一面旗很容易，替拒绝付出代价的人止痛很难。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "无旗并不是把每种邀请都推回去，也不是假装我们高过所有争执。它只意味着接受船时不能把证词一并卖掉，接受药时必须让每个人知道价格。若对方不肯拆开条件，我们就把这封信也放进公共记录。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "请先别回信。名单末尾有一个被水泡开的姓氏，我在档案馆见过同样的笔势。那名抄经人后来被送进雾门内的静默室；若他还活着，他能说明这些页为何被拆散，也能证明我没有替死者补写勇气。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "那么我们先去找人，再决定怎样使用船。信仰若只能保护写得整齐的见证，就不值得被保护；怀疑若只肯接纳符合结论的幸存者，也不过是换了颜色的祭坛。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "我会回一封没有效忠句的短函：药可以谈，船可以谈，证词的结论不能谈。让信鸟等到天亮。如果我们回不来，驿卒会把原信和我们的答复同时交给河湾印坊，至少让交易条件先于传言抵达。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "一月王国并非凭空苛刻。档案馆里有过他们寄来的申诉，写着留在大陆的亲属如何被登记为叛逃者家眷，又如何在多年后从名册中整栏消失。我理解他们为什么渴望一句彻底否定旧秩序的话，但理解创伤不能等于把新的解释权交给受伤最深的人。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "圆桌密约给我的通行文书也不是永恒护符。每个签署者都在页脚保留撤回承认的权利，所以我每穿过一道边境，都在借用一份可能明早失效的信任。这恰好提醒我们：中立要靠每一次可核验的行动续期，不能靠称号提前免除怀疑。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "回信时也请写上伤员人数、所需药量和分配方式。若对方真愿意救人，就让援助在不获得思想回报的情况下抵达；若他们撤回药物，后来的人应当看见撤回发生在我们拒绝宣誓之后。事实不能阻止报复，却能阻止报复伪装成天气。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我会把两封来信夹在目录最前，却不让它们盖过静默室里的名字。国家之间的交易往往更容易被历史保存，因为火漆、船队和宣言看起来比一个抄经人的饥饿重要。我们的次序必须相反：先写人遭遇了什么，再写各方如何争夺那段遭遇。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "驿卒问该把回信称作外交文书还是求援信。我让他两种名称都写，并注明命名者。前者强调双方平等，后者承认我们确实缺药；任意删掉一个，都可能让后来的读者高估我们的自由或低估我们的尊严。处境有时需要两个不舒服的名字。",
      },
    ],
    choices: [
      {
        id: "answer-with-open-terms",
        label: "公开一月王国的全部交换条件",
        hint: "用透明换取脆弱的中立，伤员的退路可能因此延迟。",
        effects: { statChanges: { publicFaith: -3, wardenTrust: 1 } },
        next: "agnes-margin-names",
      },
      {
        id: "accept-medicine-only",
        label: "只接受药物，并把附加条件封入证据箱",
        hint: "先保护伤员，同时拒绝让援助方替抄本下结论。",
        effects: { statChanges: { civilianSafety: 5, goddessTrust: -1 } },
        next: "agnes-margin-names",
      },
    ],
  },

  "agnes-margin-names": {
    id: "agnes-margin-names",
    kind: "dialogue",
    title: "写在页边的人",
    focusCharacterId: "agnes",
    lines: [
      {
        text: "阿格尼丝把队伍带进一条废弃抄经廊。墙上仍悬着历代教宗批准使用的字形范本，每一个字都端正得像从未有人握笔发抖。她从禁抄本夹层抽出细窄纸条，纸条上没有经文，只有抄写者偷偷留下的更正、咳嗽、饥饿与恐惧。",
        stageDirection: "风从石窗的裂口穿过，成排木桌依次发出轻响，像看不见的抄经人正在传递一句不准高声阅读的话。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "正式卷宗说，接受审查的人都是自愿进入静默室；页边却写着他们被停发口粮、禁止见孩子、整夜听同一个问题。审查者不一定撒谎，他们只是把被迫同意解释成同意，再把解释写进唯一允许保存的版本。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "女神国也有边注，只是我们叫它训诫。年轻祭司提出疑问，导师会在旁边写下更合适的问法。久而久之，所有人的疑问都长得一样。我曾以为那是学习，现在才知道整齐有时只是恐惧被修剪后的形状。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "这些纸条若公开，守卫会说任何人都能伪造；若只由我们保管，又会变成一只新的密柜。需要找到能说出纸张来处、墨水配方和传递路径的人，让记录从物件变成可以互相核验的证词。",
      },
      {
        speakerId: "agnes",
        emotion: "fear",
        text: "传递纸条的人叫诺安。他不赞成我偷抄，甚至认为某些禁令能阻止年轻修士被极端教义利用。他帮助我，只因为审查官把一个孩子对母亲的思念改写成了对女神的渴望。他说再小的篡改也会训练人接受更大的篡改。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "我们必须救他，但不能把他塑造成与你完全相同的英雄。若他仍相信部分审查必要，那份矛盾也要原样留下。证人不是为了替我们的道路鼓掌才值得活着，正因为他可能反对我们，他的证词才不能被预先修平。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "我知道。逃离教廷以后，很多人恭喜我终于获得正确思想，好像跨过边境就会让过去的信仰从身体里蒸发。我仍会在抄写前洗手，仍会在夜里默念那些被删过的句子。我反对的是谁有权替别人描述沉默，不是所有沉默。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "那就按可核验的顺序行动：先拍下范本与水印，再将纸条分成两份，由不同的人携带；最后寻找诺安。任何一份被夺走，都不足以让某一方垄断解释；三份重新相合时，才构成完整证据链。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "还有一件事我没告诉你们。最后一张纸条是我写的，上面列了十三个静默室的位置。我当时只想让外面的人知道去哪里找失踪者，却没想到守卫也可能借这张图确认是谁泄露路线。救援名单同样可以成为抓捕名单。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "我们不能假装记录天然善良。先删去仍在使用的隐蔽入口，只留下已废弃房间和可公开核验的编号；原图由三名见证人共同保管，任何人不得单独复制。保存真相不等于把脆弱的人暴露给所有目光。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "好。我会亲手遮住入口，但在遮盖旁写明原因、日期和三名保管者。我要让以后打开原图的人知道这里发生过一次有边界的隐瞒，而不是误以为纸面生来就有空白。连保护人的删节也必须留下删节的痕迹。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "还要记录谁反对这次遮盖。若所有保管者只留下共同结论，未来就无法判断这是充分讨论后的决定，还是某个人借紧急状态压住异议。少数意见不必自动正确，但它能标出决策最可能伤人的接缝，让复核者知道从哪里重新发问。",
      },
      {
        speakerId: "seraphina",
        emotion: "neutral",
        text: "我来写反对意见：入口在转移完成后应当逐步公开，否则掌握原图的人会长期拥有别人无法监督的通道。我也写下自己可能低估追捕时间的风险。这样将来若事实证明我错了，错误有具体形状，不会被一句善意抹平。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我接受，并补上复核条件：最后一名在押者确认安全、两条替代逃生路线启用、看守轮值记录被外部保存。条件满足任何两项就召开复核，不能只等某位保管者觉得时机成熟。规则若依赖好人永远善良，就只是另一种未经检验的信仰。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "三名保管者还要各自指定一名不知道完整路线的继任者。这样保管者失踪时，原图不会随之永封，继任者也不能独自滥用。权力被拆小以后会显得麻烦、缓慢、容易争吵，可这些摩擦正是别人仍有机会说不的证明。",
      },
    ],
    choices: [
      {
        id: "preserve-redaction-trail",
        label: "保留删节痕迹，由三名见证人分持原图",
        hint: "保护仍在逃亡的人，同时让未来能够追查删节责任。",
        effects: { statChanges: { civilianSafety: 4, publicFaith: -2 } },
        next: "fog-gate-ordinary-hours",
      },
      {
        id: "publish-dead-sites",
        label: "立即公开已废弃静默室的编号与水印",
        hint: "建立外部核验路径，但会促使守卫提前转移档案。",
        effects: { statChanges: { wardenTrust: 2, goddessTrust: -2 } },
        next: "fog-gate-ordinary-hours",
      },
    ],
  },

  "fog-gate-ordinary-hours": {
    id: "fog-gate-ordinary-hours",
    kind: "dialogue",
    title: "雾门里的一顿早饭",
    focusCharacterId: "agnes",
    lines: [
      {
        text: "通往静默室的近路穿过雾门居民区。石屋没有窗帘，因为终年浓雾已经替每户人家遮住视线。面包房刚开炉，修士、猎户与搬运档案的学徒排在同一条队伍里，用刻着日期的木牌领取当日份额。没有人低声念诵，也没有人公开谈论审查。",
        stageDirection: "钟楼敲过晨间第三响。送奶的孩子把空罐倒扣在门槛上，表示这一户昨夜有人被带走，今日不必再留份额。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "外人总以为这里每个人都活在密室和仪式里。其实大多数日子只是排队、补屋顶、晾干柴、计算冬天还剩多少盐。内心审查之所以能维持，不是因为每时每刻都有人挥刀，而是它嵌进了领取面包和登记病假的普通手续。",
      },
      {
        speakerId: "seraphina",
        emotion: "neutral",
        text: "那个面包师在木牌背面写了什么？他每发出一条面包就划一道短线，却把某些人单独记在另一列。若那是失踪者名单，我们应该取走；若只是赊账本，拿走它反而会让冬天无法结算。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "先问，不偷。过去我常以为凡是记录都应复制，后来才知道一张赊账本也能暴露谁家断粮、谁在照顾逃亡者。面包师愿意说多少就记多少；他若只允许我们记总数，就让总数留下，不把谨慎解释成与审查者合作。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "我们穿着外来者的斗篷，身后还有持械同伴。即使语气温和，询问也可能被当成命令。由阿格尼丝先说明我们不会没收账本，再由一名当地人复述，让面包师有机会在不面对武器的方向回答。",
      },
      {
        text: "面包师把账本留在柜台，只撕下一张没有姓名的统计：过去一个月，二十七户突然停止领取口粮，其中九户留下迁居凭证，十八户没有任何手续。他拒绝说明自己是否替其中几户送过食物，也不允许使团查看后门。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "十八户不能直接等同十八次抓捕。有人可能逃走，有人可能借雾掩护搬家，也有人可能在别处共同用餐。我们只能把异常与静默室名册对照。数字会提出问题，不会自动回答问题，更不会替任何一户承认自己的遭遇。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "排队的人没有避开我们，却也没有靠近。他们知道守卫可能在看，也知道我们可能明天就走。对他们而言，向外来者讲一句真话的代价会留在门口，而听完的人却能继续赶路。这种不对称应当写进每份口述开头。",
      },
      {
        speakerId: "agnes",
        emotion: "fear",
        text: "街角那个送奶孩子叫弥卡。我离开前，他姐姐在档案馆装订书页。她不是秘密反对者，只因把两份顺序装反，被要求解释潜意识里是否拒绝教义。弥卡现在每天用奶罐记录谁被带走，但他不知道自己已经在做一份危险档案。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "不要招募孩子作线人。我们可以告诉他倒扣奶罐可能暴露家户，请面包师设计一种同时表示停奶、搬家和临时离开的通用记号。失去精确情报会增加调查难度，却能让一个孩子不必用日常路线承担成人的秘密战争。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "我曾赞美这种聪明，把孩子留下的细小标记称为民间记忆。那说法避开了真正的问题：为什么大人允许孩子成为唯一敢记的人。档案若靠最弱者冒险才能完整，完整本身就是一项指控，而不是值得炫耀的成果。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "我们买下全队今天的面包，按公开价格付款，不以保护费或感谢金名义多塞硬币。突然的慷慨也会留下可疑痕迹。若想帮助面包师，就把伤员的空木牌交回，让账目显示正常消耗，而不是出现一笔守卫无法解释的外来馈赠。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "雾门里的生活并不只有恐惧。隔壁裁缝仍在争论袖口该用哪种针脚，猎户抱怨修士不会腌肉，孩子们用旧目录折船。若我们只保存压迫，这些人就会被写成等待获救的阴影；审查夺走他们的自由，不该连日常也由我们夺走。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "因此记录分成两册：调查册只写与拘押和档案有关的可核验事项；生活册由居民自己决定写什么，并保留不交给使团的权利。未来公开前再次征求同意。受苦者不是案件附件，他们如何做饭、争吵和取笑权威，同样属于自己。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "面包师最后告诉我们，静默室今天提前换岗，因为焚卷车的轮轴坏了。这个消息来自他为守卫多烤的六条面包，不来自忠诚或背叛。普通生意可以产生关键线索，却不能因此把所有商贩写成抵抗者。我们只记录消息怎样来到。",
      },
    ],
    choices: [
      {
        id: "protect-ordinary-ledgers",
        label: "只取匿名统计，并保护居民日常账本",
        hint: "减少可追踪信息，承认调查完整度必须为居民安全让步。",
        effects: { statChanges: { civilianSafety: 6, publicFaith: -1 } },
        next: "silent-room-rescue",
      },
      {
        id: "record-fog-gate-life",
        label: "建立由居民自行授权的雾门生活册",
        hint: "让雾门居民不只作为受害者出现，但公开进度更慢。",
        effects: { statChanges: { goddessTrust: 1, wardenTrust: 1 } },
        next: "silent-room-rescue",
      },
    ],
  },

  "silent-room-rescue": {
    id: "silent-room-rescue",
    kind: "dialogue",
    title: "静默室仍有人呼吸",
    focusCharacterId: "agnes",
    evidenceRecovery: true,
    lines: [
      {
        text: "旧静默室藏在蓄水池下方。门外堆着准备焚毁的卷宗，火盆却因潮气迟迟没有燃旺。门内传来规律的敲击：三下、停顿、两下。阿格尼丝认出那是抄经人校对漏字的暗号，也是她离开前与诺安约定的最后一种求救方式。",
        stageDirection: "水从穹顶落在铁门上。远处守卫正在搬运油罐，留给使团的时间只够先打开牢门或先抢出卷宗。",
      },
      {
        speakerId: "agnes",
        emotion: "fear",
        text: "门后不止诺安。敲击间隔表示至少还有四个人，其中一人无法站立。卷宗里也许有全部审讯记录，但火一旦烧起来，烟会先灌进静默室。我们不可能同时抱走所有纸和所有人。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "先确认门轴和通风井。纸张可以通过见证重建，人死了只会留下别人替他说的话。但若完全放弃卷宗，守卫会宣称房间里的人从未登记，救援也可能被说成我们绑走了自愿静修者。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "我去稳住门内的人，让他们依次报出姓名与愿望。不要问他们信不信，不要让任何答案决定获救顺序。若有人只想离开、有人想带走自己的笔录、有人甚至想继续留下，我们先让他们能在没有铁门的地方重新选择。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "诺安可能拒绝走。他曾说，档案馆若只剩顺从者，后来的人连删掉了什么都无法猜到。我恨这种理由，因为它听起来高尚，也因为我曾用同样理由要求他替我留下。我的逃亡有一部分是踩在他的坚持上完成的。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "你可以承认欠他，但不能用亏欠替他决定。打开门以后，把危险、退路和卷宗状况都告诉他。他若留下，我们记录这是知情选择；他若离开，也不把离开写成背叛。使团负责让选择不再由锁和饥饿预先完成。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "火盆旁有一册灰皮目录，记录每份卷宗被移往哪里。我们不必抢走整堆纸，只需取目录、每类审讯各一份样本，再留下取样清单。这样既能救人，也能让后来者沿编号追查，而不是相信我们挑出的几页代表全部。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "守卫靠近了。我会用候补圣女的旧祷式要求他们停火一刻，但这身份只能骗来一次迟疑。听见祷词的人也许会服从，也许会因我未经许可使用它而更愤怒。无论结果如何，不要把他们的反应解释成女神的回答。",
      },
      {
        text: "铁门被撬开时，五名囚禁者用手遮住并不明亮的灯。诺安最后出来，怀里没有经典，只有一叠被审查官退回的家书。他确认灰皮目录真实，却要求自己的意见与阿格尼丝分开记录：他相信有限审查可以存在，但绝不能秘密夺走申诉。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "我想反驳他，可现在不是把获救变成辩论胜利的时候。请写清楚：诺安帮助保存证据，不等于同意我的全部判断；我组织救援，也不等于获得替五个人发言的资格。我们只共同确认门曾上锁、食物曾被扣、记录曾被改。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "灰皮目录、抽样卷宗与五份独立口述分别封装。冷灰、账簿或扳手若在此前遗失，就从目录标出的没收箱中取回；只恢复能核对来源的旧证物，不凭相似外观制造一件方便剧情的替代品。然后所有人从通风渠撤出。",
      },
      {
        speakerId: "agnes",
        emotion: "fear",
        text: "第五个人不肯说姓名，只把袖口拆下来交给我。里面缝着三种不同颜色的线，分别代表三次被迫修改的供词。他要求我们保存线，却销毁能识别家族的刺绣。证据因此会少一层来源信息，但他的亲人不会因我们的完整欲望再次被抓。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "诺安选择留下半刻，把退回的家书按收件人分开。他不是留守教廷，也不是加入使团，只是在履行一项尚未完成的照料。请不要把这一幕写成信念转折；有时一个人冒险，只因为纸上有人仍在等自己的名字被正确送达。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "撤离记录分成三栏：亲眼看见、由他人陈述、尚待确认。敲击暗号、铁门和扣粮属于前两栏；谁下达总命令、是否存在更高层授意仍放在第三栏。我们不因时间紧迫把推测升级成事实，也不因尚缺主谋就贬低已经确认的伤害。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我最后看一眼火盆，不带走无法核验的散页，也不替它们编一个壮烈去处。也许其中真有重要证词，也许只是重复表格。承认我们失去了什么却不知道失去的内容，比事后想象一部完美禁书更困难；但只有这样，缺页才不会被愿望冒名顶替。",
      },
    ],
    choices: [
      {
        id: "rescue-with-ledger-sample",
        label: "先救出囚禁者，再取灰皮目录与抽样卷宗",
        hint: "恢复可核验的证据链，并把每名幸存者的选择分别记录。",
        effects: {
          addEvidence: ["lamp_oil_ledger", "cold_ash"],
          statChanges: { civilianSafety: 8, publicFaith: -3 },
        },
        next: "original-pages-or-open-door",
      },
      {
        id: "split-rescue-and-archive",
        label: "分队开门与取样，同时留下完整取样清单",
        hint: "多保留一件技术证物，但分散行动会增加伤员风险。",
        effects: {
          addEvidence: ["broken_wrench"],
          statChanges: { civilianSafety: 3, wardenTrust: 2 },
        },
        next: "original-pages-or-open-door",
      },
    ],
  },

  "original-pages-or-open-door": {
    id: "original-pages-or-open-door",
    kind: "dialogue",
    title: "原本比人更怕火吗",
    focusCharacterId: "agnes",
    evidenceRecovery: true,
    lines: [
      {
        text: "通风渠出口前还有一道藏库。阿格尼丝在门楣下找到自己三年前刻的细痕，确认里面存放禁抄本原本。另一侧传来伤员咳嗽，狭窄石桥只能容一人通过；若先搬书箱，担架必须等待，若先送人，追兵可能封死藏库。",
        stageDirection: "原本封在涂蜡木箱中，共十二箱。担架有三副，最重的伤员已经无法自行吞咽。",
      },
      {
        speakerId: "agnes",
        emotion: "fear",
        text: "我为这些原本留下过一个人。那时我告诉诺安，复制品总会被说成伪造，只有带着档案馆水印和历代修补痕迹的纸能迫使教廷承认。现在同样的理由又站在门后，要求我让担架等待。我不知道坚持到哪里会变成崇拜物件。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "先计算，不用道德口号代替路径。担架通过石桥需要多久，书箱最少取哪几件能证明来源，追兵最快何时抵达。若四个数字允许兼顾，就不要制造悲壮选择；若确实不能，再明确谁承担哪一种损失。",
      },
      {
        speakerId: "seraphina",
        emotion: "neutral",
        text: "最重伤员两刻内必须喝水，担架全部通过需要半刻。木箱不能整批搬运，但可以取第一卷、目录卷和最后一次修订卷。三者足以展示时间跨度，其余内容已有副本，不必把每一张原纸都当作不可替代的圣物。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "可中间九箱里有被删去者亲手写下的边注。副本保留文字，没有纸张厚度、墨色变化和反复擦拭的痕迹。那些痕迹能证明一句话不是后来一次写成，而是在多年恐惧里逐渐改变。失去它们，审查过程会变得平滑。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "能否每箱取一页带修订痕迹的样本，拍下封签和排列，再将箱号刻在墙外？我们承认抽样无法代表全部，但它能保存方法证据。其余箱子若被焚毁，损失如实记录；若未来取回，也能按箱号恢复位置。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "可以。取样由我指出候选页，诺安随机选最终页，避免我只挑支持自己判断的内容。塞拉菲娜记录每次打开封签的时间，无旗者照看担架。这样没有一个人同时控制选择、取出、记录与携带。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "第二副担架上的人拒绝先走，他说自己只是送饭者，原本比他的名字重要。请告诉他救援次序不按历史价值排列。一个人不需要写过关键句子才配占用石桥，他也不能因轻视自己就把决定推给后来的赞歌。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "我来告诉他，也向他承认我曾把送饭记录放在目录末尾。没有送饭者，抄经人活不到写下边注；可档案总把维持生命的劳动压缩成杂项。若他同意，我会单独记录这条供应链，不把照料继续藏在思想史脚注里。",
      },
      {
        text: "第一副担架开始过桥。阿格尼丝与诺安依次打开十二只木箱，每箱只取一页。部分纸上是激烈质问，部分只是对错字的修正，还有一页记录某年冬天墨水冻住。她没有替看起来平凡的页面换成更适合公开展示的句子。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "追兵比预估早一刻。停止开第十一、十二箱，封存已取十页。我们不会为了满足预先宣布的样本数延误担架。报告注明后两箱未抽样，任何统计结论不得假装覆盖它们；方法的诚实包括承认执行被现实截断。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "让我再取目录卷，它离门只有四步。没有目录，十页很难回到原位置。我知道这听起来又像档案高过生命，但四步确实可能保住全部来源。请由担架领队判断石桥是否还有余量，不由我单独决定。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "领队说可等二十息，不能更多。我来计时，时间到就关门，不因你已经碰到箱子而延长。界限必须在行动前由不承担取卷欲望的人守住，否则每一次只差一步都会把担架留到最后。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "目录卷取到了，第十二息。其余原本留在藏库。我在门外写下没有带走的箱号，也写下自己想回头的冲动。若它们被烧，我会悲伤，但不把悲伤变成对获救者的债；若它们幸存，也不把幸存解释成某种超越选择的安排。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "三副担架全部通过。原本取样、目录和副本分开携带，任何一组都不完整。我们失去立即展示全部材料的便利，换来单次夺取无法抹除证据链。真正的代价写在清单上：两箱未抽样、十箱原地留存、无人因取书延误治疗。",
      },
    ],
    choices: [
      {
        id: "sample-originals-after-rescue",
        label: "先送担架，再按随机规则抽取原本样页",
        hint: "保住伤员并保存来源方法，但大部分原纸仍留在追兵身后。",
        effects: {
          addEvidence: ["lamp_oil_ledger"],
          statChanges: { civilianSafety: 8, publicFaith: -2 },
        },
        next: "three-evidence-crosscheck",
      },
      {
        id: "take-index-under-time-limit",
        label: "设定二十息硬期限，取回目录后立即撤离",
        hint: "强化证据定位能力，由担架领队而非抄写者掌握停止权。",
        effects: {
          addEvidence: ["cold_ash"],
          statChanges: { civilianSafety: 4, wardenTrust: 2 },
        },
        next: "three-evidence-crosscheck",
      },
    ],
  },

  "three-evidence-crosscheck": {
    id: "three-evidence-crosscheck",
    kind: "dialogue",
    title: "三件证物不说同一句话",
    focusCharacterId: "the_unflagged",
    evidenceRecovery: true,
    lines: [
      {
        text: "撤离队伍在旧钟房短暂停留。守灯账簿、无温余烬与折断扳手被放在三块不同颜色的布上，旁边是灰皮目录和原本抽样。无旗者要求所有人先分别写下每件证物能说明什么，再讨论它们之间的关系。",
        stageDirection: "钟房齿轮已经拆除，只剩三个深浅不同的圆形磨痕。追兵经过时，地板会先于脚步轻微震动。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "账簿说明特定时段有人领取灯油，也显示页面被撕；它不能单独证明灯油进入主祭坛。冷灰说明公开宣称的熄灭时刻与物理状态不符，却不能回答此前的光来自何处。扳手显示制式与金属来源错位，仍需工坊记录确认制造地点。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "灰皮目录补上了没收路径：三件物品曾在不同日期进入审查库，后来被归入同一个封存编号。这个共同编号可能表示审查者认为它们相关，也可能只是库房空间不足。目录能证明谁把它们放在一起，不能证明放在一起的判断正确。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "账簿里的用量与我参加过的节庆维护相近，但维护副灯和维护主祭坛可能使用同样的油。我的记忆可以帮助提出检验方法，不能把熟悉感写成确认。应当找守灯人核对容器、气味和领用程序。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "第一条互证链只到这里：账簿时间与冷灰时间彼此支持有人掩盖熄灭时序；供油对象仍待查。第二条链：扳手制式与本地金属提示嫁祸可能，采购单和工坊样本提供外部比对；制造者身份仍待查。不要把可能删掉。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "禁抄本里有一页提到幻光晶片，却比圣火熄灭早四十年。它能证明类似技术曾被讨论，不能证明眼前装置沿用同一设计。时间距离必须写在引用旁，否则古老记载会因看起来神秘，被误当成直接作案笔录。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "若公开这些限制，双方都会说我们在削弱证据。女神国会抓住不能确认主祭坛供油，卫道士会抓住不能确认本地制造，各自宣布最不利部分已经崩塌。可若隐藏限制，我们就亲手教会他们下一次怎样揭穿整条链。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "所以发布时不用一段宏大结论，而用证物卡：来源、保管路径、已确认、未确认、下一步检验、可能反证。任何人若只转抄已确认栏，也会留下明显缺口。格式不能阻止曲解，却能让曲解需要公开剪掉更多东西。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "我发现目录编号旁有我的旧缩写。三年前我曾整理过同一箱，却不记得见过扳手。可能是记忆失败，也可能扳手后来加入。请把我的缩写列为时间锚点，同时把我的失忆列为不确定，不因我是队友就选择更有利解释。",
      },
      {
        speakerId: "seraphina",
        emotion: "neutral",
        text: "扳手裂口里仍有祭坛石粉，可以和广场台阶样本比对；若一致，只能说明它接触过祭坛，不能说明由谁使用。若不一致，则应重新检查我们如何认定它来自现场。反证不是背叛路线，而是防止路线依赖错误物件。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "三件证物真正共同说明的，也许不是一个完整阴谋，而是多个机构都曾管理、移动或解释它们。我们可以追查责任网络，不必急着把所有线收束到一个方便击败的主谋。制度性伤害常由许多各自合理的小动作接力完成。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我会为每次转交加上签名缺口。没有签名不自动等于秘密行动，可能只是旧库房管理松散；但缺口集中出现在哪些日期，可以与人员调动、焚卷命令和静默室拘押对照。互证是让不同来源互相提问，不是逼它们齐声。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "我也提交一份可能反证：圣火仪式手册允许在极端天气增加副灯油，熄灭那夜恰有浓雾。若领油符合这条规定，账簿就未必异常。我们要寻找实际天气记录和副灯残留，不把对自己不利的程序藏起来。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "很好。证物链因此变得更慢，却更能承受敌对检查。最终报告只裁定可裁定之事：记录是否被撕、灰烬与宣称时间是否冲突、工具材料是否匹配、拘押与删改是否发生。至于这些事实能否证明女神，超出物证能够回答的范围。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "若三件证物中有一件后来被判伪，其余两件仍按自己的来源接受检验，不实行连坐。反过来也一样：一件可靠不能替另外两件洗清缺口。我们不是搭一座抽掉一块就倒塌的神坛，而是在铺许多可以单独返工的路。",
      },
    ],
    choices: [
      {
        id: "publish-evidence-limits",
        label: "公开三件证物的确认范围与可能反证",
        hint: "让证据链承受敌对核验，不以宏大结论掩盖缺口。",
        effects: {
          setFlags: ["published_evidence_limits"],
          statChanges: { publicFaith: -4, wardenTrust: 2 },
        },
        next: "seraphina-unspoken-prayer",
      },
      {
        id: "continue-crosschecking",
        label: "暂缓结论，先补做石粉、天气与工坊比对",
        hint: "减少立即公开的冲击，换取更能抵抗反证的调查记录。",
        effects: {
          setFlags: ["continued_evidence_crosscheck"],
          statChanges: { goddessTrust: 1, civilianSafety: 3 },
        },
        next: "seraphina-unspoken-prayer",
      },
    ],
  },

  "seraphina-unspoken-prayer": {
    id: "seraphina-unspoken-prayer",
    kind: "dialogue",
    title: "没有听众的祷词",
    focusCharacterId: "seraphina",
    lines: [
      {
        text: "众人从通风渠抵达废弃礼拜堂。这里没有圣像，只有墙上被搬空后留下的浅色轮廓。塞拉菲娜替伤员清洗手腕时，下意识念出祷词的开头，却在第一个称谓前停住。阿格尼丝没有催促，也没有把那次停顿记进证词。",
        stageDirection: "礼拜堂外，雾门的钟每隔一刻敲响一次。钟声既可能指挥追兵，也可能只是提醒修士更换守夜班次。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "从前我祈祷时，总知道谁会替我解释沉默。大祭司说延迟是考验，导师说痛苦是净化，骑士说没有回应正说明我们要守住秩序。现在那些解释都不在，我才发现自己可能从未允许沉默只作为沉默存在。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "黑色教廷会说，沉默就是答案所在之处。他们把解释搬进人的内心，再训练审查者判断谁的内心足够正确。外在祭坛可以拆，内在法庭却会跟着人走。我离开后仍常在自己的念头旁听见他们的笔。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "我不能替你们决定祷告意味着什么，也不能因无法核验就要求你们停止。但当祷告成为命令、预算、牢门或判决时，它必须接受与其他权力相同的追问。私人确信不需要使团许可，公共后果需要留下责任人。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "若我继续相信，蕾娜也许会觉得我在保护一切骗局；若我公开怀疑，广场上那些靠祷告熬过失去亲人的人会以为我嘲笑他们。我似乎只有两种姿势：替制度站着，或替反制度的人跪下。可两边都有人等我交出确定答案。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "那就先坐下。你可以说今天不知道，可以承认某段仪式曾安慰你，也承认它被用来封住别人的嘴。矛盾不是必须立即治好的病。审查者最喜欢催人完整，因为完整的人最容易被归档，仍在变化的人会让柜子关不上。",
      },
      {
        speakerId: "seraphina",
        emotion: "anger",
        text: "我愤怒的不是火需要灯油，而是有人把维护火焰的人藏起来，再要求朝圣者把机械故障当作自己的罪。我也不愿因为发现铜管，就把每一次真诚祈祷都称作愚昧。装置的解释抵达不了所有人的悲伤。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "这段话应由你自己写入记录，不作为女神国声明，也不作为无旗使团结论。署名意味着将来有人可以质疑你、引用你或提醒你改变过；它同时阻止双方把你的沉默剪成对自己有利的形状。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "我愿意替你保留初稿，包括划掉的句子，但是否公开由你决定。私抄档案教会我一件危险的事：保存并不自动高尚。若保存者从不给当事人撤回、延迟或解释的权利，档案也会成为一座更耐久的牢房。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "请保存两个版本。公开稿只写我愿意承担的判断，封存稿保留我的犹疑，并注明三年后必须重新征得同意才能开启。如果我死了，也不能把死亡当作默认授权。死者最容易被所有阵营招募，因为他们无法纠正口号。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我会照办，也把这条规则写进禁抄本的新目录：任何内心记录都标明公开范围、复核日期与撤回方式。我们不是要建立一座更诚实的全知档案馆，而是建立一套承认有些话属于说话者、并允许人改变的见证制度。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "我还想保留祷词停下来的位置，不补称谓，也不解释那一刻是怀疑还是敬畏。过去的抄经人总会把断句修成顺畅经文，可我现在需要那个缺口提醒自己：沉默不必立刻被任何学说占领，包括我明天可能更愿意相信的学说。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "那就用空框标记，不用省略号。省略号常暗示原本存在一句被拿走的话，空框只说明说话者选择停在这里。档案的符号也会诱导解释，我们无法消除所有诱导，却可以把符号规则公开，让读者知道自己正被什么形式轻轻推了一下。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "这份双版本记录由塞拉菲娜、阿格尼丝和一名不识教义的伤员共同验收。前两人检查语义与授权，第三人只回答普通读者能否分清事实、感受和未决问题。若只有受过神学训练的人能看懂边界，公开就仍是一种资格门槛。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "伤员读完后问我，祈祷是否还会帮助他。我只能说，我愿意陪他祈祷，也愿意在他不想祈祷时陪他坐着；至于帮助来自哪里，我不知道。第一次说出不知道并没有让穹顶坍塌，只让承诺缩小到我真正能够履行的范围。",
      },
    ],
    choices: [
      {
        id: "sign-limited-testimony",
        label: "支持塞拉菲娜署名公开有限证词",
        hint: "区分私人信仰与公共责任，不把犹疑包装成使团结论。",
        effects: { setFlags: ["seraphina_signed_limited_testimony"], statChanges: { goddessTrust: 2, publicFaith: -2 } },
        next: "unflagged-no-oath",
      },
      {
        id: "seal-personal-draft",
        label: "封存私人初稿，并设置复核与撤回期限",
        hint: "保护内心边界，但眼下能够公开的材料会更少。",
        effects: { statChanges: { goddessTrust: 1, civilianSafety: 2 } },
        next: "unflagged-no-oath",
      },
    ],
  },

  "unflagged-no-oath": {
    id: "unflagged-no-oath",
    kind: "dialogue",
    title: "无旗者不宣誓",
    focusCharacterId: "the_unflagged",
    lines: [
      {
        text: "信鸟在礼拜堂的破窗上等到了深夜。一月王国的第二封短函只有两句话：没有旗帜的人最终会被旗帜处置；没有舰队保护的证据最终会沉进海里。随信附来一小片蓝布，恰好能缝成使团所有人的臂章。",
        stageDirection: "无旗者把蓝布放在空圣像留下的石座上，没有让它碰到证据箱，也没有立刻投入火盆。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "这不是单纯威胁。他们的祖辈确实因没有足够船只失去过证人，也确实见过中立协议在军队抵达后变成废纸。若我只回答原则，他们会认为我们拿别人的命证明自己洁白；若我宣誓，他们以后会把每份记录当成流亡战争的弹药。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "可以把信件原样交给获救者，让他们分别选择是否登船。使团不替他们集体接受，也不以留队为忠诚测试。诺安也许愿去海上印刷，我也许愿留下完成目录；同一场救援不必把所有人送往同一个政治结论。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "守卫会利用分流。他们会说登船者承认叛国，留下者证明审查正当。任何差异都会被解释成阵营。我们是否有办法让选择的理由一同公开，而不是只公布最后去了哪条路？",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "每个人写一张不超过半页的自述，可选择公开、延后公开或永不公开。名单只记录运输需求，不记录信仰判断。船方若拒绝接受这种边界，我们就请求他们把拒绝写下来；不肯留下书面条件的援助不能进入使团计划。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "我还要加一条：任何印刷者不得删去诺安与我的分歧。一月王国若把我塑造成终于醒悟的修女，我会公开反驳；黑色教廷若把我说成被外敌诱骗，我也会公开反驳。我的信仰与反抗都不供任何国家代领。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "那无旗者自己的立场是什么？不能永远只替别人保存句子。你选择打开祭坛、保护粮路、闯进静默室，每一步都改变了谁能活、谁能说话。若中立只在结算时自称没有选择，它会成为最不诚实的一面旗。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "我的立场是：任何宣称替所有人给出最终答案的权力，都必须允许证据穿过它的边界；任何救援都不能购买幸存者的结论；任何秘密若以保护人为理由，都要留下期限与责任人。这不是超然，它会让我同时得罪所有拒绝被核验的人。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "也包括我。若我因害怕档案再被焚毁而拒绝当事人撤回，你必须阻止我；若塞拉菲娜把善意变成替伤员决定什么最能安慰他，你也必须阻止她。无旗不是没有同伴，而是不把同伴从审视中豁免。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "我愿意跟随这样的使团，但不向它交出祈祷。我们可以并肩守住证人，而不要求彼此的内心排成队列。若某天我再次借圣女身份命令人，请先问那道命令保护了谁、又让谁失去拒绝的权利。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "答复就写：我们接受受伤者自愿选择的运输，不接受集体效忠；允许完整复制经当事人授权的档案，不接受预设结论；愿在战后公开账目、船位与全部条件。蓝布退回一半，另一半封入交易记录，证明邀请确实存在。",
      },
      {
        speakerId: "agnes",
        emotion: "doubt",
        text: "若船最终没有来，我会在目录里写清楚是谈判失败，不写成无旗原则必然要求的牺牲。原则没有流血，具体的人会。每次代价都应当有姓名、伤势和本可选择的替代方案，否则后来者太容易歌颂我们的坚定，而忘记改进救援。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "若船来了，我也不会把它当作一月王国认可我们的奇迹。那只证明此刻双方找到一项有限合作。合作可以被感谢，也可以在下一件事上被拒绝。我们不把一次善意扩大成永久清白，不把一次勒索扩大成永恒邪恶。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "neutral",
        text: "我会在使团日志首页留下空位，记录将来有人因这次决定失去什么。无旗立场若只保存自己的辩词，迟早会成为最擅长写报告的国家。我们需要让受影响者有权在报告旁写下反证，哪怕那会让今天的选择显得不再英勇。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "蓝布也要注明由谁剪开、为何只退一半。百年后的人可能只看见布片，就编造使团曾秘密效忠或公开羞辱流亡者。物件不会自己说真话，它只会比证人活得更久。若没有来源与争议记录，保存得越完整，误解反而越有威严。",
      },
    ],
    choices: [
      {
        id: "publish-neutral-protocol",
        label: "公开无旗使团的三条责任边界",
        hint: "明确中立是一套可被追责的行动规则，而非逃避选择。",
        effects: { setFlags: ["unflagged_published_protocol"], statChanges: { publicFaith: -4, wardenTrust: 2 } },
        next: "agnes-witness-covenant",
      },
      {
        id: "negotiate-voluntary-passage",
        label: "逐人确认登船意愿，再与一月王国谈运输",
        hint: "优先建立安全退路，不以集体去向替代个人证词。",
        effects: { setFlags: ["unflagged_negotiated_voluntary_passage"], statChanges: { civilianSafety: 6, goddessTrust: -1 } },
        next: "agnes-witness-covenant",
      },
    ],
  },

  "agnes-witness-covenant": {
    id: "agnes-witness-covenant",
    kind: "dialogue",
    title: "抄写者的退出权",
    focusCharacterId: "agnes",
    lines: [
      {
        text: "临行前，阿格尼丝在目录首页添上一张新纸。她没有写宣言，而是列出七条可以让见证者退出、修正、延迟公开与指定继承保管人的办法。纸边留着大片空白，供后来的人指出这套办法仍会伤害谁。",
        stageDirection: "第一队见证者已经进入雾道，灯光被布罩压成微弱的蓝点。战斗队伍将在下一次钟响后沿主路出发。",
      },
      {
        speakerId: "agnes",
        emotion: "neutral",
        text: "我曾以为私抄就是抵抗，因为被禁的字只要活下来，权力就输了一次。现在我知道，若抄写者不问当事人愿不愿被永久保存，抵抗也可能掠夺。档案需要的不只是进入权，还要有退出权和被重新描述的权利。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "有些记录关系公共伤害，当事人撤回后该怎么办？若审查官要求删除自己签过的命令，不能因为他声称那是私人悔恨就让责任消失。保护内心与追究公共行为之间仍需要一道明确边界。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "退出权适用于私人感受、未经同意的肖像与不影响他人安全的细节；对拘押、扣粮、篡改和命令链，只能补充说明，不能抹除事实。谁主张保留，谁要说明公共利益；谁主张删除，也要留下请求本身及裁定过程。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "再加一条：保管者不能以危险为由无限延期。每次延期必须写明具体风险、复核日期和参与决定的人。过去教廷最常用的不是焚书，而是永远等待适当时机；等到见证者去世，秘密便自动变成无人能开启的坟。",
      },
      {
        speakerId: "seraphina",
        emotion: "resolve",
        text: "我的封存稿也遵守这条。三年后若找不到我，就由两名彼此立场不同的见证人判断哪些内容仍属私人，不能因为我曾是圣女便让每一句迟疑都成为历史财产。身份越容易被利用，授权越要狭窄。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "doubt",
        text: "一月王国可能拒绝印刷附带撤回条款的文本，他们会担心敌对势力借此抽走关键证词。我们要承认那是真实风险，同时坚持副本更新必须保留旧版索引：修正可以改变结论，却不能伪装成此前从未写过。",
      },
      {
        speakerId: "agnes",
        emotion: "anger",
        text: "黑色教廷会把退出权说成证人终于悔悟，一月王国会把保留旧版说成证人无法真正撤回。两边都会截取最方便的一半。因此规则必须由具体案例不断校正，而不是刻成一块自称解决所有问题的石碑。",
      },
      {
        speakerId: "seraphina",
        emotion: "fear",
        text: "钟声停了。无声追兵开始移动时不会有战号，我们只能从雾里灯光消失的顺序判断方向。我会留在阿格尼丝身边，不是保护一位掌握真相的人，而是保护一个可能犯错、因此需要同伴校对的保管者。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "队伍目标也写清楚：护送人优先于护送纸，保护分歧优先于制造统一口号，取得胜利不等于获得解释女神的资格。我们能证明装置如何运作、命令如何传递、记录如何被改；不能把未知部分据为任何一方的终局。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我会带着索引进入雾门，也带着允许别人纠正我的空白页。如果我们抵达圣所，我要问的不是那里有没有一个能终止争论的答案，而是谁建造了裁决、谁从裁决获利、谁被迫把内心交给它。其余部分，让人继续诚实地不知道。",
      },
      {
        speakerId: "seraphina",
        emotion: "doubt",
        text: "抵达圣所后，若我因熟悉仪式而成为唯一能接近装置的人，请把操作过程逐步复述给所有见证者。熟悉不等于所有权，虔诚也不等于安全。任何必须由我秘密完成的步骤，都要说明技术原因，并由另一人记录开始与结束的时间。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "若蕾娜能解释机械、塞拉菲娜能解释仪式、阿格尼丝能解释档案，我们仍需让三种解释彼此留下无法覆盖的空白。最终报告不会选出一位总译者。它只会列出各自能证明到哪里，以及跨过哪一步就从证据进入了判断。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "那就出发。今天被救出的人不欠我们赞美，带走的纸也不欠我们胜利。若无声行军之后只剩部分目录和几个互相矛盾的证人，我们仍照原样保存。残缺而诚实的见证，比完整却替所有人说完的话更有资格走向明天。",
      },
      {
        speakerId: "the_unflagged",
        emotion: "resolve",
        text: "交接书最后不写愿真相获胜，只写愿每一个结论都保留被追问的入口。胜利容易让人停止检查自己，失败也容易让人把错误神圣化。我们能留下的最好道路不是通向唯一答案，而是让后来者仍能抵达原始材料、幸存者和我们的犹疑。",
      },
      {
        speakerId: "agnes",
        emotion: "resolve",
        text: "我在空白页角落写下自己的保管期限：直到雾门行动结束后的第七日。届时无论我是否愿意，都必须把索引交给三方共同复核。刚获得发言权的人最容易把继续掌握它当成使命；期限提醒我，见证属于经历过事件的人群，不属于最先替它装订的人。交出去以后，我仍可作证，却不再能独自决定目录的形状。",
      },
    ],
    choices: [
      {
        id: "adopt-witness-exit-rights",
        label: "签署见证者退出、修正与限期复核规则",
        hint: "保留公共责任记录，同时承认私人证词不属于档案馆。",
        effects: { setFlags: ["witnesses_adopted_exit_rights"], statChanges: { publicFaith: -2, goddessTrust: 1 } },
        next: "three-custodians",
      },
      {
        id: "prioritize-living-witnesses",
        label: "确定无声行军中人员优先于纸面档案",
        hint: "即使档案可能残缺，也不让任何人成为保存文本的耗材。",
        effects: { setFlags: ["protected_living_witnesses"], statChanges: { civilianSafety: 8, wardenTrust: -1 } },
        next: "three-custodians",
      },
    ],
  },
};
