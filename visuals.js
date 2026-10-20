/* Accurate, self-contained SVG diagrams for musical examples. */
const MusicVisual = (() => {
const wrap=(body,title,height=210)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 '+height+'" role="img" aria-label="'+title+'"><title>'+title+'</title><rect width="480" height="'+height+'" rx="16" fill="#faf8f4"/>'+body+'</svg>';
function keyboard(pcs=[0,4,7],root=0){
  const white=[0,2,4,5,7,9,11,12],black=[[1,1],[3,2],[6,4],[8,5],[10,6]],names=['Do','Re','Mi','Fa','Sol','La','Si','Do'];
  let body='<text x="24" y="29" font-family="system-ui" font-size="17" fill="#706979">Una octava · C4–C5</text>';
  white.forEach((n,i)=>{const active=pcs.includes(n%12),fill=active?(n%12===root?'#c0ed6d':'#baa2f1'):'#fff';body+='<rect x="'+(24+i*54)+'" y="45" width="54" height="135" rx="5" fill="'+fill+'" stroke="#494057"/><text x="'+(51+i*54)+'" y="164" text-anchor="middle" fill="#282337" font-family="system-ui" font-size="17">'+names[i]+'</text>'});
  black.forEach(([pc,boundary])=>{const active=pcs.includes(pc);body+='<rect x="'+(24+boundary*54-16)+'" y="45" width="32" height="84" rx="4" fill="'+(active?(pc===root?'#c0ed6d':'#baa2f1'):'#292333')+'"/>'});
  return wrap(body,'Teclado: notas marcadas de la colección seleccionada');
}
function staff(names=['C','D','E','F','G','A','B','C']){
  const letters=['C','D','E','F','G','A','B'];
  let body='<text x="22" y="28" font-size="17" font-family="system-ui" fill="#706979">Clave de sol · notas naturales desde do4</text>';
  for(let i=0;i<5;i++)body+='<line x1="20" y1="'+(122-i*13)+'" x2="460" y2="'+(122-i*13)+'" stroke="#8e8499"/>';
  body+='<text x="23" y="126" font-family="serif" font-size="68" fill="#3c304e">𝄞</text>';
  names.forEach((n,i)=>{const step=i===7?7:letters.indexOf(n),x=90+i*49,y=135-step*6.5;
    if(y>=135)body+='<line x1="'+(x-13)+'" x2="'+(x+13)+'" y1="135" y2="135" stroke="#65576f"/>';
    body+='<ellipse cx="'+x+'" cy="'+y+'" rx="8" ry="5.5" transform="rotate(-20 '+x+' '+y+')" fill="#7655ad"/><line x1="'+(x+7)+'" x2="'+(x+7)+'" y1="'+y+'" y2="'+(y-32)+'" stroke="#7655ad" stroke-width="2"/><text x="'+x+'" y="178" text-anchor="middle" font-family="system-ui" font-size="16" fill="#3c304e">'+['Do','Re','Mi','Fa','Sol','La','Si','Do'][i]+'</text>'});
  return wrap(body,'Escala de do mayor escrita en clave de sol',205);
}
function rhythm(){
  let b='<text x="22" y="28" font-size="18" font-family="system-ui" fill="#43364f">Duración relativa · la negra vale 1</text>';
  [['Redonda',4],['Blanca',2],['Negra',1],['Corchea',.5],['Semicorchea',.25]].forEach(([label,value],i)=>{
    const y=48+i*42;b+='<text x="22" y="'+(y+21)+'" font-size="17" font-family="system-ui" fill="#51455f">'+label+'</text><rect x="160" y="'+y+'" width="294" height="29" rx="5" fill="#eae4ef"/><rect x="160" y="'+y+'" width="'+(294*value/4)+'" height="29" rx="5" fill="#9e7bd4"/><text x="449" y="'+(y+21)+'" text-anchor="end" font-size="17" font-family="system-ui" fill="#36283f">'+(value===.5?'1/2':value===.25?'1/4':value)+'</text>';
  });return wrap(b,'Comparación de duraciones: redonda 4, blanca 2, negra 1, corchea medio y semicorchea un cuarto',275);
}
function chord(){
  let b='<text x="24" y="28" font-size="18" font-family="system-ui" fill="#43364f">Construir Cmaj7 · terceras superpuestas</text>';
  [['C','Do',0],['E','Mi',4],['G','Sol',7],['B','Si',11]].forEach(([letter,label,semi],i)=>{
    const y=184-i*40;b+='<rect x="45" y="'+(y-20)+'" width="78" height="32" rx="8" fill="'+(i?'#e4d6f5':'#c0ed6d')+'"/><text x="84" y="'+(y+3)+'" text-anchor="middle" font-family="system-ui" font-size="20" fill="#372a44">'+letter+'</text><text x="153" y="'+(y+2)+'" font-family="system-ui" font-size="18" fill="#51455f">'+label+' · '+['Fundamental','Tercera mayor','Quinta justa','Séptima mayor'][i]+'</text><text x="432" y="'+(y+2)+'" text-anchor="end" font-family="system-ui" font-size="17" fill="#7655ad">'+semi+' st</text>';
  });return wrap(b,'Do, mi, sol y si forman do mayor séptima: 0, 4, 7 y 11 semitonos',220);
}
function circle(selected=0,labels=true){
  const keys=Music.circle;let b='<circle cx="240" cy="240" r="180" fill="none" stroke="#ded4e6" stroke-width="2"/><circle cx="240" cy="240" r="119" fill="none" stroke="#e8e0ed" stroke-dasharray="4 8"/>';
  keys.forEach((k,i)=>{const a=(i*30-90)*Math.PI/180,x=240+180*Math.cos(a),y=240+180*Math.sin(a),r=i===selected?27:23;
    b+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(i===selected?'#c0ed6d':(i===((selected+1)%12)||i===((selected+11)%12))?'#ded1f2':'#fff')+'" stroke="#d6cae0"/>';
    if(labels)b+='<text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" font-family="system-ui" font-size="21" fill="#40304d">'+k.root+'</text>';
  });
  if(labels)b+='<text x="240" y="224" text-anchor="middle" font-family="system-ui" font-size="20" fill="#706979">Quintas ascendentes ↻</text><text x="240" y="259" text-anchor="middle" font-family="system-ui" font-size="26" fill="#4b365e">'+keys[selected].root+' mayor</text><text x="240" y="292" text-anchor="middle" font-family="system-ui" font-size="18" fill="#706979">Relativa: '+keys[selected].relative+'</text>';
  return wrap(b,'Círculo de quintas: do, sol, re, la, mi, si, fa sostenido, re bemol, la bemol, mi bemol, si bemol, fa',480);
}
function modes(){
  const rows=[['Jónico','3','6','7'],['Dórico','♭3','6','♭7'],['Frigio','♭3','♭6','♭7'],['Lidio','3','6','7'],['Mixolidio','3','6','♭7'],['Eólico','♭3','♭6','♭7'],['Locrio','♭3','♭6','♭7']];
  let b='<text x="23" y="28" font-family="system-ui" font-size="18" fill="#43364f">Modos · compara desde una misma tónica</text><text x="23" y="58" font-family="system-ui" font-size="16" fill="#706979">Modo</text><text x="215" y="58" font-family="system-ui" font-size="16" fill="#706979">III</text><text x="300" y="58" font-family="system-ui" font-size="16" fill="#706979">VI</text><text x="390" y="58" font-family="system-ui" font-size="16" fill="#706979">VII</text>';
  rows.forEach((r,i)=>{let y=88+i*34;b+='<rect x="15" y="'+(y-22)+'" width="450" height="30" rx="5" fill="'+(i%2?'#eee7f5':'#faf8f4')+'"/>';r.forEach((v,j)=>b+='<text x="'+[23,215,300,390][j]+'" y="'+y+'" font-family="system-ui" font-size="18" fill="#4b365e">'+v+'</text>')});
  b+='<text x="23" y="341" font-family="system-ui" font-size="16" fill="#706979">Además: frigio ♭2 · lidio ♯4 · locrio ♭2 y ♭5</text>';
  return wrap(b,'Tabla comparativa de tercera, sexta y séptima de los siete modos diatónicos',365);
}
function form(){
  let b='<text x="24" y="30" font-family="system-ui" font-size="19" fill="#43364f">Forma ABA · identidad, contraste, regreso</text>';
  [['A','Presentación'],['B','Contraste'],['A','Retorno']].forEach(([letter,label],i)=>{const x=24+i*150;b+='<rect x="'+x+'" y="62" width="132" height="100" rx="12" fill="'+(i===1?'#dcd0f2':'#c0ed6d')+'"/><text x="'+(x+66)+'" y="112" text-anchor="middle" font-size="35" font-family="serif" fill="#3b2d47">'+letter+'</text><text x="'+(x+66)+'" y="144" text-anchor="middle" font-size="17" font-family="system-ui" fill="#4e425a">'+label+'</text>'});return wrap(b,'Tres secciones: A presentación, B contraste, A retorno',190);
}
return {keyboard,staff,rhythm,chord,circle,modes,form};
})();
