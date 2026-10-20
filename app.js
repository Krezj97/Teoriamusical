const lessons=modules.flatMap((m,mi)=>m[2].map((l,li)=>({id:mi*2+li,module:mi,title:l[0],body:l[1],example:l[2],task:l[3],question:l[4],options:l[5],answer:l[6],why:l[7]})));
let saved={done:[],earRight:0,earTotal:0};
try{const s=JSON.parse(localStorage.getItem('cadencia-v1'));if(s&&Array.isArray(s.done))saved={done:s.done.filter(n=>Number.isInteger(n)&&n>=0&&n<20),earRight:Number(s.earRight)||0,earTotal:Number(s.earTotal)||0}}catch(e){}
saved.done=[...new Set(saved.done)];
let page='learn',selected=null,audio,metTimer=null,beat=0,earTarget=null,earAnswered=false,earPlayed=false,playTimers=[],storageWarning=false;
const view=document.getElementById('view');
function persist(){try{localStorage.setItem('cadencia-v1',JSON.stringify(saved));storageWarning=false}catch(e){storageWarning=true}side()}
function side(){document.getElementById('sidebarProgress').style.width=saved.done.length*5+'%';document.getElementById('sidebarLabel').textContent=saved.done.length+' de 20 lecciones aprobadas'}
function tone(midi,duration=.65,delay=0,vol=.16){CadenciaAudio.play(midi,duration,delay,vol)}
function stopMetro(){clearInterval(metTimer);metTimer=null}
function go(p){stopMetro();CadenciaAudio.stop();playTimers.forEach(clearTimeout);playTimers=[];page=p;selected=null;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===p));render();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));
function render(){side();if(page==='learn')renderLearn();if(page==='studio')renderStudio();if(page==='ear')renderEar();if(page==='progress')renderProgress()}
function renderLearn(){let next=lessons.find(l=>!saved.done.includes(l.id));view.innerHTML=`
<section class="hero"><div><div class="tiny">Tu viaje musical empieza aquí</div><h1>La música tiene un lenguaje.<br>Hazlo tuyo.</h1><p>Escucha lo que aprendes. Aprende lo que escuchas. Ve paso a paso desde tus primeras notas hasta armonía y composición.</p><button class="primary" id="continue">${next?(saved.done.length?'Continuar mi recorrido':'Empezar desde cero'):'Repasar el recorrido'} →</button><p class="small" style="margin-bottom:0">20 lecciones · 10 etapas · A tu ritmo</p></div><div class="heroart" aria-hidden="true">𝄞</div></section>
<div class="row sectiontop"><h2>Tu mapa de aprendizaje</h2><span class="muted small">${saved.done.length}/20 aprobadas · ${saved.done.length*5}%</span></div>
<p class="muted small">Lee, escucha y resuelve la pregunta de cada lección. Puedes explorar cualquier etapa; se recomienda seguir el orden.</p>
<div class="grid">${modules.map((m,i)=>`<section class="card"><div class="modulehead"><span class="number">${String(i+1).padStart(2,'0')}</span><div><h3>${m[0]}</h3><span class="muted small">${m[1]}</span></div></div>${m[2].map((l,j)=>{let id=i*2+j,done=saved.done.includes(id);return `<button class="lesson" data-lesson="${id}"><span class="${done?'done':'muted'}">${done?'✓':'○'}</span>${l[0]}<small>${done?'Aprobada':'Explorar →'}</small></button>`}).join('')}</section>`).join('')}</div>`;
document.getElementById('continue').onclick=()=>openLesson(next?next.id:0);document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>openLesson(+b.dataset.lesson))}
let lessonReturn=null;
function openLesson(id){
  CadenciaAudio.stop();selected=id;
  const l=lessons[id],d=lessonDetails[id];
  const questions=[[l.question,l.options,l.answer,l.why],...d.extra];
  const passed=new Set();
  const minutes=Math.max(8,Math.ceil((l.body+' '+d.sections.flat().join(' ')).split(/\s+/).length/120)+6);
  view.innerHTML=`<article class="article lesson-article">
  <button class="back" id="back">← Volver al recorrido</button>
  <div class="tiny">Etapa ${l.module+1} · ${modules[l.module][0]}</div>
  <div class="row"><span class="badge">Lección ${id+1} de 20</span><span class="muted small">${minutes}–${minutes+7} min · Lectura + práctica</span></div>
  <h1>${l.title}</h1>
  <p class="lesson-lead">${l.body}</p>
  <section class="learning-goals"><h2>Lo que vas a aprender</h2><ul>${d.goals.map(g=>`<li>${g}</li>`).join('')}</ul></section>
  <nav class="lesson-toc" aria-label="Contenido de la lección">
  ${d.sections.map((s,i)=>`<a href="#concept-${i}">${String(i+1).padStart(2,'0')} · ${s[0]}</a>`).join('')}
  <a href="#practice">Práctica guiada</a><a href="#assessment">Evaluación</a></nav>
  ${d.sections.map((s,i)=>`<section class="lesson-section" id="concept-${i}"><div class="tiny">Concepto ${i+1}</div><h2>${s[0]}</h2>${s.slice(1).map(p=>`<p>${p}</p>`).join('')}</section>`).join('')}
  <section class="worked-example"><div class="tiny">Ejemplo resuelto</div><h2>${d.worked[0]}</h2><ol>${d.worked[1].map(p=>`<li>${p}</li>`).join('')}</ol><p class="worked-result">${d.worked[2]}</p></section>
  <section class="listening-box"><h3>Primero escucha, después explica</h3><p>${l.example}</p><button id="lessonListen" class="primary">▶ ${d.listenLabel}</button><p id="lessonAudioError" class="small error" aria-live="polite"></p></section>
  <aside class="common-mistake"><strong>Evita esta confusión</strong><p>${d.pitfall}</p></aside>
  <section id="practice" class="practice"><span class="tiny">Del concepto a tus manos</span><h2>Práctica guiada</h2><p>${l.task}</p><ol>${d.steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class="control"><button id="toLab">Practicar en el laboratorio ↗</button></div>
  <details class="solution"><summary>Ver solución orientativa</summary><p>${d.solution}</p></details>
  <label for="lessonNotes" class="notes-label">Tu cuaderno: respuesta, dudas o ideas musicales</label><textarea id="lessonNotes" rows="4" placeholder="Escribe lo que has descubierto o qué necesitas repasar…"></textarea><p id="notesStatus" class="muted small" aria-live="polite">Tus notas se guardan en este navegador al escribir.</p></section>
  <section class="assessment" id="assessment"><div class="row"><h2>Comprueba y aplica</h2><span class="badge" id="quizCount">0 de 3 resueltas</span></div>
  <p class="muted">${saved.done.includes(id)?'Tu aprobación anterior se conserva. Puedes repasar con esta evaluación ampliada.':'Resuelve las tres preguntas para aprobar. Si te equivocas, revisa la explicación y vuelve a intentarlo.'}</p>
  ${questions.map((q,qi)=>`<fieldset class="quiz-question"><legend>${qi+1}. ${q[0]}</legend><div class="answers">${q[1].map((o,oi)=>`<button data-question="${qi}" data-choice="${oi}">${o}</button>`).join('')}</div><p id="quiz-feedback-${qi}" class="feedback" aria-live="polite"></p></fieldset>`).join('')}
  <p id="lessonComplete" class="feedback" aria-live="polite"></p><div class="row"><button id="previousLesson" ${id===0?'disabled':''}>← Lección anterior</button><button id="next" class="primary" disabled>${id===19?'Ver mi progreso':'Siguiente lección →'}</button></div>
  </section></article>`;
  document.getElementById('back').onclick=()=>go('learn');
  document.getElementById('toLab').onclick=()=>{lessonReturn=id;go('studio')};
  document.getElementById('previousLesson').onclick=()=>openLesson(id-1);
  document.getElementById('next').onclick=()=>id===19?go('progress'):openLesson(id+1);
  document.getElementById('lessonListen').onclick=()=>withSound(()=>{CadenciaAudio.stop();d.listen.forEach((n,i)=>tone(n,.6,i*.68,.16))});
  const notes=document.getElementById('lessonNotes');
  try{notes.value=localStorage.getItem('cadencia-note-'+id)||''}catch(e){}
  notes.oninput=()=>{
    try{localStorage.setItem('cadencia-note-'+id,notes.value);document.getElementById('notesStatus').textContent='✓ Notas guardadas en este navegador.'}
    catch(e){document.getElementById('notesStatus').textContent='No se pudieron guardar. Copia tus notas antes de salir.'}
  };
  document.querySelectorAll('[data-question]').forEach(button=>button.onclick=()=>{
    const qi=+button.dataset.question,oi=+button.dataset.choice,q=questions[qi],ok=oi===q[2];
    if(passed.has(qi))return;
    document.querySelectorAll('[data-question="'+qi+'"]').forEach(b=>b.classList.remove('chosen'));
    button.classList.add('chosen');
    const f=document.getElementById('quiz-feedback-'+qi);
    f.className='feedback '+(ok?'correct':'error');
    f.textContent=(ok?'✓ Correcto. ':'Todavía no. ')+q[3]+(ok?'':' Lee la explicación y vuelve a intentarlo.');
    if(ok){
      passed.add(qi);document.querySelectorAll('[data-question="'+qi+'"]').forEach(b=>b.disabled=true);
      document.getElementById('quizCount').textContent=passed.size+' de 3 resueltas';
      if(passed.size===questions.length){
        if(!saved.done.includes(id))saved.done.push(id);persist();
        document.getElementById('next').disabled=false;
        document.getElementById('lessonComplete').textContent='✓ Lección aprobada. '+(storageWarning?'No se pudo guardar el progreso en este navegador.':'Progreso guardado.');
      }
    }
  });
  window.scrollTo({top:0,behavior:'smooth'});
}
const noteNames=['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];
const roots=()=>noteNames.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
const scales={major:[0,2,4,5,7,9,11,12],minor:[0,2,3,5,7,8,10,12],harmonic:[0,2,3,5,7,8,11,12],melodic:[0,2,3,5,7,9,11,12],dorian:[0,2,3,5,7,9,10,12],lydian:[0,2,4,6,7,9,11,12],mixo:[0,2,4,5,7,9,10,12]};
const chords={major:[0,4,7],minor:[0,3,7],dim:[0,3,6],aug:[0,4,8],maj7:[0,4,7,11],dom7:[0,4,7,10],min7:[0,3,7,10],half:[0,3,6,10]};
function renderStudio(){view.innerHTML=`<div class="tiny">Aprender haciendo</div><h1>Tu laboratorio sonoro</h1><p class="muted">Toca, compara y escucha. El sonido se activa al pulsar un control.</p>
<div class="toolgrid"><section class="card wide"><div class="row"><h2>Grand piano · Yamaha C5</h2><span class="badge" id="playedNote" aria-live="polite">Do central · C4</span></div><div class="keyboard" id="piano"></div><p class="muted small">Salamander Grand Piano · Muestras de Alexander Holm · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a><br>Una octava cromática · Usa las teclas A W S E D F T G Y H U J K o pulsa el piano.</p></section>
<section class="card"><h2>Explora una escala</h2><div class="control"><label>Tónica <select id="scaleRoot">${roots()}</select></label><label>Escala <select id="scaleType"><option value="major">Mayor</option><option value="minor">Menor natural</option><option value="harmonic">Menor armónica</option><option value="melodic">Menor melódica ascendente</option><option value="dorian">Dórico</option><option value="lydian">Lidio</option><option value="mixo">Mixolidio</option></select></label></div><p id="scaleNotes" class="small"></p><button class="primary" id="playScale">▶ Escuchar escala</button></section>
<section class="card"><h2>Construye un acorde</h2><div class="control"><label>Fundamental <select id="chordRoot">${roots()}</select></label><label>Tipo <select id="chordType"><option value="major">Mayor</option><option value="minor">Menor</option><option value="dim">Disminuido</option><option value="aug">Aumentado</option><option value="maj7">Mayor séptima</option><option value="dom7">Dominante 7</option><option value="min7">Menor séptima</option><option value="half">Semidisminuido</option></select></label><label>Posición <select id="inversion"><option value="0">Fundamental</option><option value="1">1.ª inversión</option><option value="2">2.ª inversión</option><option value="3">3.ª inversión</option></select></label></div><p id="chordNotes" class="small"></p><button class="primary" id="playChord">▶ Escuchar acorde</button></section>
<section class="card"><h2>Haz tuyo el pulso</h2><div class="control"><label for="bpm">Tempo <strong id="bpmLabel">80 BPM</strong></label><input type="range" min="40" max="200" value="80" id="bpm"><label>Compás <select id="meter"><option value="4">4/4</option><option value="3">3/4</option><option value="2">2/4</option></select></label></div><div class="control" id="beats"></div><button id="metro">▶ Iniciar metrónomo</button></section>
<section class="card"><h2>Escucha la armonía</h2><p class="muted small">Progresiones en do: sigue el bajo y escucha dónde aparece el reposo.</p><label for="prog">Progresión</label><div class="control"><select id="prog"><option value="ii">ii–V–I · Dm–G–C</option><option value="auth">V7–I · G7–C</option><option value="plagal">IV–I · F–C</option><option value="borrow">iv–I · Fm–C</option><option value="pop">I–V–vi–IV · C–G–Am–F</option></select></div><button class="primary" id="playProg">▶ Escuchar progresión</button><p id="progNow" aria-live="polite" class="small"></p></section></div>
<p class="muted small">Las etiquetas del piano usan sostenidos por simplicidad. Una misma tecla puede escribirse con bemol según el contexto.</p><p id="audioError" class="error" aria-live="polite"></p>`;
if(lessonReturn!==null){const back=document.createElement('button');back.className='back';back.textContent='← Volver a la lección: '+lessons[lessonReturn].title;back.onclick=()=>{const id=lessonReturn;go('learn');openLesson(id)};view.prepend(back)}
const piano=document.getElementById('piano');[0,2,4,5,7,9,11,12].forEach(n=>{let b=document.createElement('button');b.className='key';b.dataset.midi=60+n;b.textContent=noteNames[n%12];b.setAttribute('aria-label',noteNames[n%12]+(n===12?' 5':' 4'));b.onclick=()=>playKey(60+n);piano.appendChild(b)});
[[1,12.5],[3,25],[6,50],[8,62.5],[10,75]].forEach(([n,pos])=>{let b=document.createElement('button');b.className='key black';b.style.left=(pos-3.75)+'%';b.dataset.midi=60+n;b.textContent=noteNames[n];b.onclick=()=>playKey(60+n);piano.appendChild(b)});
function update(){const inversion=document.getElementById('inversion');inversion.options[3].disabled=chords[document.getElementById('chordType').value].length<4;if(inversion.options[3].disabled&&inversion.value==='3')inversion.value='0';document.getElementById('scaleNotes').textContent='Semitonos desde la tónica: '+scales[document.getElementById('scaleType').value].join(' · ');const c=chords[document.getElementById('chordType').value];document.getElementById('chordNotes').textContent='Estructura desde la fundamental: '+c.join(' · ')+' semitonos.'}
['scaleRoot','scaleType','chordRoot','chordType','inversion'].forEach(id=>document.getElementById(id).onchange=update);update();
document.getElementById('playScale').onclick=()=>withSound(()=>{CadenciaAudio.stop();let r=60+(+document.getElementById('scaleRoot').value);scales[document.getElementById('scaleType').value].forEach((n,i)=>tone(r+n,.4,i*.38))});
document.getElementById('playChord').onclick=()=>withSound(()=>{CadenciaAudio.stop();let r=60+(+document.getElementById('chordRoot').value),c=[...chords[document.getElementById('chordType').value]],inv=+document.getElementById('inversion').value;for(let i=0;i<inv;i++)c.push(c.shift()+12);c.forEach(n=>tone(r+n,1.5,0,.12))});
drawBeats();document.getElementById('meter').onchange=()=>{beat=0;drawBeats()};document.getElementById('bpm').oninput=e=>{document.getElementById('bpmLabel').textContent=e.target.value+' BPM';if(metTimer){stopMetro();startMetro()}};
document.getElementById('metro').onclick=()=>withAudioClick(()=>{if(metTimer){stopMetro();document.getElementById('metro').textContent='▶ Iniciar metrónomo';document.querySelectorAll('.beat').forEach(b=>b.classList.remove('on'))}else{beat=0;startMetro();document.getElementById('metro').textContent='■ Detener metrónomo'}});
document.getElementById('playProg').onclick=()=>withSound(()=>{CadenciaAudio.stop();playTimers.forEach(clearTimeout);playTimers=[];const ps={ii:[[50,53,57],[55,59,62],[48,52,55]],auth:[[55,59,62,65],[48,52,55]],plagal:[[53,57,60],[48,52,55]],borrow:[[53,56,60],[48,52,55]],pop:[[48,52,55],[43,47,50],[45,48,52],[41,45,48]]},labels={ii:['Dm','G','C'],auth:['G7','C'],plagal:['F','C'],borrow:['Fm','C'],pop:['C','G','Am','F']},p=document.getElementById('prog').value;ps[p].forEach((c,i)=>{playTimers.push(setTimeout(()=>{if(page!=='studio')return;c.forEach(n=>tone(n,1.2,0,.1));document.getElementById('progNow').textContent='Suena: '+labels[p][i]},i*1350))})})}
async function withSound(fn){
  if(CadenciaAudio.status().state==='loading')return;
  const originalPage=page,originalLesson=selected;
  try{const valid=await CadenciaAudio.ready();if(!valid||page!==originalPage||selected!==originalLesson)return;fn()}
  catch(e){showAudioError(e.message)}
}
async function withAudioClick(fn){
  const originalPage=page;try{await CadenciaAudio.unlock();if(page===originalPage)fn()}catch(e){showAudioError(e.message)}
}
function showAudioError(message){
  const el=document.getElementById('lessonAudioError')||document.getElementById('audioError')||document.getElementById('earFeedback');
  if(el)el.textContent=message;
  const status=document.getElementById('pianoStatus');if(status)status.textContent=message;
}
function playKey(n){withSound(()=>{tone(n);const b=document.querySelector('[data-midi="'+n+'"]');if(b){b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),220)}const label=document.getElementById('playedNote');if(label)label.textContent=noteNames[n%12]+' · '+Math.floor(n/12-1)})}
document.addEventListener('keydown',e=>{if(page!=='studio'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k='awsedftgyhujk'.indexOf(e.key.toLowerCase());if(k>=0){e.preventDefault();playKey(60+k)}});
function drawBeats(){let m=+document.getElementById('meter').value;document.getElementById('beats').innerHTML=Array.from({length:m},(_,i)=>`<span class="beat" aria-label="Pulso ${i+1}"></span>`).join('')}
function startMetro(){const tick=()=>{if(page!=='studio'){stopMetro();return}let m=+document.getElementById('meter').value;beat%=m;CadenciaAudio.click(beat===0);document.querySelectorAll('.beat').forEach((b,i)=>b.classList.toggle('on',i===beat));beat++};tick();metTimer=setInterval(tick,60000/(+document.getElementById('bpm').value))}
const intervals=[{n:3,label:'3.ª menor',hint:'Tres semitonos: por ejemplo, do–mi♭.'},{n:4,label:'3.ª mayor',hint:'Cuatro semitonos: por ejemplo, do–mi.'},{n:5,label:'4.ª justa',hint:'Cinco semitonos: por ejemplo, do–fa.'},{n:7,label:'5.ª justa',hint:'Siete semitonos: por ejemplo, do–sol.'},{n:12,label:'Octava',hint:'Doce semitonos: misma nota en el registro siguiente.'}];
function newEar(){earTarget={...intervals[Math.floor(Math.random()*intervals.length)],root:57+Math.floor(Math.random()*7)};earAnswered=false;earPlayed=false}
function renderEar(){if(!earTarget||earAnswered)newEar();view.innerHTML=`<div class="tiny">Conecta la teoría con el oído</div><h1>Escucha la distancia</h1><p class="muted">Dos notas ascendentes. Una relación que aprenderás a reconocer.</p><div class="card article"><div class="row"><span class="badge">Entrenamiento de intervalos</span><span id="earScore" class="muted small">${saved.earRight} aciertos / ${saved.earTotal} intentos</span></div><div class="notebox" aria-hidden="true">♪ → ♩</div><h2>¿Qué intervalo has escuchado?</h2><p class="muted">Pulsa escuchar. Canta ambas notas y compara su distancia antes de responder.</p><div class="control"><button class="primary" id="hear">▶ Escuchar</button><button id="reveal">Mostrar pista</button></div><p id="hint" class="muted small" aria-live="polite"></p><div class="answers">${intervals.map(x=>`<button data-interval="${x.n}" disabled>${x.label}</button>`).join('')}</div><div id="earFeedback" class="feedback" aria-live="polite"></div><button id="nextEar" disabled>Siguiente intervalo →</button></div><div class="article"><p class="muted small">La nota inicial varía para que reconozcas la relación, en lugar de memorizar una altura. Aquí se entrenan intervalos melódicos ascendentes; completa tu práctica con intervalos descendentes y simultáneos.</p></div>`;
document.getElementById('hear').onclick=()=>withSound(()=>{CadenciaAudio.stop();tone(earTarget.root,.6);tone(earTarget.root+earTarget.n,.9,.8);earPlayed=true;if(!earAnswered)document.querySelectorAll('[data-interval]').forEach(b=>b.disabled=false)});
document.getElementById('reveal').onclick=()=>{document.getElementById('hint').textContent='Escucha primero; luego compara cantando con los ejemplos del laboratorio.'};
document.querySelectorAll('[data-interval]').forEach(b=>b.onclick=()=>{if(earAnswered||!earPlayed)return;earAnswered=true;saved.earTotal++;const ok=+b.dataset.interval===earTarget.n;if(ok)saved.earRight++;persist();b.classList.add('chosen');document.querySelectorAll('[data-interval]').forEach(x=>x.disabled=true);const f=document.getElementById('earFeedback');f.className='feedback '+(ok?'correct':'error');f.textContent=(ok?'✓ Correcto. ':'Era '+earTarget.label+'. ')+earTarget.hint;document.getElementById('earScore').textContent=saved.earRight+' aciertos / '+saved.earTotal+' intentos';document.getElementById('nextEar').disabled=false});
document.getElementById('nextEar').onclick=()=>{newEar();renderEar()}}
function renderProgress(){let pct=saved.done.length*5;view.innerHTML=`<div class="tiny">Cada paso cuenta</div><h1>Tu música, en movimiento</h1><p class="muted">Tu progreso refleja lecciones aprobadas, no un nivel profesional certificado.</p><div class="grid"><section class="card"><h2>Recorrido completado</h2><div class="progressbig">${pct}<span style="font-size:25px">%</span></div><div class="bar" role="progressbar" aria-label="Lecciones aprobadas" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div><p>${saved.done.length} de 20 lecciones aprobadas</p><button class="primary" id="resume">Seguir aprendiendo →</button></section><section class="card"><h2>Tu entrenamiento auditivo</h2><div class="progressbig">${saved.earTotal?Math.round(saved.earRight/saved.earTotal*100):'—'}<span style="font-size:25px">${saved.earTotal?'%':''}</span></div><p>${saved.earRight} aciertos en ${saved.earTotal} intentos</p><button id="train">Practicar intervalos →</button></section></div><section class="card"><h2>Etapa a etapa</h2>${modules.map((m,i)=>`<div class="row" style="padding:12px 0;border-bottom:1px solid var(--line)"><span>${String(i+1).padStart(2,'0')} · ${m[0]}</span><span class="badge">${saved.done.filter(n=>Math.floor(n/2)===i).length}/2 aprobadas</span></div>`).join('')}</section><p class="muted small">${storageWarning?'No se ha podido guardar en este navegador; el progreso solo está disponible en esta sesión.':'El progreso se guarda en este navegador cuando permite almacenamiento local. No se sincroniza entre dispositivos.'}</p><button id="reset" style="background:transparent;color:#8a6071">Reiniciar progreso</button>`;
document.getElementById('resume').onclick=()=>{go('learn');const l=lessons.find(l=>!saved.done.includes(l.id));openLesson(l?l.id:0)};document.getElementById('train').onclick=()=>go('ear');document.getElementById('reset').onclick=()=>document.getElementById('resetDialog').showModal()}
document.getElementById('cancelReset').onclick=()=>document.getElementById('resetDialog').close();
document.getElementById('confirmReset').onclick=()=>{saved={done:[],earRight:0,earTotal:0};persist();document.getElementById('resetDialog').close();renderProgress()};
document.addEventListener('visibilitychange',()=>{if(document.hidden){CadenciaAudio.stop();playTimers.forEach(clearTimeout);playTimers=[];}if(document.hidden&&metTimer){stopMetro();const b=document.getElementById('metro');if(b)b.textContent='▶ Iniciar metrónomo'}});

function refreshAudioControls(){
  const s=CadenciaAudio.status(),label=document.getElementById('pianoStatus'),button=document.getElementById('loadPiano');
  label.textContent=s.state==='ready'?'✓ Grand piano listo':s.state==='loading'?'Cargando piano… '+s.loaded+'/'+s.total:s.state==='error'?s.error:'Activa el piano para escuchar los ejemplos.';
  button.disabled=s.state==='loading';
  button.textContent=s.state==='ready'?'▶ Probar piano':s.state==='loading'?'Cargando…':s.state==='error'?'Reintentar carga':'Cargar piano';
  document.getElementById('reverbEnabled').checked=s.enabled;
  document.getElementById('reverbMix').value=s.mix;
  document.getElementById('reverbMix').disabled=!s.enabled;
  document.getElementById('reverbValue').textContent=s.mix+'%';
  document.getElementById('pianoVolume').value=s.volume;
  document.getElementById('volumeValue').textContent=s.volume+'%';
}
window.addEventListener('cadencia-audio',refreshAudioControls);
document.getElementById('loadPiano').onclick=async()=>{
  try{const valid=await CadenciaAudio.ready();if(valid)tone(60,1.1)}catch(e){showAudioError(e.message)}
};
document.getElementById('reverbEnabled').onchange=e=>CadenciaAudio.configure({enabled:e.target.checked});
document.getElementById('reverbMix').oninput=e=>CadenciaAudio.configure({mix:+e.target.value});
document.getElementById('pianoVolume').oninput=e=>CadenciaAudio.configure({volume:+e.target.value});
refreshAudioControls();

render();
