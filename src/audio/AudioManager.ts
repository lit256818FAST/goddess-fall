export type AudioScene='title'|'home'|'story'|'battle'|'boss'|'library'|'archive'|'victory'|'defeat'|'silent';
export type SoundEffect='click'|'select'|'cancel'|'terrain'|'endPhase'|'error'|'move'|'attackHealth'|'attackFaith'|'skill'|'hit'|'victory'|'defeat'|'bossWarning';
export type MusicTrackId='archiveGate'|'archiveGateAlt'|'lanternMap'|'lanternMapAlt'|'ashesMap'|'ashesMapAlt'|'shadowMarch'|'shadowMarchBoss'|'abyssGatefall'|'abyssGatefallSide';
export type MusicSceneOptions={track?:MusicTrackId;campaignId?:'arthur-main'|'unflagged-side';bossPhase?:1|2};

type AudioContextConstructor=new(options?:AudioContextOptions)=>AudioContext;

interface AudioPreferences{
  muted:boolean;
  volume:number;
}

export interface SceneTrack{
  src:string;
  title:string;
  creator:string;
  license:'CC0'|'user-provided'|'unknown';
  gain:number;
}

const investigationTrack:SceneTrack={
  src:'/assets/audio/unsolved-investigation.ogg',
  title:'Unsolved Investigation',
  creator:'isaiah658',
  license:'CC0',
  gain:.5,
};

const originalStoryTrack:SceneTrack={src:'/assets/audio/original-story.wav',title:'Ashes Between Words · original',creator:'Goddess Fall Audio Team',license:'CC0',gain:.46};
const originalLibraryTrack:SceneTrack={src:'/assets/audio/original-library.wav',title:'The Scriptorium · original',creator:'Goddess Fall Audio Team',license:'CC0',gain:.42};
const originalArchiveTrack:SceneTrack={src:'/assets/audio/original-archive.wav',title:'Ledger of Consequences · original',creator:'Goddess Fall Audio Team',license:'CC0',gain:.44};

const importedTrack=(file:string,title:string,gain:number):SceneTrack=>({src:`/assets/audio/music-lazy/${file}`,title,creator:'用户提供音频 · 待确认授权',license:'user-provided',gain});

/** User-selected music catalog. Original CC0/procedural tracks remain as fallback. */
export const MUSIC_TRACKS:Readonly<Record<MusicTrackId,SceneTrack>>={
  archiveGate:importedTrack('Archive%20Gate.mp3','Archive Gate · 标题入口',.44),
  archiveGateAlt:importedTrack('Archive%20Gate_1.mp3','Archive Gate_1 · 温暖剧情/藏书馆',.42),
  lanternMap:importedTrack('Lantern%20Map.mp3','Lantern Map · 主页与战前准备',.44),
  lanternMapAlt:importedTrack('Lantern%20Map_1.mp3','Lantern Map_1 · 剧情备用',.42),
  ashesMap:importedTrack('Ashes%20on%20the%20Map.mp3','Ashes on the Map · 悲伤剧情',.42),
  ashesMapAlt:importedTrack('Ashes%20on%20the%20Map_1.mp3','Ashes on the Map_1 · 悲伤剧情备用',.42),
  shadowMarch:importedTrack('Shadow%20Council%20March.mp3','Shadow Council March · 全部普通战斗/剧情过渡',.46),
  shadowMarchBoss:importedTrack('Shadow%20Council%20March_1.mp3','Shadow Council March_1 · Boss 第一阶段',.44),
  abyssGatefall:importedTrack('Abyss%20Gatefall.mp3','Abyss Gatefall · Boss 第二阶段',.46),
  abyssGatefallSide:importedTrack('Abyss%20Gatefall_1.mp3','Abyss Gatefall_1 · 无旗使团战斗',.46),
};

/** Previous scene tracks remain available for rollback and procedural fallback. */
export const ORIGINAL_SCENE_TRACKS:Readonly<Partial<Record<AudioScene,SceneTrack>>>={
  title:originalArchiveTrack,home:investigationTrack,story:originalStoryTrack,library:originalLibraryTrack,archive:originalArchiveTrack,
  battle:{src:'/assets/audio/original-battle.wav',title:'No Flag, No Retreat · original',creator:'Goddess Fall Audio Team',license:'CC0',gain:.52},
  boss:{src:'/assets/audio/original-boss.wav',title:'The Veiled Furnace · original',creator:'Goddess Fall Audio Team',license:'CC0',gain:.48},
};

export const SCENE_TRACKS:Partial<Record<AudioScene,SceneTrack>>={
  title:MUSIC_TRACKS.archiveGate,
  home:MUSIC_TRACKS.lanternMap,
  story:MUSIC_TRACKS.lanternMapAlt,
  library:MUSIC_TRACKS.archiveGateAlt,
  archive:MUSIC_TRACKS.archiveGateAlt,
  battle:MUSIC_TRACKS.shadowMarch,
  boss:MUSIC_TRACKS.shadowMarchBoss,
};

export const sceneTrackFor=(scene:AudioScene,options:MusicSceneOptions={}):SceneTrack|undefined=>{
  if(options.track)return MUSIC_TRACKS[options.track];
  if(scene==='battle'&&options.campaignId==='unflagged-side')return MUSIC_TRACKS.abyssGatefallSide;
  if(scene==='boss'&&options.bossPhase===2)return MUSIC_TRACKS.abyssGatefall;
  return SCENE_TRACKS[scene];
};

export type SceneAudioMode='track'|'procedural'|'silent';

export interface SceneAudioDefinition{
  source:string;
  mode:SceneAudioMode;
  family:'title'|'home'|'story'|'battle'|'boss'|'result'|'silent';
}

/**
 * Stable, public scene-to-source contract.  Procedural sources are named just
 * like files so browser QA can prove an audible scene change without relying
 * on prose or private AudioContext nodes.
 */
export const SCENE_AUDIO:Readonly<Record<AudioScene,SceneAudioDefinition>>={
  title:{source:MUSIC_TRACKS.archiveGate.src,mode:'track',family:'title'},
  home:{source:MUSIC_TRACKS.lanternMap.src,mode:'track',family:'home'},
  story:{source:MUSIC_TRACKS.lanternMapAlt.src,mode:'track',family:'story'},
  battle:{source:MUSIC_TRACKS.shadowMarch.src,mode:'track',family:'battle'},
  boss:{source:MUSIC_TRACKS.shadowMarchBoss.src,mode:'track',family:'boss'},
  library:{source:MUSIC_TRACKS.archiveGateAlt.src,mode:'track',family:'story'},
  archive:{source:MUSIC_TRACKS.archiveGateAlt.src,mode:'track',family:'story'},
  victory:{source:'/assets/audio/original-victory.wav',mode:'track',family:'result'},
  defeat:{source:'/assets/audio/original-defeat.wav',mode:'track',family:'result'},
  silent:{source:'silent',mode:'silent',family:'silent'},
};

export type AudioSceneEventState='requested'|'started'|'playing'|'fallback';

export interface AudioSceneEventDetail{
  scene:AudioScene;
  source:string;
  mode:SceneAudioMode;
  state:AudioSceneEventState;
}

export const sceneAudioDefinition=(scene:AudioScene)=>SCENE_AUDIO[scene];

export const AUDIO_UI_TEXT={
  settings:'声音设置',
  enable:'开启声音',
  mute:'静音',
  mutedLabel:'声音已关',
  soundLabel:'声音',
  volume:'音量',
  masterVolume:'主音量',
  enabled:'声音已启用',
  unlock:'点击页面启用声音',
  unsupported:'此浏览器不支持声音',
  unavailable:'声音暂不可用',
  loading:'正在加载场景音乐',
  mutedStatus:'已静音',
  fullscreen:'进入全屏',
  exitFullscreen:'退出全屏',
  fullscreenUnavailable:'当前浏览器不支持全屏',
} as const;

export const configureLazyTrack=<T extends Pick<HTMLAudioElement,'preload'|'loop'|'src'>>(audio:T,src:string)=>{
  audio.preload='none';
  audio.loop=true;
  audio.src=src;
  return audio;
};

const STORAGE_KEY='goddess-fall:audio:v1';
const DEFAULT_PREFERENCES:AudioPreferences={muted:false,volume:.42};
export const volumeFromPercent=(value:string)=>Math.min(1,Math.max(0,Number(value)/100));

function readPreferences(storage:Storage|undefined):AudioPreferences{
  if(!storage)return {...DEFAULT_PREFERENCES};
  try{
    const value=JSON.parse(storage.getItem(STORAGE_KEY)??'null') as Partial<AudioPreferences>|null;
    return {
      muted:typeof value?.muted==='boolean'?value.muted:DEFAULT_PREFERENCES.muted,
      volume:typeof value?.volume==='number'&&Number.isFinite(value.volume)
        ?Math.min(1,Math.max(0,value.volume))
        :DEFAULT_PREFERENCES.volume,
    };
  }catch{return {...DEFAULT_PREFERENCES}}
}

export class AudioManager{
  private context?:AudioContext;
  private master?:GainNode;
  private music?:GainNode;
  private effects?:GainNode;
  private sceneNodes:AudioScheduledSourceNode[]=[];
  private rhythmTimer?:number;
  private scene:AudioScene='silent';
  private requestedScene:AudioScene='title';
  private requestedOptions:MusicSceneOptions={};
  private preferences=readPreferences(globalThis.localStorage);
  private unlocked=false;
  private controls?:HTMLElement;
  private status?:HTMLElement;
  private trackCache=new Map<string,HTMLAudioElement>();
  private currentTrack?:HTMLAudioElement;
  private currentTrackSrc?:string;
  private trackRequest=0;
  private fadeTimers=new Map<HTMLAudioElement,number>();
  private activeSource='silent';
  private playbackState:AudioSceneEventState='requested';

  constructor(){
    if(typeof addEventListener!=='function')return;
    const unlock=(event:Event)=>{
      void this.unlock();
      const target=event.target;
      if(!(target instanceof Element&&target.closest('.fullscreen-quick')))void this.autoEnterLandscapeFullscreen();
    };
    addEventListener('pointerdown',unlock,{once:true,capture:true});
    // iOS Safari versions without Pointer Events only expose touchstart.
    // Keep this listener passive so it never delays the first tap.
    addEventListener('touchstart',unlock,{once:true,capture:true,passive:true});
    addEventListener('keydown',unlock,{once:true,capture:true});
    addEventListener('orientationchange',()=>{void this.autoEnterLandscapeFullscreen();this.syncControls()});
    addEventListener('resize',()=>this.syncControls());
    addEventListener('click',event=>{
      const target=event.target;
      if(target instanceof Element&&target.closest('button')&&!target.closest('[data-audio-control]'))this.playSfx('click');
    },{capture:true});
  }

  mountControls(parent:HTMLElement=document.body){
    if(this.controls?.isConnected)return;
    const root=document.createElement('section');
    root.className='audio-controls';
    root.dataset.audioControl='';
    root.setAttribute('aria-label',AUDIO_UI_TEXT.settings);
    root.innerHTML=`<button type="button" class="settings-toggle" aria-expanded="false" aria-controls="game-settings" aria-label="打开设置" title="设置"><span aria-hidden="true">⚙</span></button><button type="button" class="fullscreen-quick" aria-label="进入全屏">${AUDIO_UI_TEXT.fullscreen}</button><div id="game-settings" class="settings-panel" hidden><div class="settings-heading"><strong>设置</strong><button type="button" class="settings-close" aria-label="关闭设置">×</button></div><button type="button" class="fullscreen-toggle">${this.fullscreenLabel()}</button><button type="button" class="audio-toggle" aria-pressed="${this.preferences.muted}" aria-label="${this.preferences.muted?AUDIO_UI_TEXT.enable:AUDIO_UI_TEXT.mute}"><span class="audio-mark" aria-hidden="true"></span><span class="audio-label">${this.preferences.muted?AUDIO_UI_TEXT.mutedLabel:AUDIO_UI_TEXT.soundLabel}</span></button><label><span>${AUDIO_UI_TEXT.volume}</span><input type="range" min="0" max="100" step="1" value="${Math.round(this.preferences.volume*100)}" aria-label="${AUDIO_UI_TEXT.masterVolume}"></label><button type="button" class="return-title">返回标题</button><span class="audio-status" aria-live="polite">${this.unlocked?AUDIO_UI_TEXT.enabled:AUDIO_UI_TEXT.unlock}</span></div>`;
    parent.append(root);
    this.controls=root;
    this.status=root.querySelector('.audio-status')??undefined;
    const panel=root.querySelector<HTMLElement>('#game-settings');
    const saveButton=document.createElement('button');
    saveButton.type='button';
    saveButton.className='save-now';
    saveButton.textContent='保存当前进度';
    saveButton.addEventListener('click',async()=>{
      await this.unlock();
      dispatchEvent(new CustomEvent('goddess:save-now'));
    });
    panel?.insertBefore(saveButton,this.status??null);
    const settingsToggle=root.querySelector<HTMLButtonElement>('.settings-toggle');
    const closeSettings=()=>{if(panel){panel.hidden=true}settingsToggle?.setAttribute('aria-expanded','false')};
    settingsToggle?.addEventListener('click',()=>{if(!panel)return;panel.hidden=!panel.hidden;settingsToggle.setAttribute('aria-expanded',String(!panel.hidden));});
    root.querySelector<HTMLButtonElement>('.settings-close')?.addEventListener('click',closeSettings);
    root.querySelector<HTMLButtonElement>('.fullscreen-toggle')?.addEventListener('click',()=>{void this.toggleFullscreen()});
    root.querySelector<HTMLButtonElement>('.fullscreen-quick')?.addEventListener('click',()=>{void this.toggleFullscreen()});
    root.querySelector<HTMLButtonElement>('.return-title')?.addEventListener('click',()=>{closeSettings();dispatchEvent(new CustomEvent('goddess:return-title'));});
    root.querySelector<HTMLButtonElement>('.audio-toggle')?.addEventListener('click',async()=>{
      await this.unlock();
      this.preferences.muted=!this.preferences.muted;
      this.applyVolume(.08);
      this.persist();
      this.syncControls();
    });
    const volumeInput=root.querySelector<HTMLInputElement>('input');
    volumeInput?.addEventListener('input',async()=>{
      const volume=volumeFromPercent(volumeInput.value);
      await this.unlock();
      this.preferences.volume=volume;
      if(this.preferences.volume>0)this.preferences.muted=false;
      this.applyVolume(.04);
      this.persist();
      this.syncControls();
    });
    const fullscreenEvents=['fullscreenchange','webkitfullscreenchange'] as const;
    fullscreenEvents.forEach(event=>addEventListener(event,()=>this.syncControls()));
  }

  async unlock(){
    // Pointer and touch events can both fire for one mobile tap. Do not start
    // two competing media requests for that single gesture.
    if(this.unlocked)return true;
    const context=this.ensureContext();
    if(!context){
      // A browser may expose HTMLAudioElement but not Web Audio. Keep the
      // media-track path usable instead of treating that as total failure.
      if(typeof Audio==='function'){
        this.unlocked=true;
        this.startScene(this.requestedScene,this.requestedOptions);
        this.syncControls();
        return true;
      }
      this.setStatus(AUDIO_UI_TEXT.unsupported);return false;
    }
    try{
      // Start the HTML track before awaiting resume: on mobile Safari the
      // play() call must happen inside the same user-gesture task.
      this.unlocked=context.state!=='closed';
      if(this.unlocked)this.startScene(this.requestedScene,this.requestedOptions);
      if(context.state==='suspended')await context.resume();
      this.unlocked=context.state==='running';
      if(this.unlocked)this.startScene(this.requestedScene,this.requestedOptions);
      this.syncControls();
      return this.unlocked;
    }catch{
      this.unlocked=false;
      this.setStatus(AUDIO_UI_TEXT.unavailable);
      return false;
    }
  }

  setScene(scene:AudioScene,options:MusicSceneOptions={}){
    const previousTrack=sceneTrackFor(this.requestedScene,this.requestedOptions)?.src;
    const nextTrack=sceneTrackFor(scene,options)?.src;
    const changed=scene!==this.requestedScene||scene!==this.scene||previousTrack!==nextTrack;
    this.requestedScene=scene;
    this.requestedOptions=options;
    if(changed)this.publishScene(scene,'requested');
    if(this.unlocked)this.startScene(scene,options);
  }

  playSfx(effect:SoundEffect){
    const context=this.context;
    if(!this.unlocked||!context||!this.effects||this.preferences.muted)return;
    const now=context.currentTime;
    const tone=(frequency:number,duration:number,level:number,type:OscillatorType='sine',endFrequency=frequency)=>{
      const oscillator=context.createOscillator(),gain=context.createGain();
      oscillator.type=type;
      oscillator.frequency.setValueAtTime(frequency,now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),now+duration);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(level,now+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      oscillator.connect(gain).connect(this.effects!);
      oscillator.start(now);oscillator.stop(now+duration+.02);
    };
    if(effect==='click')tone(520,.055,.035,'sine',420);
    if(effect==='select')tone(460,.09,.045,'sine',680);
    if(effect==='cancel')tone(300,.1,.04,'triangle',190);
    if(effect==='terrain'){tone(250,.16,.055,'triangle',420);this.toneAt(560,.2,.028,'sine',720)}
    if(effect==='endPhase'){tone(132,.18,.06,'triangle',92);this.toneAt(264,.24,.035,'sine',198)}
    if(effect==='error')tone(180,.16,.05,'square',105);
    if(effect==='move'){tone(150,.11,.075,'triangle',220);setTimeout(()=>this.toneAt(230,.08,.045,'triangle',300),65)}
    if(effect==='attackHealth')tone(210,.18,.12,'sawtooth',70);
    if(effect==='attackFaith'){tone(390,.24,.08,'sine',760);this.toneAt(585,.2,.045,'triangle',880)}
    if(effect==='skill'){tone(300,.16,.07,'triangle',520);this.toneAt(660,.22,.04,'sine',880)}
    if(effect==='hit'){tone(95,.13,.14,'square',45);this.noiseBurst(.1,.055)}
    if(effect==='victory'){[0,150,300].forEach((delay,index)=>setTimeout(()=>this.toneAt([392,494,587][index],.42,.07,'triangle'),delay))}
    if(effect==='defeat'){tone(185,.7,.08,'sawtooth',62);setTimeout(()=>this.toneAt(138,.65,.06,'triangle',46),110)}
    if(effect==='bossWarning'){tone(92,.48,.12,'square',58);setTimeout(()=>this.toneAt(82,.5,.11,'square',52),560)}
  }

  dispose(){
    this.stopScene();
    for(const track of this.trackCache.values()){track.pause();track.removeAttribute('src');track.load()}
    this.trackCache.clear();
    this.controls?.remove();
    void this.context?.close();
  }

  private ensureContext(){
    if(this.context)return this.context;
    const Context=(globalThis.AudioContext??(globalThis as typeof globalThis&{webkitAudioContext?:AudioContextConstructor}).webkitAudioContext);
    if(!Context)return undefined;
    const context=new Context({latencyHint:'interactive'});
    const master=context.createGain(),music=context.createGain(),effects=context.createGain();
    master.gain.value=0;
    music.gain.value=.34;
    effects.gain.value=.72;
    music.connect(master);effects.connect(master);master.connect(context.destination);
    this.context=context;this.master=master;this.music=music;this.effects=effects;
    this.applyVolume(.5);
    return context;
  }

  private startScene(scene:AudioScene,options:MusicSceneOptions={}){
    const trackForRequest=sceneTrackFor(scene,options);
    if(!this.context||!this.music)return;
    if(scene===this.scene&&(scene==='silent'||scene==='victory'||scene==='defeat'||trackForRequest?.src===this.currentTrackSrc))return;
    this.stopProceduralScene();
    this.scene=scene;
    if(scene==='silent'){
      this.trackRequest++;
      this.fadeOutTrack(this.currentTrack);
      this.currentTrack=undefined;this.currentTrackSrc=undefined;
      this.publishScene(scene,'started');
      return;
    }
    if(scene==='victory'||scene==='defeat'){
      this.trackRequest++;
      this.fadeOutTrack(this.currentTrack);
      this.currentTrack=undefined;this.currentTrackSrc=undefined;
      this.playSfx(scene);
      const resultTrack=SCENE_TRACKS[scene];
      if(resultTrack)void this.startResultTrack(scene,resultTrack);
      else {this.startResultMusic(scene);this.publishScene(scene,'playing');}
      return;
    }
    const track=trackForRequest;
    if(track){
      this.publishScene(scene,'started',track.src);
      void this.startTrack(scene,track);
      if(scene==='boss')this.playSfx('bossWarning');
      return;
    }
    this.trackRequest++;
    this.fadeOutTrack(this.currentTrack);
    this.currentTrack=undefined;this.currentTrackSrc=undefined;
    this.startDrone(scene);
    this.publishScene(scene,'playing');
  }

  private async startTrack(scene:Exclude<AudioScene,'silent'|'victory'|'defeat'>,track:SceneTrack){
    if(this.currentTrackSrc===track.src&&this.currentTrack){
      this.currentTrack.muted=this.preferences.muted;
      this.installTrackErrorFallback(this.currentTrack,scene);
      this.fadeTrack(this.currentTrack,this.trackVolume(track),.45);
      return;
    }
    const request=++this.trackRequest;
    const audio=this.getTrack(track);
    if(!audio){this.startDrone(scene);return}
    audio.volume=0;
    audio.muted=this.preferences.muted;
    this.setStatus(AUDIO_UI_TEXT.loading);
    try{
      await audio.play();
      if(request!==this.trackRequest||this.scene!==scene){audio.pause();return}
      const previous=this.currentTrack;
      this.currentTrack=audio;this.currentTrackSrc=track.src;
      this.installTrackErrorFallback(audio,scene);
      this.fadeOutTrack(previous);
      this.fadeTrack(audio,this.trackVolume(track),.7);
      this.setStatus(this.preferences.muted?AUDIO_UI_TEXT.mutedStatus:AUDIO_UI_TEXT.enabled);
      this.publishScene(scene,'playing',track.src);
    }catch{
      if(request!==this.trackRequest||this.scene!==scene)return;
      audio.pause();
      this.currentTrack=undefined;this.currentTrackSrc=undefined;
      this.setStatus(AUDIO_UI_TEXT.unavailable);
      const fallback=ORIGINAL_SCENE_TRACKS[scene];
      if(fallback&&fallback.src!==track.src){
        this.publishScene(scene,'fallback',fallback.src);
        void this.startTrack(scene,fallback);
      }else{
        this.startDrone(scene);
        this.publishScene(scene,'fallback','procedural:'+scene+'-fallback');
      }
    }
  }

  private async startResultTrack(scene:'victory'|'defeat',track:SceneTrack){
    const request=++this.trackRequest;const audio=this.getTrack(track);if(!audio){this.startResultMusic(scene);return}
    audio.volume=0;audio.muted=this.preferences.muted;
    try{await audio.play();if(request!==this.trackRequest||this.scene!==scene){audio.pause();return}this.currentTrack=audio;this.currentTrackSrc=track.src;this.fadeTrack(audio,this.trackVolume(track),.35);this.setStatus(this.preferences.muted?AUDIO_UI_TEXT.mutedStatus:AUDIO_UI_TEXT.enabled);this.publishScene(scene,'playing');}
    catch{this.startResultMusic(scene);this.publishScene(scene,'fallback',`procedural:${scene}-fallback`)}
  }

  private getTrack(track:SceneTrack){
    if(typeof Audio!=='function')return undefined;
    const cached=this.trackCache.get(track.src);
    if(cached)return cached;
    const audio=configureLazyTrack(new Audio(),track.src);
    audio.setAttribute('playsinline','');
    audio.setAttribute('webkit-playsinline','');
    this.trackCache.set(track.src,audio);
    return audio;
  }

  private fullscreenLabel(){
    const doc=globalThis.document as (Document&{webkitFullscreenElement?:Element})|undefined;
    return doc?.fullscreenElement||doc?.webkitFullscreenElement?AUDIO_UI_TEXT.exitFullscreen:AUDIO_UI_TEXT.fullscreen;
  }

  private isPhoneLandscape(){
    return typeof matchMedia==='function'&&matchMedia('(max-width:900px) and (orientation:landscape)').matches;
  }

  private isFullscreen(){
    const doc=globalThis.document as (Document&{webkitFullscreenElement?:Element})|undefined;
    return Boolean(doc?.fullscreenElement||doc?.webkitFullscreenElement);
  }

  private async autoEnterLandscapeFullscreen(){
    if(!this.isPhoneLandscape()||this.isFullscreen())return;
    // Orientation changes are not always considered a user gesture. The
    // attempt is intentionally silent; the quick button remains available
    // for browsers that require a tap before granting fullscreen.
    await this.enterFullscreen();
  }

  private async enterFullscreen(){
    const doc=globalThis.document as (Document&{webkitFullscreenElement?:Element})|undefined;
    const root=doc?.documentElement as (HTMLElement&{webkitRequestFullscreen?:()=>Promise<void>|void})|undefined;
    if(!doc||!root)return false;
    try{
      if(root.requestFullscreen)await root.requestFullscreen();
      else if(root.webkitRequestFullscreen)await root.webkitRequestFullscreen();
      else return false;
      const orientation=(globalThis.screen as Screen&{orientation?:ScreenOrientation&{lock?: (mode:string)=>Promise<void>}})?.orientation;
      if(orientation?.lock)await orientation.lock('landscape').catch(()=>{});
      this.syncControls();
      return true;
    }catch{return false}
  }

  private async toggleFullscreen(){
    const doc=globalThis.document as (Document&{webkitFullscreenElement?:Element;webkitExitFullscreen?:()=>Promise<void>|void})|undefined;
    const root=doc?.documentElement as (HTMLElement&{webkitRequestFullscreen?:()=>Promise<void>|void})|undefined;
    if(!doc||!root){this.setStatus(AUDIO_UI_TEXT.fullscreenUnavailable);return}
    try{
      if(doc.fullscreenElement||doc.webkitFullscreenElement){
        if(doc.exitFullscreen)await doc.exitFullscreen();
        else await doc.webkitExitFullscreen?.();
        this.syncControls();
        return;
      }
      if(!await this.enterFullscreen())this.setStatus(AUDIO_UI_TEXT.fullscreenUnavailable);
    }catch{this.setStatus(AUDIO_UI_TEXT.fullscreenUnavailable)}
  }

  private installTrackErrorFallback(audio:HTMLAudioElement,scene:Exclude<AudioScene,'silent'|'victory'|'defeat'>){
    audio.onerror=()=>{
      if(this.currentTrack!==audio||this.scene!==scene)return;
      this.clearFade(audio);audio.pause();
      this.currentTrack=undefined;this.currentTrackSrc=undefined;
      this.stopProceduralScene();
      this.setStatus(AUDIO_UI_TEXT.unavailable);
      const fallback=ORIGINAL_SCENE_TRACKS[scene];
      if(fallback&&fallback.src!==audio.src){
        this.publishScene(scene,'fallback',fallback.src);
        void this.startTrack(scene,fallback);
      }else{
        this.startDrone(scene);
        this.publishScene(scene,'fallback','procedural:'+scene+'-fallback');
      }
    };
  }

  private startDrone(scene:Exclude<AudioScene,'silent'|'victory'|'defeat'>){
    const profiles={
      title:{root:55,fifth:82.41,level:.09,pulse:0},
      home:{root:55,fifth:82.41,level:.105,pulse:0},
      story:{root:43.65,fifth:65.41,level:.08,pulse:0},
      battle:{root:65.41,fifth:98,level:.075,pulse:860},
      boss:{root:41.2,fifth:61.74,level:.105,pulse:1280},
      library:{root:49,fifth:73.42,level:.07,pulse:0},
      archive:{root:36.7,fifth:55,level:.075,pulse:0},
    } as const;
    const profile=profiles[scene];
    this.addDrone(profile.root,profile.level,'triangle',.055);
    this.addDrone(profile.fifth,profile.level*.55,'sine',.037);
    if(profile.pulse){
      const beat=()=>{if(this.scene!==scene)return;this.percussion(scene==='boss'?56:72,scene==='boss'?.09:.055)};
      beat();this.rhythmTimer=window.setInterval(beat,profile.pulse);
    }
  }

  private startResultMusic(scene:'victory'|'defeat'){
    const victory=scene==='victory';
    const notes=victory?[196,246.94,293.66,392]:[82.41,73.42,61.74,55];
    this.addDrone(victory?98:41.2,victory?.045:.065,'sine',victory?.08:.035);
    this.addDrone(victory?146.83:55,victory?.03:.04,'triangle',victory?.055:.025);
    let index=0;
    const phrase=()=>{
      if(this.scene!==scene)return;
      const frequency=notes[index%notes.length];
      this.musicToneAt(frequency,victory?.72:1.15,victory?.042:.035,victory?'triangle':'sine',victory?frequency*1.01:frequency*.82);
      index++;
    };
    phrase();
    this.rhythmTimer=window.setInterval(phrase,victory?720:1150);
  }

  private stopScene(){
    this.trackRequest++;
    for(const track of this.trackCache.values()){this.clearFade(track);track.pause();track.currentTime=0}
    this.currentTrack=undefined;this.currentTrackSrc=undefined;
    this.stopProceduralScene();
    this.scene='silent';
    this.activeSource='silent';
    this.playbackState='requested';
  }

  private stopProceduralScene(){
    if(this.rhythmTimer!==undefined){clearInterval(this.rhythmTimer);this.rhythmTimer=undefined}
    for(const node of this.sceneNodes){try{node.stop()}catch{}}
    this.sceneNodes=[];
  }

  private trackVolume(track:SceneTrack){
    return Math.min(1,this.preferences.volume*track.gain);
  }

  private fadeOutTrack(track?:HTMLAudioElement){
    if(!track)return;
    this.fadeTrack(track,0,.5,()=>{track.pause();track.currentTime=0});
  }

  private fadeTrack(track:HTMLAudioElement,target:number,duration:number,onDone?:()=>void){
    this.clearFade(track);
    const start=track.volume,startTime=performance.now(),durationMs=duration*1000;
    const timer=window.setInterval(()=>{
      const progress=Math.min(1,(performance.now()-startTime)/durationMs);
      track.volume=start+(target-start)*progress;
      if(progress>=1){this.clearFade(track);onDone?.()}
    },32);
    this.fadeTimers.set(track,timer);
  }

  private clearFade(track:HTMLAudioElement){
    const timer=this.fadeTimers.get(track);
    if(timer!==undefined){clearInterval(timer);this.fadeTimers.delete(track)}
  }

  private addDrone(frequency:number,level:number,type:OscillatorType,lfoRate:number){
    if(!this.context||!this.music)return;
    const oscillator=this.context.createOscillator(),gain=this.context.createGain();
    const lfo=this.context.createOscillator(),lfoGain=this.context.createGain();
    oscillator.type=type;oscillator.frequency.value=frequency;
    gain.gain.value=level;
    lfo.type='sine';lfo.frequency.value=lfoRate;lfoGain.gain.value=level*.32;
    lfo.connect(lfoGain).connect(gain.gain);
    oscillator.connect(gain).connect(this.music);
    oscillator.start();lfo.start();
    this.sceneNodes.push(oscillator,lfo);
  }

  private percussion(frequency:number,level:number){
    if(!this.context||!this.music||this.preferences.muted)return;
    const oscillator=this.context.createOscillator(),gain=this.context.createGain(),now=this.context.currentTime;
    oscillator.type='sine';
    oscillator.frequency.setValueAtTime(frequency*1.8,now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency,now+.11);
    gain.gain.setValueAtTime(level,now);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.16);
    oscillator.connect(gain).connect(this.music);
    oscillator.start(now);oscillator.stop(now+.18);
  }

  private toneAt(frequency:number,duration:number,level:number,type:OscillatorType='sine',endFrequency=frequency){
    const context=this.context;
    if(!context||!this.effects||this.preferences.muted)return;
    const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),now+duration);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(level,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    oscillator.connect(gain).connect(this.effects);oscillator.start(now);oscillator.stop(now+duration+.02);
  }

  private musicToneAt(frequency:number,duration:number,level:number,type:OscillatorType='sine',endFrequency=frequency){
    const context=this.context;
    if(!context||!this.music||this.preferences.muted)return;
    const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(frequency,now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),now+duration);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(level,now+.08);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    oscillator.connect(gain).connect(this.music);
    oscillator.start(now);oscillator.stop(now+duration+.03);
    this.sceneNodes.push(oscillator);
  }

  private noiseBurst(duration:number,level:number){
    if(!this.context||!this.effects||this.preferences.muted)return;
    const frames=Math.ceil(this.context.sampleRate*duration),buffer=this.context.createBuffer(1,frames,this.context.sampleRate);
    const data=buffer.getChannelData(0);
    for(let index=0;index<frames;index++)data[index]=(Math.random()*2-1)*(1-index/frames);
    const source=this.context.createBufferSource(),gain=this.context.createGain();
    source.buffer=buffer;gain.gain.value=level;source.connect(gain).connect(this.effects);source.start();
  }

  private applyVolume(ramp:number){
    if(this.currentTrack&&this.currentTrackSrc){
      const track=[...Object.values(MUSIC_TRACKS),...Object.values(SCENE_TRACKS),...Object.values(ORIGINAL_SCENE_TRACKS)].find(item=>item?.src===this.currentTrackSrc);
      this.currentTrack.muted=this.preferences.muted;
      if(track)this.fadeTrack(this.currentTrack,this.trackVolume(track),ramp);
    }
    if(!this.context||!this.master)return;
    const now=this.context.currentTime,target=this.preferences.muted?0:this.preferences.volume;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(.0001,this.master.gain.value),now);
    this.master.gain.exponentialRampToValueAtTime(Math.max(.0001,target),now+ramp);
    if(target===0)this.master.gain.setValueAtTime(0,now+ramp+.01);
  }

  private persist(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(this.preferences))}catch{}
  }

  private syncControls(){
    const button=this.controls?.querySelector<HTMLButtonElement>('.audio-toggle');
    const label=this.controls?.querySelector<HTMLElement>('.audio-label');
    const input=this.controls?.querySelector<HTMLInputElement>('input');
    if(button){button.ariaPressed=String(this.preferences.muted);button.ariaLabel=this.preferences.muted?AUDIO_UI_TEXT.enable:AUDIO_UI_TEXT.mute}
    if(label)label.textContent=this.preferences.muted?AUDIO_UI_TEXT.mutedLabel:AUDIO_UI_TEXT.soundLabel;
    if(input)input.value=String(Math.round(this.preferences.volume*100));
    const fullscreen=this.controls?.querySelector<HTMLButtonElement>('.fullscreen-toggle');
    const quick=this.controls?.querySelector<HTMLButtonElement>('.fullscreen-quick');
    const doc=globalThis.document as (Document&{webkitFullscreenElement?:Element})|undefined;
    const root=this.controls?.ownerDocument?.documentElement as (HTMLElement&{requestFullscreen?:()=>Promise<void>|void;webkitRequestFullscreen?:()=>Promise<void>|void})|undefined;
    const fullscreenActive=Boolean(doc?.fullscreenElement||doc?.webkitFullscreenElement);
    const fullscreenSupported=Boolean(root?.requestFullscreen||root?.webkitRequestFullscreen);
    if(fullscreen){
      fullscreen.textContent=this.fullscreenLabel();
      fullscreen.disabled=!Boolean(root?.requestFullscreen||root?.webkitRequestFullscreen);
    }
    if(quick){
      quick.hidden=!this.isPhoneLandscape();
      quick.disabled=!fullscreenSupported;
      quick.textContent=fullscreenActive?AUDIO_UI_TEXT.exitFullscreen:AUDIO_UI_TEXT.fullscreen;
      quick.setAttribute('aria-label',quick.textContent);
    }
    this.controls?.classList.toggle('muted',this.preferences.muted);
    if(this.controls){
      this.controls.dataset.audioScene=this.scene;
      this.controls.dataset.audioRequestedScene=this.requestedScene;
      this.controls.dataset.audioSource=this.activeSource;
      this.controls.dataset.audioState=this.playbackState;
    }
    this.setStatus(this.preferences.muted?AUDIO_UI_TEXT.mutedStatus:this.unlocked?AUDIO_UI_TEXT.enabled:AUDIO_UI_TEXT.unlock);
  }

  private publishScene(scene:AudioScene,state:AudioSceneEventState,sourceOverride?:string){
    const definition=sceneAudioDefinition(scene);
    const source=sourceOverride??definition.source;
    const mode=source.startsWith('procedural:')?'procedural':definition.mode;
    this.activeSource=source;
    this.playbackState=state;
    this.syncControls();
    if(typeof dispatchEvent!=='function'||typeof CustomEvent!=='function')return;
    const detail:AudioSceneEventDetail={scene,source,mode,state};
    dispatchEvent(new CustomEvent<AudioSceneEventDetail>('goddess:audio-scene',{detail}));
  }

  private setStatus(message:string){if(this.status)this.status.textContent=message}
}

export const audioManager=new AudioManager();
