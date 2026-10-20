const lessons=modules.flatMap((m,mi)=>m[2].map((l,li)=>({id:mi*2+li,module:mi,title:l[0],body:l[1],example:l[2],task:l[3],question:l[4],options:l[5],answer:l[6],why:l[7]})));
let saved={done:[],earRight:0,earTotal:0};
try{const s=JSON.parse(localStorage.getItem('cadencia-v1'));if(s&&Array.isArray(s.done))saved={done:s.done.filter(n=>Number.isInteger(n)&&n>=0&&n<lessons.length),earRight:Number(s.earRight)||0,earTotal:Number(s.earTotal)||0}}catch(e){}
saved.done=[...new Set(saved.done)];
let page='learn',selected=null,audio,metTimer=null,beat=0,earTarget=null,earAnswered=false,earPlayed=false,playTimers=[],storageWarning=false;
const view=document.getElementById('view');
function persist(){try{localStorage.setItem('cadencia-v1',JSON.stringify(saved));storageWarning=false}catch(e){storageWarning=true}side()}
function side(){document.getElementById('sidebarProgress').style.width=(saved.done.length/lessons.length*100)+'%';document.getElementById('sidebarLabel').textContent=saved.done.length+' de '+lessons.length+' lecciones aprobadas'}
function tone(midi,duration=.65,delay=0,vol=.16){CadenciaAudio.play(midi,duration,delay,vol)}
function stopMetro(){clearInterval(metTimer);metTimer=null}
function go(p){stopMetro();Academy.stop();playTimers.forEach(clearTimeout);playTimers=[];page=p;selected=null;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===(p==='ear'?'practice':p)));render();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));
function render(){side();if(page==='learn')renderLearn();if(page==='studio')renderStudio();if(page==='ear')renderEar();if(page==='progress')renderProgress();if(page==='circle')Academy.circle();if(page==='practice')Academy.practice();if(page==='theory')Academy.theory()}
function renderLearn(){
  const next=lessons.find(l=>!saved.done.includes(l.id)),pct=Math.round(saved.done.length/lessons.length*100);
  view.innerHTML=`<section class="hero hero-v3"><div><div class="tiny">Tu próxima idea empieza por entenderla</div><h1>La teoría se aprende.<br>La música se vive.</h1><p>Del primer pulso a tus propias armonías. Escucha un piano de cola, conecta las ideas y encuentra tu forma de hacer música.</p><div class="control"><button class="primary" id="continue">${next?(saved.done.length?'Continuar mi recorrido':'Empezar mi recorrido'):'Repasar el recorrido'} →</button><button id="heroLab">Abrir el laboratorio ↗</button></div><div class="hero-proof"><span>30 lecciones</span><span>9 formas de practicar</span><span>A tu ritmo</span></div></div><div class="hero-score" aria-hidden="true"><span>Una idea. Infinitas posibilidades.</span><div class="hero-chords"><b>ii7</b><i>→</i><b>V7</b><i>→</i><b>Imaj7</b></div><div class="score-lines"><span>♫</span><span>♩</span><span>♪</span></div><small>Escucha la tensión. Encuentra el reposo.</small></div></section>
  <div class="discovery-grid"><button id="discoverCircle"><span class="discovery-icon">◎</span><span><strong>Todo está conectado</strong><small>Explora el círculo de quintas</small></span><b>↗</b></button><button id="discoverPractice"><span class="discovery-icon">◇</span><span><strong>Hoy toca practicar</strong><small>Ejercicios nuevos en cada intento</small></span><b>↗</b></button><button id="discoverTheory"><span class="discovery-icon">♮</span><span><strong>Una capa más de profundidad</strong><small>Guías, diagramas y ejemplos</small></span><b>↗</b></button></div>
  <div class="row sectiontop"><div><div class="tiny">Tu recorrido · 15 etapas</div><h2>Construye una base. Después, explórala.</h2></div><span class="badge">${saved.done.length}/${lessons.length} · ${pct}%</span></div>
  <p class="muted">Cada lección conecta conceptos, ejemplos sonoros, imágenes y una práctica guiada. Sigue el orden o vuelve a la idea que necesitas hoy.</p>
  <div class="course-grid">${modules.map((m,i)=>`<section class="card course-card"><div class="modulehead"><span class="number">${String(i+1).padStart(2,'0')}</span><span class="tiny">${i<3?'Fundamentos':i<7?'Construye tu lenguaje':i<10?'Crea con intención':'Profundización'}</span></div><h3>${m[0]}</h3><p class="muted small">${m[1]}</p>${m[2].map((l,j)=>{const id=i*2+j,done=saved.done.includes(id);return `<button class="lesson" data-lesson="${id}"><span class="${done?'done':'muted'}">${done?'✓':'○'}</span><span>${l[0]}</span><small>${done?'Aprobada':'→'}</small></button>`}).join('')}</section>`).join('')}</div>`;
  $('continue').onclick=()=>openLesson(next?next.id:0);
  $('heroLab').onclick=()=>go('studio');$('discoverCircle').onclick=()=>go('circle');$('discoverPractice').onclick=()=>go('practice');$('discoverTheory').onclick=()=>go('theory');
  document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>openLesson(+b.dataset.lesson));
}
function $(id){return document.getElementById(id)}
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
  <div class="row"><span class="badge">Lección ${id+1} de ${lessons.length}</span><span class="muted small">${minutes}–${minutes+7} min · Lectura + práctica</span></div>
  <h1>${l.title}</h1>
  <p class="lesson-lead">${l.body}</p>${Academy.lessonVisual(id)}
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
  <p id="lessonComplete" class="feedback" aria-live="polite"></p><div class="row"><button id="previousLesson" ${id===0?'disabled':''}>← Lección anterior</button><button id="next" class="primary" disabled>${id===lessons.length-1?'Ver mi progreso':'Siguiente lección →'}</button></div>
  </section></article>`;
  document.getElementById('back').onclick=()=>go('learn');
  document.getElementById('toLab').onclick=()=>{lessonReturn=id;go('studio')};
  document.getElementById('previousLesson').onclick=()=>openLesson(id-1);
  document.getElementById('next').onclick=()=>id===lessons.length-1?go('progress'):openLesson(id+1);
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
function renderStudio(){Academy.lab()}
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
function renderEar(){Academy.practice('earInterval')}
function renderProgress(){let pct=Math.round(saved.done.length/lessons.length*100);view.innerHTML=`<div class="tiny">Cada paso cuenta</div><h1>Tu música, en movimiento</h1><p class="muted">Tu progreso refleja lecciones aprobadas, no un nivel profesional certificado.</p><div class="grid"><section class="card"><h2>Recorrido completado</h2><div class="progressbig">${pct}<span style="font-size:25px">%</span></div><div class="bar" role="progressbar" aria-label="Lecciones aprobadas" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct}%"></div></div><p>${saved.done.length} de ${lessons.length} lecciones aprobadas</p><button class="primary" id="resume">Seguir aprendiendo →</button></section><section class="card"><h2>Tu entrenamiento</h2><div class="progressbig">${Academy.getStats().total?Math.round(Academy.getStats().right/Academy.getStats().total*100):'—'}<span style="font-size:25px">${Academy.getStats().total?'%':''}</span></div><p>${Academy.getStats().right} aciertos en ${Academy.getStats().total} intentos</p><button id="train">Elegir un ejercicio →</button></section></div><section class="card"><h2>Etapa a etapa</h2>${modules.map((m,i)=>`<div class="row" style="padding:12px 0;border-bottom:1px solid var(--line)"><span>${String(i+1).padStart(2,'0')} · ${m[0]}</span><span class="badge">${saved.done.filter(n=>Math.floor(n/2)===i).length}/2 aprobadas</span></div>`).join('')}</section><p class="muted small">${storageWarning?'No se ha podido guardar en este navegador; el progreso solo está disponible en esta sesión.':'El progreso se guarda en este navegador cuando permite almacenamiento local. No se sincroniza entre dispositivos.'}</p><button id="reset" style="background:transparent;color:#8a6071">Reiniciar progreso</button>`;
document.getElementById('resume').onclick=()=>{go('learn');const l=lessons.find(l=>!saved.done.includes(l.id));openLesson(l?l.id:0)};document.getElementById('train').onclick=()=>go('practice');document.getElementById('reset').onclick=()=>document.getElementById('resetDialog').showModal()}
document.getElementById('cancelReset').onclick=()=>document.getElementById('resetDialog').close();
document.getElementById('confirmReset').onclick=()=>{saved={done:[],earRight:0,earTotal:0};Academy.resetPractice();persist();document.getElementById('resetDialog').close();renderProgress()};
document.addEventListener('visibilitychange',()=>{if(document.hidden){Academy.stop();}if(document.hidden&&metTimer){stopMetro();const b=document.getElementById('metro');if(b)b.textContent='▶ Iniciar metrónomo'}});

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
