import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const out=join(process.cwd(),'public','assets','audio');mkdirSync(out,{recursive:true});
const rate=22050,TAU=Math.PI*2,tempo=58,beat=60/tempo,total=Math.floor(48*rate),data=new Float32Array(total),midi=n=>440*Math.pow(2,(n-69)/12);
function tone(start,duration,freq,amp,partials=[1,2]){
  const from=Math.floor(start*rate),to=Math.min(total,Math.floor((start+duration)*rate));
  for(let i=from;i<to;i++){
    const t=(i-from)/rate,remaining=duration-t,env=Math.min(1,t/.18)*Math.min(1,remaining/.5);
    let wave=0;for(const partial of partials)wave+=Math.sin(TAU*freq*partial*t)/partial;
    data[i]+=wave*env*amp;
  }
}
const chords=[[60,64,67,71],[57,60,64,69],[53,57,60,64],[55,59,62,67]];
for(let bar=0;bar<16;bar++){
  const start=bar*4*beat,chord=chords[bar%chords.length];
  for(const n of chord)tone(start,4*beat+.5,midi(n),.026,[1,2,3]);
  // soft broken-chord pattern, deliberately sparse and slightly behind the beat
  for(let slot=0;slot<8;slot++){const n=chord[(slot+bar)%chord.length]+12;tone(start+slot*beat/2+.035,.72*beat,midi(n),.045,[1,2]);}
  // a small five-note answering phrase, leaving silence between phrases
  const phrase=[0,2,4,2,1,4];for(let i=0;i<phrase.length;i++){const n=60+phrase[(i+bar)%phrase.length];tone(start+(i+.6)*beat,.55*beat,midi(n),.035,[1,2,4]);}
}
for(let i=0;i<total;i++){
  const fade=Math.min(1,i/(rate*2.5))*Math.min(1,(total-i)/(rate*2.5));
  const echo=i>Math.floor(rate*.42)?data[i-Math.floor(rate*.42)]*.22:0;data[i]=(data[i]+echo)*fade;
}
const buf=Buffer.alloc(44+total*2);buf.write('RIFF');buf.writeUInt32LE(36+total*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(total*2,40);for(let i=0;i<total;i++)buf.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(data[i]*27000))),44+i*2);
writeFileSync(join(out,'original-library.wav'),buf);console.log('warm library music generated');
