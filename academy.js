/* Interactive laboratory, fifths explorer, generated practice and reference library. */
const Academy = (() => {
  const $=id=>document.getElementById(id),all=s=>document.querySelectorAll(s);
  const labState={tab:'progressions',root:'C',tempo:88,pattern:'block',voicing:'near',loop:false,progression:'ii',filter:'Todas',scale:'major',chord:'maj7',inversion:0,direction:'both'};
  let playing=false,circleIndex=0,circleStep=0,feedbackText='',lastWasCorrect=false;
  let practiceType='reading',practiceLevel='basic',question=null,answered=false,heard=false,hearing=false,practiceToken=0;
  let stats={right:0,total:0,byType:{}};
  try{const s=JSON.parse(localStorage.getItem('cadencia-practice-v1'));if(s&&Number.isFinite(s.total)&&s.total>=0&&Number.isFinite(s.right)&&s.right>=0&&s.right<=s.total)stats={right:s.right,total:s.total,byType:s.byType&&typeof s.byType==='object'?s.byType:{}}}catch(e){}
  // Keep earlier ear-training totals when introducing the wider practice area.
  try{
    if(!localStorage.getItem('cadencia-practice-v1')){
      const old=JSON.parse(localStorage.getItem('cadencia-v1'));
      if(old&&Number.isFinite(old.earTotal)&&old.earTotal>0&&Number.isFinite(old.earRight)&&old.earRight>=0&&old.earRight<=old.earTotal){
        stats={right:old.earRight,total:old.earTotal,byType:{earInterval:{right:old.earRight,total:old.earTotal}}};
        localStorage.setItem('cadencia-practice-v1',JSON.stringify(stats));
      }
    }
  }catch(e){}
  const option=(value,label,selected)=>'<option value="'+value+'"'+(value===selected?' selected':'')+'>'+label+'</option>';
  const scoreText=()=>stats.right+' '+(stats.right===1?'acierto':'aciertos')+' en '+stats.total+' '+(stats.total===1?'intento':'intentos');
  const roots=selected=>Music.tonicNames.map(n=>option(n,Music.name(n)+' · '+n,selected)).join('');
  const grouped=(items,selected)=>[...new Set(items.map(i=>i.group))].map(g=>'<optgroup label="'+g+'">'+items.filter(i=>i.group===g).map(i=>option(i.id,i.name,selected)).join('')+'</optgroup>').join('');
  const head=(eyebrow,title,description)=>'<div class="page-heading"><div class="tiny">'+eyebrow+'</div><h1>'+title+'</h1><p class="muted">'+description+'</p></div>';
  function stop(){
    const interrupted=hearing;
    CadenciaAudio.stop();playTimers.forEach(clearTimeout);playTimers=[];playing=false;practiceToken++;hearing=false;
    if(interrupted){
      heard=false;
      const hearButton=$('questionHear');if(hearButton)hearButton.disabled=false;
      all('[data-practice-answer]').forEach(button=>button.disabled=true);
      const feedback=$('practiceFeedback');
      if(feedback&&!answered){feedback.className='feedback';feedback.textContent='Reproducción interrumpida. Pulsa Escuchar ejemplo para repetir.'}
    }
    const b=$('playProg');if(b)b.textContent='▶ Reproducir';
    all('[data-step]').forEach(x=>{x.classList.remove('is-playing');x.removeAttribute?.('aria-current')});
  }
  function playNotes(notes,duration=1.2,arpeggio=false){
    stop();notes.forEach((n,i)=>tone(n,duration,arpeggio?i*.12:0,.115));
    lightKeys(notes);
  }
  function lightKeys(notes){
    all('[data-midi]').forEach(b=>b.classList.toggle('lit',notes.some(n=>Music.mod(n)===Music.mod(+b.dataset.midi))));
  }
  function makePiano(){
    const piano=$('piano');
    [0,2,4,5,7,9,11,12].forEach(n=>{const b=document.createElement('button');b.className='key';b.dataset.midi=60+n;b.textContent=['Do','','Re','','Mi','Fa','','Sol','','La','','Si'][n%12];b.setAttribute('aria-label',Music.name(Music.tonicNames[n%12])+Math.floor((60+n)/12-1));b.onclick=()=>playKey(60+n);piano.appendChild(b)});
    [[1,12.5],[3,25],[6,50],[8,62.5],[10,75]].forEach(([n,pos])=>{const b=document.createElement('button');b.className='key black';b.style.left=(pos-3.75)+'%';b.dataset.midi=60+n;b.textContent=Music.tonicNames[n];b.setAttribute('aria-label',Music.name(Music.tonicNames[n])+'4');b.onclick=()=>playKey(60+n);piano.appendChild(b)});
  }
  function lab(){
    const s=labState;
    view.innerHTML=head('Tu estudio creativo','Escucha. Cambia. Descubre.','Un mismo acorde puede abrir muchas puertas. Explora sus notas, cambia la tónica y escucha qué permanece.')
      +'<div class="lab-tabs" role="group" aria-label="Herramientas">'+[['progressions','01','Progresiones'],['scales','02','Escalas'],['chords','03','Acordes'],['pulse','04','Pulso']].map(([id,num,name])=>'<button data-lab-tab="'+id+'" aria-pressed="'+(s.tab===id)+'"><span>'+num+'</span>'+name+'</button>').join('')+'</div>'
      +'<section class="piano-deck"><div class="row"><div><div class="tiny">Salamander · Yamaha C5</div><h2>Tu piano de cola</h2></div><span id="playedNote" class="badge" aria-live="polite">C4–C5</span></div><div class="keyboard" id="piano"></div><p class="small muted">Teclado: A W S E D F T G Y H U J K · Activa la reverb desde el control de sonido superior.</p></section>'
      +'<div id="labWorkspace"></div><p id="audioError" class="error" aria-live="polite"></p>';
    if(lessonReturn!==null){const b=document.createElement('button');b.className='back';b.textContent='← Volver a '+lessons[lessonReturn].title;b.onclick=()=>{const id=lessonReturn;go('learn');openLesson(id)};view.prepend(b)}
    all('[data-lab-tab]').forEach(b=>b.onclick=()=>{stop();stopMetro();s.tab=b.dataset.labTab;lab()});
    makePiano();
    if(s.tab==='progressions')progressionPanel();
    if(s.tab==='scales')scalePanel();
    if(s.tab==='chords')chordPanel();
    if(s.tab==='pulse')pulsePanel();
  }
  function progressionPanel(){
    const s=labState,p=Music.progression(s.progression,s.root);
    $('labWorkspace').innerHTML='<section class="progression-workbench"><div class="row"><div><div class="tiny">'+p.group+' · '+p.mode+'</div><h2>'+p.name+'</h2></div><label>Tónica<select id="labRoot">'+roots(s.root)+'</select></label></div><p class="roman-display">'+p.roman+'</p><p class="muted">'+p.description+'</p>'
      +'<div class="chord-sequence">'+p.chords.map((c,i)=>'<button id="progStep-'+i+'" class="sequence-chord" data-step="'+i+'"><span class="tiny">Compás '+(i+1)+'</span><strong>'+c.symbol+'</strong><span>'+c.roman+'</span></button>').join('')+'</div>'
      +'<div class="playback-controls"><label>Tempo <output id="labTempoLabel">'+s.tempo+' BPM</output><input id="labTempo" type="range" min="45" max="160" value="'+s.tempo+'"></label><label>Patrón<select id="labPattern">'+option('block','Acordes en bloque',s.pattern)+option('arpeggio','Arpegio de corcheas',s.pattern)+'</select></label><label>Disposición<select id="labVoicing">'+option('near','Enlaces cercanos',s.voicing)+option('root','Fundamentales',s.voicing)+'</select></label><label class="check-label"><input type="checkbox" id="labLoop" '+(s.loop?'checked':'')+'> Repetir vuelta</label></div>'
      +'<div class="control"><button id="playProg" class="primary">▶ Reproducir</button><button id="stopProg">■ Detener</button><span id="progNow" class="small muted" aria-live="polite">Un acorde por compás · 4/4</span></div><p class="small muted">Los enlaces cercanos reducen desplazamientos entre disposiciones. Son una ayuda para explorar voicings; comprueba cada voz según el estilo que estés estudiando.</p></section>'
      +'<div class="row sectiontop"><h2>28 caminos armónicos</h2><label class="small">Familia<select id="progFilter">'+['Todas',...new Set(Music.progressions.map(p=>p.group))].map(g=>option(g,g,s.filter)).join('')+'</select></label></div><div class="progression-catalog">'+Music.progressions.filter(p=>s.filter==='Todas'||p.group===s.filter).map(p=>'<button class="catalog-item '+(p.id===s.progression?'selected':'')+'" data-progression="'+p.id+'"><span class="tiny">'+p.group+'</span><strong>'+p.name+'</strong><span>'+p.roman+'</span><small>'+p.chords.length+' compases · '+p.mode+'</small></button>').join('')+'</div>';
    $('labRoot').onchange=e=>{stop();s.root=e.target.value;progressionPanel()};
    $('labTempo').oninput=e=>{s.tempo=+e.target.value;$('labTempoLabel').textContent=s.tempo+' BPM';if(playing){stop();$('progNow').textContent='Tempo cambiado. Pulsa reproducir para aplicar.'}};
    $('labPattern').onchange=e=>{stop();s.pattern=e.target.value};
    $('labVoicing').onchange=e=>{stop();s.voicing=e.target.value};
    $('labLoop').onchange=e=>s.loop=e.target.checked;
    $('progFilter').onchange=e=>{stop();s.filter=e.target.value;progressionPanel()};
    all('[data-progression]').forEach(b=>b.onclick=()=>{stop();s.progression=b.dataset.progression;progressionPanel()});
    all('[data-step]').forEach(b=>b.onclick=()=>withSound(()=>{const c=p.chords[+b.dataset.step];const notes=c.notes.map(n=>c.midi+n);playNotes(notes);$('progNow').textContent=c.symbol+' · '+c.names.join('–')}));
    $('playProg').onclick=()=>withSound(()=>{stop();playing=true;$('playProg').textContent='♫ Reproduciendo…';runProgression()});
    $('stopProg').onclick=()=>{stop();$('progNow').textContent='Reproducción detenida.'};
  }
  function runProgression(){
    if(!playing||page!=='studio')return;
    const s=labState,p=Music.progression(s.progression,s.root),bar=240/s.tempo,step=60/s.tempo/2;
    let previous=null;
    p.chords.forEach((c,i)=>{
      let notes=c.notes.map(n=>c.midi+n);
      if(s.voicing==='near')notes=Music.leadVoices(notes,previous);
      previous=notes;
      const bass=c.bass!==undefined?36+Music.mod(Music.pitch(s.root)+c.bass):c.midi-12;
      tone(bass,bar*.88,i*bar,.105);
      if(s.pattern==='arpeggio'){for(let k=0;k<8;k++)tone(notes[k%notes.length],step*.9,i*bar+k*step,.1)}
      else notes.forEach(n=>tone(n,bar*.85,i*bar,.1));
      const currentNotes=notes;
      playTimers.push(setTimeout(()=>{if(page!=='studio'||!playing)return;all('[data-step]').forEach(b=>{const active=+b.dataset.step===i;b.classList.toggle('is-playing',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute?.('aria-current')});$('progNow').textContent='Compás '+(i+1)+' · '+c.symbol+' · '+c.names.join('–');lightKeys(currentNotes)},i*bar*1000));
    });
    playTimers.push(setTimeout(()=>{if(!playing||page!=='studio')return;if(s.loop)runProgression();else{stop();$('progNow').textContent='Vuelta completa. Cambia la tónica o el patrón y compara.'}},p.chords.length*bar*1000));
  }
  function scalePanel(){
    const s=labState,scale=Music.scale(s.scale,s.root),h=Music.harmonize(s.scale,s.root),pcs=scale.notes.map(n=>Music.mod(Music.pitch(s.root)+n));
    $('labWorkspace').innerHTML='<section class="card"><div class="row"><div><div class="tiny">'+scale.group+'</div><h2>24 escalas. Un oído curioso.</h2></div><span class="badge">'+scale.notes.length+' notas</span></div><div class="form-grid"><label>Tónica<select id="scaleRoot">'+roots(s.root)+'</select></label><label>Escala<select id="scaleType">'+grouped(Music.scales,s.scale)+'</select></label><label>Dirección<select id="scaleDirection">'+option('up','Ascendente',s.direction)+option('down','Descendente',s.direction)+option('both','Subir y bajar',s.direction)+'</select></label></div><p>'+scale.description+'</p><div class="note-chips">'+scale.names.map((n,i)=>'<span class="'+(i===0?'tonic':'')+'"><small>'+(i+1)+'</small>'+n+'</span>').join('')+'</div><div class="music-diagram">'+MusicVisual.keyboard(pcs,Music.pitch(s.root))+'</div><p class="small muted" id="scaleNotes">Semitonos desde la tónica: '+scale.notes.join(' · ')+'.</p><div class="control"><button class="primary" id="playScale">▶ Escuchar escala</button><button id="stopScale">■ Detener</button></div></section>'
      +(h.length?'<section class="card sectiontop"><div class="tiny">Del material a la armonía</div><h2>Tríadas de esta escala</h2><p class="muted small">Se construyen usando grados alternos de la colección seleccionada.</p><div class="harmonized">'+h.map((c,i)=>'<button data-harmonized="'+i+'"><span>Grado '+c.degree+'</span><strong>'+c.symbol+'</strong><small>'+c.names.join('–')+'</small></button>').join('')+'</div></section>':'<p class="muted small">Las colecciones de cinco, seis, ocho o doce notas no usan automáticamente la misma tabla de siete grados de una escala diatónica.</p>');
    ['scaleRoot','scaleType','scaleDirection'].forEach(id=>$(id).onchange=e=>{stop();s[id==='scaleRoot'?'root':id==='scaleType'?'scale':'direction']=e.target.value;scalePanel()});
    $('playScale').onclick=()=>withSound(()=>{stop();let sequence=[...scale.notes,12];if(s.direction==='down')sequence.reverse();if(s.direction==='both')sequence=[...sequence,...sequence.slice(0,-1).reverse()];sequence.forEach((n,i)=>tone(60+Music.pitch(s.root)+n,.45,i*.45,.15));lightKeys(sequence.map(n=>60+Music.pitch(s.root)+n))});
    $('stopScale').onclick=stop;
    all('[data-harmonized]').forEach(b=>b.onclick=()=>withSound(()=>{const c=h[+b.dataset.harmonized];playNotes(c.notes.map(n=>48+Music.pitch(c.root)+n))}));
  }
  function chordPanel(){
    const s=labState,c=Music.chord(s.chord,s.root),notes=Music.invert(c.notes,s.inversion).map(n=>48+Music.pitch(s.root)+n);
    $('labWorkspace').innerHTML='<section class="card"><div class="row"><div><div class="tiny">'+c.group+'</div><h2>Construye y abre el sonido</h2></div><div class="chord-title">'+c.symbol+'</div></div><div class="form-grid"><label>Fundamental<select id="chordRoot">'+roots(s.root)+'</select></label><label>Tipo<select id="chordType">'+grouped(Music.chords,s.chord)+'</select></label><label>Posición / voicing<select id="inversion">'+Array.from({length:5},(_,i)=>'<option value="'+i+'" '+(i===s.inversion?'selected':'')+' '+(i>=c.notes.length?'disabled':'')+'>'+(i===0?'Fundamental en el bajo':i+'.ª rotación · '+(c.names[i]||'—')+' abajo')+'</option>').join('')+'</select></label></div><p>'+c.formula+'</p><div class="note-chips">'+c.names.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="music-diagram">'+MusicVisual.keyboard(c.notes.map(n=>Music.mod(n+Music.pitch(s.root))),Music.pitch(s.root))+'</div><p id="chordNotes" class="small muted">Desde la fundamental: '+c.notes.join(' · ')+' semitonos. Bajo actual: '+c.names[s.inversion]+'.</p><div class="control"><button class="primary" id="playChord">▶ Acorde en bloque</button><button id="arpeggioChord">▶ Arpegiar</button><button id="stopChord">■ Detener</button></div><p class="small muted">En tríadas y séptimas, la nota del acorde en el bajo determina la inversión. En extensiones se muestra una rotación del voicing; el símbolo no especifica una única disposición obligatoria.</p></section><div class="sectiontop"><h2>Escucha por familias</h2><div class="chord-family-grid">'+Music.chords.map(x=>'<button data-chord-pick="'+x.id+'" class="catalog-item '+(x.id===s.chord?'selected':'')+'"><span class="tiny">'+x.group+'</span><strong>'+Music.chord(x.id,s.root).symbol+'</strong><small>'+x.name+'</small></button>').join('')+'</div></div>';
    $('chordRoot').onchange=e=>{stop();s.root=e.target.value;chordPanel()};
    $('chordType').onchange=e=>{stop();s.chord=e.target.value;s.inversion=0;chordPanel()};
    $('inversion').onchange=e=>{stop();s.inversion=+e.target.value;chordPanel()};
    $('playChord').onclick=()=>withSound(()=>playNotes(notes,2));
    $('arpeggioChord').onclick=()=>withSound(()=>playNotes(notes,1.2,true));
    $('stopChord').onclick=stop;
    all('[data-chord-pick]').forEach(b=>b.onclick=()=>{stop();s.chord=b.dataset.chordPick;s.inversion=0;chordPanel()});
  }
  function pulsePanel(){
    $('labWorkspace').innerHTML='<section class="card"><div class="tiny">La base de todo</div><h2>Un pulso firme, una frase libre</h2><div class="control"><label for="bpm">Tempo <strong id="bpmLabel">80 BPM</strong></label><input type="range" min="40" max="200" value="80" id="bpm"><label>Compás<select id="meter"><option value="4">4/4</option><option value="3">3/4</option><option value="2">2/4</option></select></label></div><div class="control" id="beats"></div><button id="metro" class="primary">▶ Iniciar metrónomo</button><div class="music-diagram compact-diagram">'+MusicVisual.rhythm()+'</div><p class="muted">Marca una palmada por pulso, luego dos por pulso y después tres, manteniendo la velocidad principal. El metrónomo usa clics secos y no recibe la reverb del piano.</p></section>';
    drawBeats();
    $('meter').onchange=()=>{beat=0;drawBeats()};
    $('bpm').oninput=e=>{$('bpmLabel').textContent=e.target.value+' BPM';if(metTimer){stopMetro();startMetro()}};
    $('metro').onclick=()=>withAudioClick(()=>{if(metTimer){stopMetro();$('metro').textContent='▶ Iniciar metrónomo'}else{beat=0;startMetro();$('metro').textContent='■ Detener metrónomo'}});
  }
  const circleLessons=[
    ['Un mapa de relaciones','Cada paso en sentido horario sube una quinta justa: do–sol–re–la… Son siete semitonos, no siete teclas. Las posiciones vecinas tienen armaduras muy próximas. En el teclado temperado, el final de la vuelta se conecta por equivalencias enarmónicas.'],
    ['Las armaduras','En sentido horario aparecen sostenidos: fa, do, sol, re, la, mi, si. En sentido antihorario aparecen bemoles: si, mi, la, re, sol, do, fa. Do mayor no lleva alteraciones. Una armadura informa de las notas alteradas, pero no decide por sí sola el centro.'],
    ['La relativa menor','La relativa menor comparte armadura con la mayor y tiene su tónica una tercera menor por debajo. Do mayor y la menor comparten notas de armadura; su reposo, frases y dominantes son distintos. La relativa no es el modo paralelo: do menor comparte tónica con do mayor, no armadura.'],
    ['De la rueda a los acordes','Respecto a una tónica mayor, la posición anterior en la rueda da IV y la siguiente da V. El ii está otro paso de quinta por delante del V. Úsalos para construir I–IV–V–I y ii–V–I en cualquier tonalidad. El círculo ordena tonalidades; los acordes diatónicos se construyen con las notas de cada escala.'],
    ['Tonicizar y modular','Un dominante aplicado puede destacar brevemente un acorde. Una modulación establece un centro nuevo mediante continuidad, fraseo y cadencias. Entre tonalidades vecinas puedes usar un acorde pivote: Am es vi de do y ii de sol; después D7–G ayuda a afirmar sol.'],
    ['La costura enarmónica','Esta rueda muestra Fa♯ mayor con seis sostenidos y después Re♭ mayor con cinco bemoles. La quinta de Fa♯ se escribe Do♯, que suena como Re♭ en el temperamento igual. Sol♭ mayor comparte sonidos con Fa♯ mayor, pero se escribe con seis bemoles. Cambiar nombres aquí simplifica la lectura de la vuelta.']
  ];
  function circlePage(){
    const k=Music.circle[circleIndex],prev={...Music.circle[(circleIndex+11)%12],root:Music.noteAt(k.root,5,3)},next={...Music.circle[(circleIndex+1)%12],root:Music.noteAt(k.root,7,4)},scale=Music.scale('major',k.root),p=Music.progression('ii',k.root);
    view.innerHTML=head('El mapa que conecta la música','El círculo de quintas, sin misterio.','Toca una tonalidad. Ve su armadura, escucha sus acordes y descubre cómo se relaciona con las demás.')
    +'<div class="circle-layout"><section class="circle-card"><div class="circle-wheel"><div class="circle-base">'+MusicVisual.circle(circleIndex,false)+'</div>'+Music.circle.map((key,i)=>{const a=(i*30-90)*Math.PI/180;return '<button data-circle="'+i+'" class="wheel-key '+(i===circleIndex?'selected':i===(circleIndex+11)%12||i===(circleIndex+1)%12?'neighbor':'')+'" style="left:'+(50+37.5*Math.cos(a))+'%;top:'+(50+37.5*Math.sin(a))+'%" aria-label="'+key.name+', '+key.signature+'" aria-pressed="'+(i===circleIndex)+'">'+key.root+'</button>'}).join('')+'<div class="circle-center"><span class="tiny">Tonalidad</span><strong>'+k.root+'</strong><span>mayor · '+k.signature+'</span></div></div><p class="small muted center">Sentido horario: quintas ascendentes ↻<br>La rueda conecta Fa♯ con Re♭ por enarmonía.</p></section>'
    +'<section class="circle-detail"><div class="tiny">Tu tonalidad seleccionada</div><h2>'+k.name+'</h2><div class="signature-display">'+(k.accidentals.length?k.accidentals.join(' '):'Sin ♯ ni ♭')+'</div><p>Relativa menor: <strong>'+k.relativeName+' · '+k.relative+'</strong></p><div class="note-chips">'+scale.names.map(n=>'<span>'+n+'</span>').join('')+'</div><div class="neighbor-grid"><div><span class="tiny">IV · subdominante</span><strong>'+prev.root+'</strong></div><div><span class="tiny">V · dominante</span><strong>'+next.root+'</strong></div></div><p class="muted">Tu ii–V–I: <strong>'+p.chords.map(c=>c.symbol).join(' → ')+'</strong></p><div class="control"><button id="circleScale" class="primary">▶ Escala mayor</button><button id="circleCadence">▶ ii–V–I</button><button id="circleStop">■ Detener</button></div><p id="audioError" class="error small" aria-live="polite"></p></section></div>'
    +'<section class="circle-guide"><div class="row"><div><div class="tiny">Explicación guiada</div><h2>Una vuelta, seis descubrimientos.</h2></div><span class="badge">Paso '+(circleStep+1)+' de 6</span></div><div class="guide-tabs">'+circleLessons.map((s,i)=>'<button data-circle-step="'+i+'" aria-pressed="'+(i===circleStep)+'">'+(i+1)+'</button>').join('')+'</div><h3>'+circleLessons[circleStep][0]+'</h3><p>'+circleLessons[circleStep][1]+'</p><div class="control"><button id="circlePrevious" '+(circleStep===0?'disabled':'')+'>← Anterior</button><button id="circleNext" '+(circleStep===5?'disabled':'')+'>Siguiente →</button><button id="circlePractice" class="primary">Practicar armaduras ↗</button></div></section>'
    +'<section class="sectiontop"><h2>Comprueba la rueda</h2><div class="table-scroll"><table class="reference-table"><thead><tr><th>Mayor</th><th>Relativa menor</th><th>Armadura</th><th>Alteraciones</th></tr></thead><tbody>'+Music.circle.map(k=>'<tr><td>'+k.name+'</td><td>'+k.relativeName+'</td><td>'+k.signature+'</td><td>'+(k.accidentals.join(', ')||'Ninguna')+'</td></tr>').join('')+'</tbody></table></div></section>';
    all('[data-circle]').forEach(b=>b.onclick=()=>{stop();circleIndex=+b.dataset.circle;circlePage()});
    all('[data-circle-step]').forEach(b=>b.onclick=()=>{circleStep=+b.dataset.circleStep;circlePage()});
    $('circlePrevious').onclick=()=>{circleStep--;circlePage()};
    $('circleNext').onclick=()=>{circleStep++;circlePage()};
    $('circlePractice').onclick=()=>{practiceType='circle';question=null;go('practice')};
    $('circleScale').onclick=()=>withSound(()=>{stop();[...scale.notes,12].forEach((n,i)=>tone(60+k.pc+n,.45,i*.45,.15))});
    $('circleCadence').onclick=()=>withSound(()=>{stop();p.chords.forEach((c,i)=>c.notes.forEach(n=>tone(c.midi+n,1.4,i*1.6,.1)))});
    $('circleStop').onclick=stop;
  }
  function noteQuestion(v){
    const y=135-v.step*6.5;let lines='';
    for(let i=0;i<5;i++)lines+='<line x1="35" x2="445" y1="'+(122-i*13)+'" y2="'+(122-i*13)+'" stroke="#988ca4"/>';
    if(v.step===0)lines+='<line x1="225" x2="257" y1="135" y2="135" stroke="#796285"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200" role="img" aria-label="Nota en clave de sol: '+['línea adicional inferior','espacio bajo la primera línea','primera línea','primer espacio','segunda línea','segundo espacio','tercera línea','tercer espacio','cuarta línea','cuarto espacio','quinta línea','espacio sobre la quinta línea'][v.step]+'"><rect width="480" height="200" rx="15" fill="#faf8f4"/>'+lines+'<text x="48" y="126" font-family="serif" font-size="68" fill="#493053">𝄞</text><ellipse cx="241" cy="'+y+'" rx="10" ry="7" transform="rotate(-20 241 '+y+')" fill="#8460b5"/><line x1="250" x2="250" y1="'+y+'" y2="'+(y-36)+'" stroke="#8460b5" stroke-width="2"/></svg>';
  }
  function practice(mode){
    if(mode){practiceType=mode;question=null;answered=false;heard=false;hearing=false;feedbackText=''}
    if(!question)question=Trainer.make(practiceType,practiceLevel);
    const q=question;
    view.innerHTML=head('Práctica que te hace pensar','De entenderlo a dominarlo.','Elige una habilidad y practica con preguntas nuevas. Escucha, responde y usa la explicación para ajustar tu siguiente intento.')
    +'<div class="practice-layout"><section class="practice-menu"><h2>Tu entrenamiento</h2><label>Dificultad<select id="practiceLevel">'+option('basic','Fundamentos',practiceLevel)+option('advanced','Más desafío',practiceLevel)+'</select></label><div class="practice-types">'+Trainer.modes.map(m=>'<button data-practice-mode="'+m.id+'" aria-pressed="'+(m.id===practiceType)+'"><span>'+(m.group==='audio'?'♫':m.group==='visual'?'◈':'◇')+'</span>'+m.name+'</button>').join('')+'</div><p class="small muted" id="practiceStats">'+scoreText()+'</p></section>'
    +'<section class="question-stage"><div class="row"><span class="badge">'+Trainer.modes.find(m=>m.id===practiceType).name+'</span><span class="tiny">'+(practiceLevel==='basic'?'Fundamentos':'Más desafío')+'</span></div><h2>'+q.prompt+'</h2>'
    +(q.visual?.kind==='note'?'<div class="music-diagram question-visual">'+noteQuestion(q.visual)+'</div>':q.visual?.kind==='rhythm'?'<div class="rhythm-pattern">'+q.visual.pattern.map(x=>'<span>'+x+'</span>').join('<b>+</b>')+'</div>':q.visual?.kind==='circle'?'<div class="question-circle"><img src="assets/circle.svg" alt="Círculo de quintas con las tonalidades mayores"></div>':'')
    +(q.audio?'<div class="listen-prompt"><span aria-hidden="true">♪</span><div><strong>Primero escucha</strong><p class="small muted">Puedes repetir antes de responder. Las opciones se activan cuando termina el ejemplo.</p></div></div><button id="questionHear" class="primary">▶ Escuchar ejemplo</button>':'')
    +'<div class="answers question-answers">'+q.choices.map((choice,i)=>'<button data-practice-answer="'+i+'" '+(q.audio&&!heard?'disabled':'')+'><span>'+String.fromCharCode(65+i)+'</span>'+choice+'</button>').join('')+'</div><p id="practiceFeedback" class="feedback" aria-live="polite"></p><div class="control"><button id="nextQuestion" class="primary" '+(!answered?'disabled':'')+'>Otro ejercicio →</button><button id="practiceLab">Explorar en el laboratorio ↗</button></div><p id="audioError" class="error small" aria-live="polite"></p></section></div>';
    $('practiceLevel').onchange=e=>{stop();practiceLevel=e.target.value;newQuestion()};
    all('[data-practice-mode]').forEach(b=>b.onclick=()=>{stop();practiceType=b.dataset.practiceMode;newQuestion()});
    all('[data-practice-answer]').forEach(b=>b.onclick=()=>{
      if(answered||(q.audio&&!heard))return;
      answered=true;const ok=+b.dataset.practiceAnswer===q.answer;lastWasCorrect=ok;
      stats.total++;if(ok)stats.right++;
      const previous=stats.byType[practiceType]||{right:0,total:0};
      stats.byType[practiceType]={right:previous.right+(ok?1:0),total:previous.total+1};
      try{localStorage.setItem('cadencia-practice-v1',JSON.stringify(stats))}catch(e){}
      all('[data-practice-answer]').forEach(x=>{x.disabled=true;x.classList.toggle('chosen',+x.dataset.practiceAnswer===q.answer)});
      const f=$('practiceFeedback');f.className='feedback '+(ok?'correct':'error');feedbackText=(ok?'✓ Correcto. ':'La respuesta es '+q.choices[q.answer]+'. ')+q.explanation;f.textContent=feedbackText;
      $('nextQuestion').disabled=false;$('practiceStats').textContent=scoreText();
    });
    $('nextQuestion').onclick=()=>{stop();newQuestion()};
    $('practiceLab').onclick=()=>go('studio');
    if(q.audio)$('questionHear').onclick=()=>withSound(()=>{
      if(hearing)return;
      stop();const token=practiceToken;hearing=true;heard=false;$('questionHear').disabled=true;if(!answered)all('[data-practice-answer]').forEach(b=>b.disabled=true);
      const step=q.audio.simultaneous?0:.8;
      q.audio.notes.forEach((n,i)=>tone(n,.8,i*step,.12));
      const duration=(q.audio.simultaneous?1:q.audio.notes.length*.8)*1000;
      playTimers.push(setTimeout(()=>{if(token!==practiceToken||page!=='practice'&&page!=='ear')return;hearing=false;heard=true;$('questionHear').disabled=false;if(!answered)all('[data-practice-answer]').forEach(b=>b.disabled=false)},duration));
    });
    if(answered){all('[data-practice-answer]').forEach(b=>{b.disabled=true;b.classList.toggle('chosen',+b.dataset.practiceAnswer===q.answer)});$('practiceFeedback').className='feedback '+(lastWasCorrect?'correct':'error');$('practiceFeedback').textContent=feedbackText;$('nextQuestion').disabled=false}
  }
  function newQuestion(){question=Trainer.make(practiceType,practiceLevel);answered=false;heard=false;hearing=false;practice()}
  function resetPractice(){stats={right:0,total:0,byType:{}};question=null;answered=false;heard=false;try{localStorage.removeItem('cadencia-practice-v1')}catch(e){}}
  const articles=[
    ['Armaduras y transporte','Piensa en relaciones y cambia de tonalidad sin perder la idea.','circle',20],
    ['Lectura y subdivisión','Lee figuras, cuenta silencios y alterna corcheas y tresillos.','rhythm',21],
    ['Séptimas diatónicas','Construye la armonía de una tonalidad con cuatro voces.','chords',22],
    ['Voicings y registro','Elige qué nota va abajo y dónde colocar las demás.','keyboard',23],
    ['Pentatónicas y blues','Cinco notas, fraseo y un color cromático que transforma el camino.','pentatonic',24],
    ['Simetría y alteraciones','Tonos enteros, disminuidas y resoluciones de dominante.','whole-tone',25],
    ['Sustitución y backdoor','Compara dos rutas alternativas hacia la tónica.','circle',26],
    ['Pedales y ostinatos','Construye textura sin cambiar de acorde a cada instante.','form',27],
    ['El arte de acompañar','Densidad, registro y ritmo al servicio de la melodía.','chords',28],
    ['Una miniatura propia','Planifica, compón y revisa una pieza breve con criterio.','form',29]
  ];
  function theory(){
    view.innerHTML=head('Biblioteca de ideas','Más herramientas. Más música.','Guías de consulta, ejemplos visuales y un camino para convertir la teoría en decisiones que puedas escuchar.')
    +'<section class="theory-feature"><div><div class="tiny">Guía visual destacada</div><h2>El mapa de las doce tonalidades.</h2><p>Armaduras, relativas menores, vecinas y cadencias: entiende para qué sirve el círculo de quintas.</p><button id="theoryCircle" class="primary">Explorar el círculo →</button></div><img src="assets/circle.svg" alt="Mapa circular de las tonalidades mayores"></section>'
    +'<div class="theory-grid">'+articles.map(([name,description,image,id])=>'<article class="theory-card"><img src="assets/'+image+'.svg" alt="Diagrama musical de apoyo para '+name.toLowerCase()+'" loading="lazy"><div><span class="tiny">Profundización · '+(id+1)+'</span><h2>'+name+'</h2><p>'+description+'</p><button data-theory-lesson="'+id+'">Estudiar la lección →</button></div></article>').join('')+'</div>'
    +'<section class="reference-section"><h2>Cuatro ideas para llevarte al piano</h2><div class="reference-grid">'+[
    ['Intervalo','Distancia entre dos alturas. Se describe por número de nombres de nota y calidad; los semitonos permiten verificarla.'],
    ['Acorde','Conjunto de alturas relacionadas. La calidad depende de su estructura; la inversión, de la nota que queda en el bajo.'],
    ['Tonalidad y modo','Un centro organiza las notas y sus funciones. Compartir una colección no implica compartir la misma tónica.'],
    ['Progresión','Un recorrido de acordes. El bajo, las voces, el ritmo y la melodía hacen audible su dirección.']
    ].map(([h,p])=>'<div><h3>'+h+'</h3><p>'+p+'</p></div>').join('')+'</div></section>';
    $('theoryCircle').onclick=()=>go('circle');
    all('[data-theory-lesson]').forEach(b=>b.onclick=()=>{const id=+b.dataset.theoryLesson;go('learn');openLesson(id)});
  }
  function lessonVisual(id){
    const map={1:['staff','Las notas de do mayor sobre el pentagrama en clave de sol.'],3:['rhythm','Las figuras conservan estas proporciones aunque cambie el tempo.'],4:['keyboard','El teclado permite comprobar tonos y semitonos; las notas marcadas son do, mi y sol.'],6:['staff','Una escala se escribe con nombres de nota consecutivos.'],8:['keyboard','Do, mi y sol: fundamental, tercera mayor y quinta justa.'],9:['chords','Añadir si a do–mi–sol forma Cmaj7.'],12:['circle','Las posiciones vecinas del círculo comparten muchas notas.'],14:['modes','Compara los modos desde una misma tónica y busca sus grados característicos.'],15:['chords','Los grados se convierten en voces concretas dentro de un acorde.'],16:['form','La repetición y el contraste organizan una forma ABA.'],18:['form','Planifica secciones y retornos antes de completar el detalle.'],20:['circle','Armaduras y centros vecinos, conectados por quintas.'],21:['rhythm','Leer el ritmo también implica reconocer proporciones.'],22:['chords','Las séptimas se construyen ampliando la tríada por terceras.'],23:['keyboard','El mismo conjunto de notas puede distribuirse en varios registros.'],24:['pentatonic','Do pentatónica menor: do, mi♭, fa, sol y si♭.'],25:['whole-tone','La escala de tonos enteros desde do divide la octava en seis pasos iguales.'],26:['circle','Las relaciones entre fundamentales ayudan a visualizar rutas armónicas.'],27:['form','La textura puede crear contraste entre secciones.'],28:['chords','Escoge las voces que realmente necesita el acompañamiento.'],29:['form','Un mapa formal hace más fácil revisar tu miniatura.']};
    const item=map[id];if(!item)return '';
    return '<figure class="lesson-figure"><img src="assets/'+item[0]+'.svg" alt="'+item[1]+'" loading="lazy"><figcaption>'+item[1]+'</figcaption></figure>';
  }
  return {lab,circle:circlePage,practice,theory,stop,lessonVisual,resetPractice,getStats:()=>stats,getLabState:()=>labState};
})();
