/* Theory-model regression checks. Run: node tests/music.cjs */
function runMusicChecks(files){
  const M=new Function(files['music.js']+'\nreturn Music;')();
  const T=new Function(files['music.js']+'\n'+files['practice-data.js']+'\nreturn Trainer;')();
  let checks=0;
  function assert(ok,message){if(!ok)throw Error(message);checks++}
  for(const root of M.tonicNames){
    for(const s of M.scales){
      const scale=M.scale(s.id,root);
      assert(scale.names.every((n,i)=>M.pitch(n)===M.mod(M.pitch(root)+s.notes[i])),'Scale spelling '+root+s.id);
      assert(s.notes[0]===0&&s.notes.every((n,i)=>i===0||n>s.notes[i-1]),'Scale ascends '+s.id);
      const h=M.harmonize(s.id,root);
      assert(h.length===(s.notes.length===7?7:0),'Harmonization length');
    }
    for(const c of M.chords){
      const chord=M.chord(c.id,root);
      assert(chord.names.every((n,i)=>M.pitch(n)===M.mod(M.pitch(root)+c.notes[i])),'Chord spelling '+root+c.id);
      for(let i=0;i<c.notes.length;i++){
        const inv=M.invert(c.notes,i);
        assert(inv.every((n,j)=>j===0||n>inv[j-1]),'Inversion ordered '+root+c.id+i);
      }
    }
    for(const p of M.progressions){
      const progression=M.progression(p.id,root);
      assert(progression.chords.every((c,i)=>M.pitch(c.root)===M.mod(M.pitch(root)+p.chords[i].offset)),'Progression transposes '+root+p.id);
      const voices=progression.chords.reduce((a,c)=>[...a,M.leadVoices(c.notes.map(n=>c.midi+n),a.at(-1))],[]);
      assert(voices.every(a=>a.every((n,i)=>Number.isFinite(n)&&n>=36&&n<=90&&(i===0||n>a[i-1]))),'Voicing range '+root+p.id);
    }
  }
  assert(M.progression('gospel','C').chords[2].symbol==='C/G','Slash chord uses chord root C and bass G');
  assert(M.scale('major','F♯').names.join(' ')==='F♯ G♯ A♯ B C♯ D♯ E♯','F-sharp major spelling');
  assert(M.scale('major','D♭').names.join(' ')==='D♭ E♭ F G♭ A♭ B♭ C','D-flat major spelling');
  assert(M.chord('dim7','C').names.join(' ')==='C E♭ G♭ B♭♭','Diminished seventh preserves interval spelling');
  assert(M.progression('tritone','C').chords.map(c=>c.symbol).join(' ')==='Dm7 D♭7 Cmaj7','Tritone substitution example');
  assert(M.progression('backdoor','C').chords.map(c=>c.symbol).join(' ')==='Fm7 B♭7 Cmaj7','Backdoor example');
  assert(M.noteAt('D♭',5,3)==='G♭'&&M.noteAt('F♯',7,4)==='C♯','Circle neighbors preserve spelling at seam');
  assert(M.harmonize('major','C').map(c=>c.symbol).join(' ')==='C Dm Em F G Am Bdim','Major scale harmonization');
  for(const mode of T.modes)for(const level of ['basic','advanced'])for(let seed=1;seed<=40;seed++){
    let state=seed;
    const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
    const q=T.make(mode.id,level,rng);
    assert(q.choices.length===4&&new Set(q.choices).size===4,'Unique quiz choices '+mode.id);
    assert(q.answer>=0&&q.answer<q.choices.length&&q.explanation.length>15,'Quiz answer valid '+mode.id);
    if(q.audio)assert(q.audio.notes.every(n=>n>=36&&n<=90),'Quiz audio range');
  }
  const html=files['index.html'],paths=Object.keys(files),svgPaths=paths.filter(p=>p.endsWith('.svg'));
  for(const p of svgPaths){assert(files[p].includes('<svg')&&files[p].includes('<title>')&&files[p].includes('viewBox='),'Accessible standalone SVG: '+p)}
  const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(p=>!p.startsWith('http'));
  assert(refs.every(p=>paths.includes(p)),'All local HTML dependencies exist');
  return {checks,exerciseVariants:720,transpositionRoots:12,scope:'Theory data, spelling, voicings, generated questions, SVG structure and local references. No browser rendering or audible assessment.'};
}
if(typeof module!=='undefined'&&module.exports){
  module.exports={runMusicChecks};
  if(require.main===module){
    const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
    const paths=['music.js','practice-data.js','index.html','styles.css','lessons.js','lesson-details.js','audio.js','visuals.js','academy.js','app.js',...fs.readdirSync(path.join(root,'assets')).filter(p=>p.endsWith('.svg')).map(p=>'assets/'+p)];
    const files=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
    try{console.log(JSON.stringify(runMusicChecks(files),null,2))}catch(e){console.error(e);process.exitCode=1}
  }
}
