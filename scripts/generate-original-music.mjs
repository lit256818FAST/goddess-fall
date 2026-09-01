import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const out=join(process.cwd(),'public','assets','audio','music-lazy');
mkdirSync(out,{recursive:true});
const rate=16000;
const hz=n=>440*Math.pow(2,(n-69)/12);
const clamp=n=>Math.max(-1,Math.min(1,n));
function wav(name,seconds,bars,tempo=76){
  const total=Math.floor(seconds*rate), data=new Float32Array(total), beat=60/tempo;
  const notes=bars.flatMap((bar,index)=>bar.map((note,slot)=>({note,time:index*4*beat+slot*beat,duration:beat*(slot%2?0.75:1.5)})));
  for(const item of notes){
    if(item.note===null)continue;
    const start=Math.floor(item.time*rate), end=Math.min(total,Math.floor((item.time+item.duration)*rate));
    for(let i=start;i<end;i++){
      const t=(i-start)/rate, env=Math.min(1,t/.035)*Math.min(1,(item.duration-t)/.12);
      const f=hz(item.note), pulse=Math.sin(2*Math.PI*f*t)+.32*Math.sin(2*Math.PI*f*2*t)+.12*Math.sin(2*Math.PI*f*3*t);
      data[i]+=pulse*env*.15;
    }
  }
  // Add a quiet bass bed so the music remains audible on small speakers.
  for(let i=0;i<total;i++){const t=i/rate;data[i]+=Math.sin(2*Math.PI*55*t)*.035;}
  const buf=Buffer.alloc(44+total*2);buf.write('RIFF',0);buf.writeUInt32LE(36+total*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(total*2,40);
  for(let i=0;i<total;i++)buf.writeInt16LE(Math.round(clamp(data[i])*28000),44+i*2);
  writeFileSync(join(out,name),buf);
}
const chord=(root,steps=[0,4,7,12])=>steps.map((step)=>root+step);
wav('original-home.wav',24,[chord(50),chord(53),chord(48),chord(55)],72);
wav('original-story.wav',24,[chord(52,[0,3,7,12]),chord(55,[0,4,7,11]),chord(50,[0,3,7,10]),chord(57,[0,4,7,12])],70);
wav('original-archive.wav',24,[chord(57,[0,3,7,10]),chord(53,[0,3,7,12]),chord(55,[0,4,7,11]),chord(50,[0,3,7,10])],68);
wav('original-library.wav',24,[chord(59,[0,2,7,9]),chord(55,[0,2,7,9]),chord(57,[0,4,7,11]),chord(52,[0,2,7,9])],64);
wav('original-battle.wav',24,[chord(45,[0,7,12,7]),chord(48,[0,7,12,7]),chord(43,[0,7,10,7]),chord(41,[0,7,12,7])],96);
wav('original-boss.wav',24,[chord(38,[0,1,7,8]),chord(39,[0,1,7,8]),chord(34,[0,3,7,10]),chord(36,[0,1,7,8])],82);
wav('original-victory.wav',8,[chord(60),chord(64),chord(67),chord(72)],92);
wav('original-defeat.wav',8,[chord(40,[0,3,6]),chord(38,[0,3,6]),chord(36,[0,3,6]),chord(33,[0,3,6])],62);
console.log('original music generated');
