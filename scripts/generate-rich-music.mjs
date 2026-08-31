import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const out=join(process.cwd(),'public','assets','audio');mkdirSync(out,{recursive:true});
// 16kHz keeps the browser package small while preserving the harmonic range
// of these intentionally soft, low-register ambient tracks.
const rate=16000, TAU=Math.PI*2, beat=60/76;
const clamp=n=>Math.max(-1,Math.min(1,n));
const midi=n=>440*Math.pow(2,(n-69)/12);
let seed=91731;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const trackDefs={
  story:{file:'original-story.wav',root:52,tempo:70,mood:'minor'},
  library:{file:'original-library.wav',root:59,tempo:64,mood:'light'},
  archive:{file:'original-archive.wav',root:57,tempo:68,mood:'minor'},
  battle:{file:'original-battle.wav',root:45,tempo:96,mood:'pulse'},
  boss:{file:'original-boss.wav',root:38,tempo:82,mood:'dark'},
  victory:{file:'original-victory.wav',root:60,tempo:92,mood:'bright'},
  defeat:{file:'original-defeat.wav',root:40,tempo:62,mood:'fall'},
};
const chordShapes={minor:[0,3,7,10],light:[0,4,7,11],pulse:[0,3,7,10],dark:[0,1,7,8],bright:[0,4,7,12],fall:[0,3,6,10]};
function addTone(buf,start,duration,freq,amp,kind='sine',pan=0){
  const from=Math.max(0,Math.floor(start*rate)),to=Math.min(buf.length,Math.floor((start+duration)*rate));
  for(let i=from;i<to;i++){
    const t=(i-from)/rate, remain=duration-t;
    const attack=Math.min(1,t/.045),release=Math.min(1,Math.max(0,remain/.18)),env=attack*release;
    let wave=Math.sin(TAU*freq*t);
    if(kind==='soft')wave=.7*wave+.25*Math.sin(TAU*freq*2*t);
    if(kind==='pluck')wave=.7*wave+.25*Math.sin(TAU*freq*2*t)+.1*Math.sin(TAU*freq*3*t);
    if(kind==='saw')wave=2*((freq*t)%1)-1;
    const stereo=1-Math.abs(pan)*.15;buf[i]+=wave*env*amp*stereo;
  }
}
function addNoise(buf,start,duration,amp){
  const from=Math.floor(start*rate),to=Math.min(buf.length,Math.floor((start+duration)*rate));
  for(let i=from;i<to;i++){const t=(i-from)/rate;buf[i]+=(rand()*2-1)*amp*(1-t/duration)*Math.min(1,t/.004)}
}
function writeWav(file,data){
  const buf=Buffer.alloc(44+data.length*2);buf.write('RIFF');buf.writeUInt32LE(36+data.length*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(data.length*2,40);for(let i=0;i<data.length;i++)buf.writeInt16LE(Math.round(clamp(data[i])*28000),44+i*2);writeFileSync(join(out,file),buf);
}
for(const def of Object.values(trackDefs)){
  const seconds=def.mood==='bright'||def.mood==='fall'?16:40,total=Math.floor(seconds*rate),buf=new Float32Array(total),tempo=def.tempo,b=60/tempo,shape=chordShapes[def.mood];
  const bars=Math.ceil(seconds/(b*4));
  for(let bar=0;bar<bars;bar++){
    const chordRoot=def.root+[0,5,-2,3][bar%4];
    // Sustained harmonic bed, with a second upper color tone.
    for(const step of shape){addTone(buf,bar*4*b,4*b+.2,midi(chordRoot+step),.035,'soft');}
    // Arpeggio gives the archive/story layers motion without becoming busy.
    for(let slot=0;slot<8;slot++){const step=shape[(slot+bar)%shape.length];addTone(buf,bar*4*b+slot*b/2,.48*b,midi(chordRoot+step+12),.052,'pluck');}
    // A four-bar melody phrase with a response in the second half.
    const phrase=[0,2,3,5,3,2,0,-2];
    for(let i=0;i<phrase.length;i++){const n=chordRoot+12+phrase[(i+(bar%2?2:0))%phrase.length];addTone(buf,bar*4*b+i*b/2,.7*b,midi(n),.065,'soft',i%2?-.2:.2)}
    if(def.mood==='pulse'||def.mood==='dark'){for(let slot=0;slot<4;slot++){addTone(buf,bar*4*b+slot*b,.08*b,midi(def.root-12),.13,'saw');addNoise(buf,bar*4*b+slot*b,.035,.035)}}
    if(bar%2===1)addNoise(buf,bar*4*b+3.5*b,.12,.022);
  }
  // Gentle echo and slow fade-in/out make loops feel composed rather than clipped.
  const copy=new Float32Array(buf);for(let i=0;i<buf.length;i++){const fadeIn=Math.min(1,i/(rate*1.2)),fadeOut=Math.min(1,(buf.length-i)/(rate*1.2));buf[i]=(copy[i]+(i>Math.floor(rate*.27)?copy[i-Math.floor(rate*.27)]*.18:0))*fadeIn*fadeOut}
  writeWav(def.file,buf);
}
console.log('rich original music generated');
