/* Generated exercises: answer, distractors and explanation share the same musical model. */
const Trainer = (() => {
const modes=[
['reading','Lectura en pentagrama','visual'],
['interval','Construir intervalos','theory'],
['scale','Grados de escalas','theory'],
['chord','Notas de un acorde','theory'],
['circle','Círculo y armaduras','visual'],
['function','Completar ii–V–I','theory'],
['rhythm','Sumar figuras rítmicas','visual'],
['earInterval','Oído: intervalos','audio'],
['earChord','Oído: acordes','audio']
].map(([id,name,group])=>({id,name,group}));
const intervalNames={1:'2.ª menor',2:'2.ª mayor',3:'3.ª menor',4:'3.ª mayor',5:'4.ª justa',6:'Tritono',7:'5.ª justa',8:'6.ª menor',9:'6.ª mayor',10:'7.ª menor',11:'7.ª mayor',12:'Octava justa'};
function make(type='reading',level='basic',rng=Math.random){
  const pick=a=>a[Math.min(a.length-1,Math.floor(rng()*a.length))];
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const root=pick(level==='basic'?['C','G','F','D']:Music.tonicNames);
  let prompt,correct,candidates,explanation,visual=null,audio=null;
  if(type==='reading'){
    const notes=[60,62,64,65,67,69,71,72,74,76,77,79],index=level==='basic'?Math.floor(rng()*8):Math.floor(rng()*12);
    const label=n=>Music.name(Music.tonicNames[n%12])+Math.floor(n/12-1)+' ('+Music.tonicNames[n%12]+Math.floor(n/12-1)+')';
    correct=label(notes[index]);candidates=notes.filter(n=>n!==notes[index]).map(label);
    prompt='¿Qué nota aparece en clave de sol?';visual={kind:'note',midi:notes[index],step:index};
    explanation='La nota es '+correct+'. Usa sol4 en la segunda línea y cuenta posiciones de línea y espacio.';
  } else if(type==='interval'||type==='earInterval'){
    const values=level==='basic'?[2,3,4,5,7,12]:[1,2,3,4,5,6,7,8,9,10,11,12],distance=pick(values),midi=57+Math.floor(rng()*8);
    correct=intervalNames[distance];candidates=values.filter(n=>n!==distance).map(n=>intervalNames[n]);
    if(type==='earInterval'){
      const direction=level==='advanced'?pick(['up','down','together']):'up';
      audio={notes:direction==='down'?[midi+distance,midi]:[midi,midi+distance],simultaneous:direction==='together'};
      prompt=direction==='together'?'Escucha las dos notas simultáneas. ¿Qué intervalo forman?':direction==='down'?'Escucha el intervalo descendente. ¿Qué distancia separa las notas?':'Escucha las dos notas ascendentes. ¿Qué intervalo forman?';
    }else prompt='Dos notas están separadas por '+distance+' semitonos. ¿Qué distancia corresponde? (El tritono se acepta sin distinguir su escritura.)';
    explanation=correct+' contiene '+distance+' semitonos. Canta ambas notas y compáralas con el piano.';
  }else if(type==='scale'){
    const id=pick(level==='basic'?['major','minor']:['major','minor','dorian','phrygian','lydian','mixo','harmonic','melodic']);
    const scale=Music.scale(id,root),index=1+Math.floor(rng()*6);
    prompt='En '+Music.name(root)+' '+scale.name.toLowerCase()+', ¿qué nota ocupa el grado '+(index+1)+'?';
    correct=scale.names[index];candidates=scale.names.filter(n=>n!==correct);
    explanation=scale.names.join('–')+'. Contando la tónica como grado 1, el grado '+(index+1)+' es '+correct+'.';visual={kind:'root',root};
  }else if(type==='chord'){
    const qualities=level==='basic'?['major','minor','dim','aug']:['maj7','dom7','min7','half','dim7','sus7','maj9','min9'];
    const id=pick(qualities),c=Music.chord(id,root);
    prompt='¿Qué notas forman '+c.symbol+' ('+c.name.toLowerCase()+')?';
    correct=c.names.join('–');candidates=qualities.filter(q=>q!==id).map(q=>Music.chord(q,root).names.join('–'));
    explanation=c.symbol+' = '+correct+'. Fórmula: '+c.formula+'.';visual={kind:'root',root};
  }else if(type==='circle'){
    const index=Math.floor(rng()*12),key=Music.circle[index];
    if(level==='basic'){
      prompt='¿Qué tonalidad mayor tiene esta armadura: '+key.signature.toLowerCase()+'?';
      correct=key.name;candidates=Music.circle.filter(k=>k!==key).map(k=>k.name);
      explanation=key.name+' tiene '+key.signature.toLowerCase()+'. '+(key.accidentals.length?'Alteraciones: '+key.accidentals.join(', ')+'.':'Do mayor no tiene sostenidos ni bemoles.');
    }else{
      prompt='¿Cuál es la relativa menor de '+key.name.toLowerCase()+'?';
      correct=key.relativeName;candidates=Music.circle.filter(k=>k!==key).map(k=>k.relativeName);
      explanation=key.name+' y '+key.relativeName+' comparten armadura, pero tienen distinta tónica.';
    }
    visual={kind:'circle'};
  }else if(type==='function'){
    const p=Music.progression('ii',root),c=p.chords;
    prompt='Completa ii7–V7–Imaj7 en '+Music.name(root)+' mayor: '+c[0].symbol+' → ? → '+c[2].symbol+'.';
    correct=c[1].symbol;candidates=[Music.chord('dom7',root).symbol,Music.chord('min7',c[1].root).symbol,Music.chord('maj7',Music.noteAt(root,5,3)).symbol];
    explanation='La dominante es '+correct+', construida sobre el V. La secuencia completa es '+c.map(x=>x.symbol).join(' → ')+'.';
  }else if(type==='rhythm'){
    const patterns=level==='basic'?[[['Negra',1],['Corchea',.5],['Corchea',.5]],[['Blanca',2],['Negra',1]],[['Blanca',2],['Blanca',2]],[['Corchea',.5],['Corchea',.5],['Negra',1],['Negra',1]]]:[[['Negra con puntillo',1.5],['Corchea',.5],['Blanca',2]],[['Tresillo de corcheas',1],['Blanca',2],['Negra',1]],[['Blanca con puntillo',3],['Corchea',.5]],[['Negra',1],['Semicorchea',.25],['Semicorchea',.25]]];
    const pattern=pick(patterns),total=pattern.reduce((s,x)=>s+x[1],0),fmt=n=>String(n).replace('.',',')+(n===1?' negra':' negras');
    prompt='¿Cuánto suman estas figuras en unidades de negra?';
    correct=fmt(total);candidates=[1,1.5,2,2.5,3,3.5,4,4.5,5].filter(n=>n!==total).map(fmt);
    explanation=pattern.map(x=>x[0]+' = '+x[1]).join(' · ')+'. Total: '+fmt(total)+'.';visual={kind:'rhythm',pattern:pattern.map(x=>x[0])};
  }else if(type==='earChord'){
    const qualities=level==='basic'?['major','minor','dim','aug']:['major','minor','maj7','dom7','min7','half','sus4','dim7'],id=pick(qualities),c=Music.chord(id,root);
    prompt='Escucha el acorde. ¿Qué cualidad tiene?';correct=c.name;candidates=qualities.filter(q=>q!==id).map(q=>Music.chord(q,root).name);
    audio={notes:c.notes.map(n=>60+Music.pitch(root)+n),simultaneous:true};
    explanation=c.name+': '+c.formula+'. Ejemplo escuchado: '+c.symbol+'.';
  }else throw Error('Ejercicio desconocido');
  const choices=shuffle([correct,...shuffle([...new Set(candidates)].filter(x=>x!==correct)).slice(0,3)]);
  return {type,level,prompt,choices,answer:choices.indexOf(correct),explanation,visual,audio};
}
return {modes,make,intervalNames};
})();
