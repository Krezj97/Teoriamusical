/* Dependency-free regression checks. Run: node tests/regression.cjs */
async function runRegression(files) {
  let checks=0;
  function assert(ok,message){if(!ok)throw Error(message);checks++}
  const memory=new Map();
  const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
  const nodes=[],contexts=[],calls=[],events=[];
  const param=()=>({value:0,events:[],setValueAtTime(v,t){this.value=v;this.events.push(['set',v,t])},linearRampToValueAtTime(v,t){this.value=v;this.events.push(['linear',v,t])},exponentialRampToValueAtTime(v,t){this.value=v;this.events.push(['exp',v,t])},setTargetAtTime(v,t){this.value=v;this.events.push(['target',v,t])}});
  function node(type){const n={type,connections:[],gain:param(),frequency:param(),playbackRate:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connect(x){this.connections.push(x)},disconnect(){this.disconnected=true},start(t){this.startTime=t},stop(t){this.stopTime=t;if(t===undefined&&this.onended)this.onended()}};nodes.push(n);return n}
  class AudioMock{
    constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};contexts.push(this)}
    async resume(){this.state='running'}
    createGain(){return node('gain')}
    createConvolver(){return node('convolver')}
    createBiquadFilter(){return node('filter')}
    createDynamicsCompressor(){return node('compressor')}
    createBufferSource(){return node('sample')}
    createOscillator(){return node('oscillator')}
    createBuffer(channels,size,rate){const arrays=Array.from({length:channels},()=>new Float32Array(size));return {duration:size/rate,getChannelData:c=>arrays[c]}}
    async decodeAudioData(){return {duration:4}}
  }
  class EventMock{constructor(type,init){this.type=type;this.detail=init.detail}}
  class AbortMock{constructor(){this.signal={}}abort(){this.aborted=true}}
  const fakeWindow={AudioContext:AudioMock,dispatchEvent:e=>events.push(e),addEventListener(){}};
  const fetchMock=async url=>{
    calls.push(url);
    if(url.includes('tonejs.github.io')&&url.endsWith('Fs2.mp3'))return {ok:false,status:503};
    return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}
  };
  const makeAudio=(fetcher)=>new Function('window','localStorage','CustomEvent','AbortController','fetch','setTimeout','clearTimeout',files['audio.js']+'\nreturn CadenciaAudio;')(fakeWindow,storage,EventMock,AbortMock,fetcher,setTimeout,clearTimeout);
  const engine=makeAudio(fetchMock);
  assert(engine.status().state==='idle','Audio starts idle');
  assert(engine.status().enabled===false,'Reverb defaults off');
  await Promise.all([engine.ready(),engine.ready()]);
  assert(engine.status().state==='ready','Samples load');
  assert(engine.status().loaded===19,'All 19 anchors loaded');
  assert(calls.length===20,'Concurrent callers share the load and fallback runs once');
  assert(calls.some(u=>u.includes('cdn.jsdelivr.net')&&u.endsWith('Fs2.mp3')),'CDN fallback requested');
  const count=calls.length;await engine.ready();assert(calls.length===count,'Loaded buffers are reused');
  engine.play(60,1,0,.16);engine.play(64,1,.2,.12);
  const voices=nodes.filter(n=>n.type==='sample');
  assert(voices.length===2,'Piano supports polyphonic sample voices');
  assert(voices[0].buffer&&voices[0].playbackRate.value===1,'Exact anchor uses original pitch');
  engine.play(61);assert(Math.abs(nodes.filter(n=>n.type==='sample').at(-1).playbackRate.value-Math.pow(2,1/12))<1e-8,'Intermediate note is pitch shifted');
  engine.configure({enabled:true,mix:40,volume:50});
  assert(engine.status().mix===40&&engine.status().volume===50,'Reverb and volume controls update');
  assert(nodes.some(n=>n.type==='gain'&&n.gain.value===.4),'Wet amount reaches gain graph');
  engine.configure({enabled:false});assert(engine.status().enabled===false,'Reverb can be bypassed');
  const oscCount=nodes.filter(n=>n.type==='oscillator').length;
  engine.click(true);assert(nodes.filter(n=>n.type==='oscillator').length===oscCount+1,'Metronome uses an independent click');
  const impulse=nodes.find(n=>n.type==='convolver').buffer;
  assert(impulse.getChannelData(0).slice(0,144).every(v=>v===0),'Reverb impulse has pre-delay');
  assert(impulse.getChannelData(0)[200]!==impulse.getChannelData(1)[200],'Reverb channels differ');
  engine.stop();assert(voices.every(v=>v.stopTime===undefined),'Stop cancels active sample sources');
  const bad=makeAudio(async()=>({ok:false,status:404}));
  let rejected=false;try{await bad.ready()}catch(e){rejected=true}
  assert(rejected&&bad.status().state==='error','Unavailable samples report a failure');
  const availableCalls=[];
  const retry=makeAudio(async url=>{availableCalls.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}});
  const pending=retry.ready();retry.stop();assert(await pending===false,'Navigation cancels the pending playback intent');
  assert(retry.status().state==='ready','Cancelled playback keeps loaded samples usable');

  const details=new Function(files['lesson-details.js']+'\nreturn lessonDetails;')();
  const modules=new Function(files['lessons.js']+'\nreturn modules;')();
  assert(details.length===30&&modules.flatMap(m=>m[2]).length===30,'Every lesson has expanded content');
  assert(details.every(d=>d.sections.length===3&&d.steps.length===3&&d.extra.length===2),'All lessons contain development, practice and extra questions');
  assert(details.every(d=>d.extra.every(q=>q[1][q[2]]&&q[3])),'Every additional question has a valid answer and explanation');
  const html=files['index.html'];
  for(const name of ['lessons.js','lesson-details.js','audio.js','music.js','visuals.js','practice-data.js','academy.js','app.js']){
    assert(html.includes('src="'+name+'?v=6" defer'),'Script referenced: '+name);
    new Function(files[name]);
  }
  assert(html.indexOf('audio.js')<html.indexOf('app.js'),'Audio loads before app');
  assert(html.indexOf('lesson-details.js')<html.indexOf('app.js'),'Lesson details load before app');

  // Minimal DOM fixture: exercises app event handlers, not layout or browser audio.
  const elements=new Map(),documentEvents=new Map();let dynamic=[];
  const classList=()=>{const values=new Set();return {add:v=>values.add(v),remove:v=>values.delete(v),toggle(v,on){if(on)values.add(v);else values.delete(v)},contains:v=>values.has(v)}};
  function element(tag,attrs=''){
    const el={tagName:tag.toUpperCase(),dataset:{},style:{},classList:classList(),disabled:/\bdisabled\b/.test(attrs),value:'',options:[],children:[],textContent:'',setAttribute(k,v){this[k]=v},appendChild(x){this.children.push(x);dynamic.push(x)},prepend(x){this.children.unshift(x);dynamic.push(x)},showModal(){this.open=true},close(){this.open=false}};
    for(const m of attrs.matchAll(/([\w-]+)="([^"]*)"/g)){const [_,k,v]=m;if(k==='id'){el.id=v;elements.set(v,el)}else if(k.startsWith('data-'))el.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;else if(k==='value')el.value=v;else el[k]=v}
    Object.defineProperty(el,'innerHTML',{get(){return this._html||''},set(s){this._html=s;if(el.id==='view'){dynamic.forEach(x=>{if(x.id)elements.delete(x.id)});dynamic=[]}else if(el._owned){const removed=new Set(el._owned);el._owned.forEach(x=>{if(x.id&&elements.get(x.id)===x)elements.delete(x.id)});dynamic=dynamic.filter(x=>!removed.has(x))}const before=dynamic.length;parse(s);el._owned=dynamic.slice(before)}});
    return el;
  }
  function parse(s){
    for(const m of s.matchAll(/<(button|input|select|textarea|div|p|span|output|dialog|details)\b([^>]*)>/g)){
      const el=element(m[1],m[2]);dynamic.push(el);
      if(m[1]==='select'){const sub=s.slice(m.index+m[0].length).split('</select>')[0];el.options=[...sub.matchAll(/<option\b([^>]*)>/g)].map(x=>({value:x[1].match(/value="([^"]*)"/)[1],disabled:/\bdisabled\b/.test(x[1]),selected:/\bselected\b/.test(x[1])}));el.value=el.options.find(x=>x.selected)?.value||el.options[0]?.value||''}
    }
  }
  parse(html);dynamic=[];
  const nav=['learn','studio','circle','practice','theory','progress'].map(p=>({dataset:{page:p},classList:classList(),setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]}}));
  const doc={
    hidden:false,
    getElementById:id=>elements.get(id)||null,
    querySelectorAll(selector){
      if(selector==='[data-page]')return nav;
      const match=selector.match(/^\[data-([\w-]+)(?:="([^"]*)")?\]$/);
      if(match){const key=match[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return dynamic.filter(e=>e.dataset[key]!==undefined&&(match[2]===undefined||e.dataset[key]===match[2]))}
      if(selector==='.beat')return dynamic.filter(e=>e.class==='beat');return [];
    },
    querySelector(selector){return this.querySelectorAll(selector)[0]||null},
    createElement:tag=>element(tag),addEventListener(type,handler){documentEvents.set(type,handler)}
  };
  const stubAudio={...engine,stop(){},status:()=>engine.status()};
  const runner=new Function('document','window','localStorage','CadenciaAudio','setTimeout','clearTimeout','setInterval','clearInterval',
    files['lessons.js']+'\n'+files['lesson-details.js']+'\n'+files['music.js']+'\n'+files['visuals.js']+'\n'+files['practice-data.js']+'\n'+files['academy.js']+'\n'+files['app.js']+
    '\nreturn {go,openLesson,getSaved:()=>saved,academy:Academy,trainer:Trainer};');
  let timerId=0;const scheduled=new Map();
  const uiTimeout=(fn,ms)=>{const id=++timerId;scheduled.set(id,{fn,ms});return id};
  const uiClearTimeout=id=>scheduled.delete(id);
  const drain=()=>{const jobs=[...scheduled.entries()].sort((a,b)=>a[1].ms-b[1].ms);for(const [id,job] of jobs){if(scheduled.has(id)){scheduled.delete(id);job.fn()}}};
  const ui=runner(doc,{scrollTo(){},addEventListener(){}},storage,stubAudio,uiTimeout,uiClearTimeout,setInterval,clearInterval);
  assert(elements.get('view').innerHTML.includes('Una sesión a la vez.'),'Initial course renders');
  assert(doc.querySelectorAll('[data-lesson]').length===30,'All sessions remain available');
  elements.get('expandModules').onclick();assert(doc.querySelectorAll('[data-module]').every(d=>d.open),'Expand all stages');
  elements.get('collapseModules').onclick();assert(doc.querySelectorAll('[data-module]').every(d=>!d.open),'Collapse all stages');
  ui.openLesson(0);
  assert(doc.querySelectorAll('[data-question]').length===9,'Lesson renders three questions with three choices');
  assert(elements.get('next').disabled,'Next waits for full assessment');
  doc.querySelectorAll('[data-question="0"]')[0].onclick();
  assert(ui.getSaved().done.length===0,'Wrong answer cannot approve lesson');
  doc.querySelectorAll('[data-question="0"]')[1].onclick();
  assert(elements.get('next').disabled,'One correct answer is insufficient');
  doc.querySelectorAll('[data-question="1"]')[0].onclick();
  doc.querySelectorAll('[data-question="2"]')[1].onclick();
  assert(ui.getSaved().done.length===1&&!elements.get('next').disabled,'Three correct answers approve lesson');
  ui.openLesson(0);
  doc.querySelectorAll('[data-question="0"]')[1].onclick();
  doc.querySelectorAll('[data-question="1"]')[0].onclick();
  doc.querySelectorAll('[data-question="2"]')[1].onclick();
  assert(ui.getSaved().done.length===1,'Repeating approval does not duplicate progress');
  const notes=elements.get('lessonNotes');notes.value='Mi respuesta';notes.oninput();
  ui.openLesson(0);assert(elements.get('lessonNotes').value==='Mi respuesta','Notebook survives reopening lesson');
  ui.go('studio');assert(elements.get('piano').children.length===13,'Piano renders 13 chromatic keys');
  doc.querySelectorAll('[data-lab-tab]').find(b=>b.dataset.labTab==='chords').onclick();elements.get('chordType').value='major';elements.get('chordType').onchange({target:elements.get('chordType')});
  assert(elements.get('inversion').options[3].disabled,'Third inversion is unavailable for triads');
  elements.get('chordType').value='dom7';elements.get('chordType').onchange({target:elements.get('chordType')});
  assert(!elements.get('inversion').options[3].disabled,'Seventh chords expose third inversion');
  ui.go('ear');assert(elements.get('view').innerHTML.includes('Primero escucha'),'Ear training renders');
  ui.go('circle');assert(doc.querySelectorAll('[data-circle]').length===12,'Circle has twelve interactive tonalities');
  doc.querySelectorAll('[data-circle]')[6].onclick();assert(elements.get('view').innerHTML.includes('C♯'),'F-sharp dominant is spelled C-sharp');
  ui.go('theory');assert(elements.get('view').innerHTML.includes('Una miniatura propia'),'New theory library renders');
  ui.go('practice');assert(doc.querySelectorAll('[data-practice-mode]').length===9,'Practice offers nine exercise families');

  const modeButton=id=>doc.querySelectorAll('[data-practice-mode]').find(b=>b.dataset.practiceMode===id);
  modeButton('reading').onclick();
  const firstTotal=ui.academy.getStats().total;
  doc.querySelectorAll('[data-practice-answer]')[0].onclick();
  assert(ui.academy.getStats().total===firstTotal+1,'Practice counts the first answer');
  doc.querySelectorAll('[data-practice-answer]')[0].onclick();
  assert(ui.academy.getStats().total===firstTotal+1,'Practice does not count repeated clicks');
  assert(!elements.get('nextQuestion').disabled,'Answered practice enables another exercise');
  elements.get('nextQuestion').onclick();
  assert(elements.get('nextQuestion').disabled,'New practice requires a fresh answer');
  modeButton('earChord').onclick();
  assert(doc.querySelectorAll('[data-practice-answer]').every(b=>b.disabled),'Audio practice waits for listening');
  await elements.get('questionHear').onclick();
  assert(doc.querySelectorAll('[data-practice-answer]').every(b=>b.disabled),'Answers stay disabled during audio');
  doc.hidden=true;documentEvents.get('visibilitychange')();
  assert(!elements.get('questionHear').disabled,'Interrupted example can be replayed');
  assert(doc.querySelectorAll('[data-practice-answer]').every(b=>b.disabled),'Interruption does not unlock answers prematurely');
  assert(elements.get('practiceFeedback').textContent.includes('interrumpida'),'Interruption explains how to continue');
  doc.hidden=false;documentEvents.get('visibilitychange')();
  await elements.get('questionHear').onclick();
  drain();
  assert(doc.querySelectorAll('[data-practice-answer]').every(b=>!b.disabled),'Answers unlock after the audio example');
  const audioTotal=ui.academy.getStats().total;
  doc.querySelectorAll('[data-practice-answer]')[0].onclick();
  assert(ui.academy.getStats().total===audioTotal+1,'Audio practice records one attempt');
  ui.go('studio');
  doc.querySelectorAll('[data-lab-tab]').find(b=>b.dataset.labTab==='progressions').onclick();
  doc.querySelectorAll('[data-progression]').find(b=>b.dataset.progression==='blues').onclick();
  assert(doc.querySelectorAll('[data-step]').length===12,'Blues exposes twelve bars');
  await elements.get('playProg').onclick();
  assert(scheduled.size>=13,'Progression schedules its bars and end marker');
  elements.get('stopProg').onclick();
  assert(scheduled.size===0,'Stop cancels scheduled progression updates');
  elements.get('labRoot').value='D♭';elements.get('labRoot').onchange({target:elements.get('labRoot')});
  assert(elements.get('view').innerHTML.includes('Laboratorio')||elements.get('labWorkspace').innerHTML.includes('D♭7'),'Progression root can be changed');
  doc.querySelectorAll('[data-lab-tab]').find(b=>b.dataset.labTab==='scales').onclick();
  assert(elements.get('scaleType').options.length===24,'Scale explorer exposes 24 scales');
  elements.get('scaleType').value='dorian';elements.get('scaleType').onchange({target:elements.get('scaleType')});
  assert(doc.querySelectorAll('[data-harmonized]').length>=7,'Seven-note scales have diatonic triads');
  ui.go('circle');
  for(let index=0;index<12;index++){doc.querySelectorAll('[data-circle]')[index].onclick();assert(elements.get('view').innerHTML.includes('Relativa menor:'),'Circle detail renders at '+index)}
  ui.go('progress');assert(elements.get('view').innerHTML.includes('Recorrido completado'),'Progress renders');

  return {checks,scope:'JavaScript, audio graph mocks, loading/failure paths, curriculum, quiz and navigation handlers. Browser layout and audible quality not verified.'};
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={runRegression};
  if(require.main===module){
    const fs=require('node:fs'),path=require('node:path');
    const root=path.resolve(__dirname,'..');
    const files=Object.fromEntries(['audio.js','app.js','lessons.js','lesson-details.js','music.js','visuals.js','practice-data.js','academy.js','index.html'].map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
    runRegression(files).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e);process.exitCode=1});
  }
}

