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
function go(p){stopMetro();Academy.stop();playTimers.forEach(clearTimeout);playTimers=[];page=p;selected=null;document.querySelectorAll('[data-page]').forEach(b=>{const active=b.dataset.page===(p==='ear'?'practice':p);b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});render();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));
document.getElementById('brandHome').onclick=()=>go('learn');
function render(){side();if(page==='learn')renderLearn();if(page==='studio')renderStudio();if(page==='ear')renderEar();if(page==='progress')renderProgress();if(page==='circle')Academy.circle();if(page==='practice')Academy.practice();if(page==='theory')Academy.theory()}
function renderLearn(){
 const next=lessons.find(l=>!saved.done.includes(l.id)),target=next||lessons[0],pct=Math.round(saved.done.length/lessons.length*100);
 const groups=[['01','LOS CIMIENTOS','Aprende a leer y a escuchar.',0,4],['02','EL LENGUAJE','Construye armonías con intención.',4,8],['03','TU MÚSICA','Dale forma a tus propias ideas.',8,10],['04','MÁS ALLÁ','Amplía tu paleta y afina tu criterio.',10,15]];
 view.innerHTML=`<section class="landing-hero"><div class="hero-copy"><div class="eyebrow"><span class="status-dot"></span> MENOS MEMORIZAR. MÁS HACER MÚSICA.</div><h1>ENTIÉNDELO.<br><span>HAZLO TUYO.</span></h1><p>De tu primera nota a tus propias armonías. Un espacio para entender la música, entrenar el oído y llevar cada idea al piano.</p><div class="hero-actions"><button class="primary" id="continue">${next?(saved.done.length?'Retomar mi sesión':'Empezar desde cero'):'Repasar el recorrido'} ↗</button><button class="text-button" id="heroLab">Ir al estudio →</button></div><div class="hero-facts"><span><b>30</b> LECCIONES</span><span><b>28</b> PROGRESIONES</span><span><b>09</b> ENTRENAMIENTOS</span></div></div><section class="demo-console" aria-label="Ejemplo de cadencia dos cinco uno"><div class="demo-topline"><span><i class="status-dot"></i> SESIÓN 001</span><span>DO MAYOR / 4:4</span></div><div class="demo-staff" aria-hidden="true"><span class="staff-note n1">♩</span><span class="staff-note n2">♩</span><span class="staff-note n3">♩</span><span class="staff-note n4">♩</span></div><div class="demo-chords"><div><small>ii7</small><strong>Dm7</strong></div><div><small>V7</small><strong>G7</strong></div><div><small>Imaj7</small><strong>Cmaj7</strong></div></div><div class="demo-bottom"><div><small>EL SONIDO DE UNA IDEA</small><p>Tensión → reposo.</p></div><button id="heroDemo">▶ <span>ESCUCHAR</span></button></div><p id="heroAudioError" class="error small" aria-live="polite"></p></section></section>
 <div class="entry-lanes"><button id="discoverCircle"><span class="lane-number">01 /</span><span><strong>Conecta las tonalidades</strong><small>Círculo de quintas interactivo</small></span><b>↗</b></button><button id="discoverPractice"><span class="lane-number">02 /</span><span><strong>Pon a prueba tu oído</strong><small>Nuevos retos en cada intento</small></span><b>↗</b></button><button id="discoverTheory"><span class="lane-number">03 /</span><span><strong>Amplía tu vocabulario</strong><small>Diagramas, guías y referencias</small></span><b>↗</b></button></div>
 <div class="learning-layout"><section class="curriculum"><div class="section-heading"><div><div class="eyebrow">EL RECORRIDO / 15 ETAPAS</div><h2>Una sesión a la vez.</h2></div><div class="disclosure-controls"><button id="expandModules">Expandir +</button><button id="collapseModules">Contraer −</button></div></div>
 ${groups.map(g=>`<section class="course-group"><div class="group-label"><span>${g[0]} / ${g[1]}</span><small>${g[2]}</small></div>${modules.slice(g[3],g[4]).map((m,k)=>{const i=k+g[3],count=saved.done.filter(n=>Math.floor(n/2)===i).length;return `<details class="module-row" data-module="${i}" ${target.module===i?'open':''}><summary><span class="track-number">${String(i+1).padStart(2,'0')}</span><span class="module-copy"><strong>${m[0]}</strong><small>${m[1]}</small></span><span class="module-count ${count===2?'done':''}">${count===2?'✓':count+'/2'}</span><span class="module-chevron">+</span></summary><div class="module-lessons">${m[2].map((l,j)=>{const id=i*2+j,done=saved.done.includes(id);return `<button data-lesson="${id}"><span class="lesson-status ${done?'done':''}">${done?'✓':'○'}</span><span><strong>${l[0]}</strong><small>LEE / ESCUCHA / PRACTICA</small></span><span class="lesson-action">${done?'Repasar':'Abrir sesión'} ↗</span></button>`}).join('')}</div></details>`}).join('')}</section>`).join('')}</section>
 <aside class="session-sidebar"><div class="eyebrow">TU PRÓXIMO MOVIMIENTO</div><span class="session-number">${String(target.id+1).padStart(2,'0')}<small> / 30</small></span><h3>${target.title}</h3><p>${modules[target.module][1]}</p><button id="nextSession" class="primary">${next?'Abrir sesión':'Volver al inicio'} ↗</button><div class="session-progress"><div class="row"><span>RECORRIDO</span><strong>${pct}%</strong></div><div class="bar"><div style="width:${pct}%"></div></div><small>${saved.done.length} sesiones aprobadas. Cada una cuenta.</small></div><ol class="study-method"><li><span>01</span> Entiende una idea.</li><li><span>02</span> Escucha cómo funciona.</li><li><span>03</span> Hazla sonar tú.</li></ol></aside></div>`;
 $('continue').onclick=()=>openLesson(target.id);$('nextSession').onclick=()=>openLesson(target.id);
 $('heroLab').onclick=()=>go('studio');$('discoverCircle').onclick=()=>go('circle');$('discoverPractice').onclick=()=>go('practice');$('discoverTheory').onclick=()=>go('theory');
 $('heroDemo').onclick=()=>withSound(()=>{Academy.stop();[[50,53,57,60],[55,59,62,65],[48,52,55,59]].forEach((chord,i)=>chord.forEach(n=>tone(n,1.3,i*1.5,.12)))});
 $('expandModules').onclick=()=>document.querySelectorAll('[data-module]').forEach(d=>d.open=true);
 $('collapseModules').onclick=()=>document.querySelectorAll('[data-module]').forEach(d=>d.open=false);
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
  view.innerHTML=`<div class="reader-shell"><aside class="reader-rail"><button class="back" id="back">← Volver al recorrido</button><div class="eyebrow">EN ESTA SESIÓN</div>  <nav class="lesson-toc" aria-label="Contenido de la lección">
  ${d.sections.map((s,i)=>`<a href="#concept-${i}"><span>${String(i+1).padStart(2,'0')}</span>${s[0]}</a>`).join('')}
  <a href="#practice">Práctica guiada</a><a href="#assessment">Evaluación</a></nav><div class="reader-note">LEE. ESCUCHA.<br>HAZLO SONAR.</div></aside><article class="article lesson-article">
  <div class="tiny">Etapa ${l.module+1} · ${modules[l.module][0]}</div>
  <div class="row"><span class="badge">Lección ${id+1} de ${lessons.length}</span><span class="muted small">${minutes}–${minutes+7} min · Lectura + práctica</span></div>
  <h1>${l.title}</h1>
  <p class="lesson-lead">${l.body}</p>${Academy.lessonVisual(id)}
  <section class="learning-goals"><h2>Lo que vas a aprender</h2><ul>${d.goals.map(g=>`<li>${g}</li>`).join('')}</ul></section>

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
  </section></article></div>`;
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
  const el=document.getElementById('heroAudioError')||document.getElementById('lessonAudioError')||document.getElementById('audioError')||document.getElementById('earFeedback');
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

