import './model-gallery.css';
import './model-gallery-standalone.css';
import { modelGalleryAssets, modelGallerySummary, mountModelGallery } from './render/modelGallery';

const app = document.querySelector<HTMLElement>('#model-gallery-app');
if (!app) throw new Error('Missing #model-gallery-app');

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] ?? char));
const summary = modelGallerySummary();
const cards = modelGalleryAssets.map(asset => '<button type="button" class="model-gallery-card" data-model-select="' + escapeHtml(asset.id) + '" data-model-category="' + escapeHtml(asset.category) + '" data-model-maker="' + escapeHtml(asset.maker) + '" aria-label="查看 ' + escapeHtml(asset.title) + '"><strong>' + escapeHtml(asset.title) + '</strong><small>' + escapeHtml(asset.maker) + ' · ' + escapeHtml(asset.category) + '</small><span>' + escapeHtml(asset.url.split('/').pop() ?? asset.url) + '</span></button>').join('');

app.innerHTML = [
  '<main class="model-gallery-standalone">',
  '<header class="model-gallery-standalone-header"><div><p class="eyebrow">MODEL QA WORKBENCH · 美术检验</p><h1>模型检验台</h1><p>用于检查模型搭建效果、动画接入、运行时缩放和返工对象。这里是独立展示页，不进入游戏主页流程。</p></div><a class="model-gallery-home-link" href="/">返回游戏主页</a></header>',
  '<section class="model-gallery-page">',
  '<section class="model-gallery-stats" aria-label="模型制作方统计"><article><small>收录模型文件</small><strong>' + summary.total + '</strong><span>去重后的 GLB</span></article><article><small>K3 制作</small><strong>' + summary.k3 + '</strong><span>含环境与角色回退</span></article><article><small>GPT 制作</small><strong>' + summary.gpt + '</strong><span>img2threejs 主线模型</span></article><article><small>项目 / 第三方</small><strong>' + summary.other + '</strong><span>外部模型与整理资产</span></article></section>',
  '<div class="model-gallery-toolbar"><label for="model-gallery-search">搜索模型<input id="model-gallery-search" type="search" placeholder="名称或文件名"></label><label for="model-gallery-filter">筛选分类<select id="model-gallery-filter"><option value="全部">全部分类</option><option value="角色">角色</option><option value="敌人">敌人</option><option value="Boss">Boss</option><option value="环境">环境</option><option value="K3 回退">K3 回退</option></select></label><label for="model-gallery-maker-filter">筛选制作方<select id="model-gallery-maker-filter"><option value="全部">全部制作方</option><option value="K3">K3 制作</option><option value="GPT">GPT / img2threejs</option><option value="项目/第三方">项目 / 第三方</option></select></label></div>',
  '<section class="model-gallery-layout"><div class="model-gallery-stage"><canvas id="model-gallery-canvas" aria-label="当前选中模型的 3D 预览"></canvas><div class="model-gallery-status" data-model-status role="status" aria-live="polite">准备预览</div></div><aside class="model-gallery-detail"><p class="eyebrow" data-model-source>当前制作来源</p><h2 data-model-title>加载中</h2><p class="model-gallery-note">拖动旋转，滚轮缩放。模型会使用运行时 manifest 的 visualScale，并自动播放首个 idle 动画。</p><dl class="model-gallery-meta"><div><dt>运行路径</dt><dd data-model-path>—</dd></div><div><dt>运行时缩放</dt><dd data-model-scale>—</dd></div><div><dt>动画片段</dt><dd data-model-actions>加载后读取</dd></div><div><dt>K3 资产体积</dt><dd data-model-k3-size>统计中</dd></div></dl></aside></section>',
  '<div class="model-gallery-grid" aria-label="模型列表">' + cards + '</div>',
  '</section></main>',
].join('');

const page = app.querySelector<HTMLElement>('.model-gallery-page');
if (!page) throw new Error('Missing model gallery page');
mountModelGallery(page, 'arthur');

const search = page.querySelector<HTMLInputElement>('#model-gallery-search');
const filter = page.querySelector<HTMLSelectElement>('#model-gallery-filter');
const makerFilter = page.querySelector<HTMLSelectElement>('#model-gallery-maker-filter');
const cardNodes = [...page.querySelectorAll<HTMLElement>('[data-model-select]')];
const applyFilter = () => {
  const query = search?.value.trim().toLowerCase() ?? '';
  const category = filter?.value ?? '全部';
  const maker = makerFilter?.value ?? '全部';
  cardNodes.forEach(card => {
    const matchesCategory = category === '全部' || card.dataset.modelCategory === category;
    const matchesMaker = maker === '全部' || card.dataset.modelMaker === maker;
    const matchesQuery = !query || card.textContent?.toLowerCase().includes(query);
    card.hidden = !(matchesCategory && matchesMaker && matchesQuery);
  });
};
search?.addEventListener('input', applyFilter);
filter?.addEventListener('change', applyFilter);
makerFilter?.addEventListener('change', applyFilter);
