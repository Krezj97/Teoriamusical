/* Salamander Grand Piano / Alexander Holm / CC BY 3.0.
   See THIRD_PARTY_NOTICES.md. The stereo reverb impulse is generated locally. */
const CadenciaAudio = (() => {
  const anchors = Array.from({length:19}, (_,i) => 36+i*3);
  const names = ['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'];
  const revision = 'efd8296360f9526e379bfbe5c1698ff54d6a1d34';
  const bases = [
    'https://tonejs.github.io/audio/salamander/',
    'https://cdn.jsdelivr.net/gh/Tonejs/audio@'+revision+'/salamander/'
  ];
  const buffers=new Map(), voices=new Set();
  let ctx,graph,loading=null,loaded=0,state='idle',error='',generation=0;
  let settings={enabled:false,mix:25,volume:75};
  try {
    const s=JSON.parse(localStorage.getItem('cadencia-audio-v1'));
    if(s) settings={
      enabled:s.enabled===true,
      mix:Number.isFinite(s.mix)?Math.max(0,Math.min(60,s.mix)):25,
      volume:Number.isFinite(s.volume)?Math.max(0,Math.min(100,s.volume)):75
    };
  } catch(e) {}
  function emit(){
    window.dispatchEvent(new CustomEvent('cadencia-audio',{detail:status()}));
  }
  function status(){return {state,loaded,total:anchors.length,error,...settings};}
  function context(){
    if(!ctx){
      const A=window.AudioContext||window.webkitAudioContext;
      if(!A)throw Error('Este navegador no permite reproducir audio Web Audio.');
      ctx=new A();
      const input=ctx.createGain(),dry=ctx.createGain(),send=ctx.createGain();
      const convolver=ctx.createConvolver(),damp=ctx.createBiquadFilter();
      const wet=ctx.createGain(),master=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
      damp.type='lowpass';damp.frequency.value=5200;
      const impulse=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*2.4),ctx.sampleRate);
      // Different, repeatable noise per channel; exponential decay and 18 ms pre-delay.
      for(let channel=0;channel<2;channel++){
        const data=impulse.getChannelData(channel);let seed=9841+channel*17041;
        for(let i=0;i<data.length;i++){
          seed=(Math.imul(seed,1664525)+1013904223)>>>0;
          const t=i/ctx.sampleRate-.018;
          data[i]=t<0?0:((seed/4294967296)*2-1)*Math.exp(-3.2*t);
        }
      }
      convolver.buffer=impulse;
      input.connect(dry);dry.connect(master);
      input.connect(send);send.connect(convolver);convolver.connect(damp);damp.connect(wet);wet.connect(master);
      limiter.threshold.value=-8;limiter.knee.value=12;limiter.ratio.value=8;
      limiter.attack.value=.003;limiter.release.value=.18;
      master.connect(limiter);limiter.connect(ctx.destination);
      graph={input,dry,send,convolver,damp,wet,master,limiter};
      apply();
    }
    return ctx;
  }
  async function unlock(){
    const a=context();
    if(a.state!=='running')await a.resume();
    if(a.state!=='running')throw Error('Activa el sonido pulsando de nuevo el control.');
    return a;
  }
  function apply(){
    if(!graph)return;
    const t=ctx.currentTime;
    graph.dry.gain.setTargetAtTime(1,t,.02);
    graph.send.gain.setTargetAtTime(settings.enabled?1:0,t,.02);
    graph.wet.gain.setTargetAtTime(settings.enabled?settings.mix/100:0,t,.02);
    graph.master.gain.setTargetAtTime(settings.volume/100*.85,t,.02);
  }
  function configure(patch){
    if(typeof patch.enabled==='boolean')settings.enabled=patch.enabled;
    if(Number.isFinite(patch.mix))settings.mix=Math.max(0,Math.min(60,patch.mix));
    if(Number.isFinite(patch.volume))settings.volume=Math.max(0,Math.min(100,patch.volume));
    apply();
    try{localStorage.setItem('cadencia-audio-v1',JSON.stringify(settings))}catch(e){}
    emit();
  }
  async function getSample(midi){
    if(buffers.has(midi))return;
    const file=names[midi%12]+(Math.floor(midi/12)-1)+'.mp3';
    let lastError;
    for(const base of bases){
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),18000);
      try{
        const response=await fetch(base+file,{signal:controller.signal,mode:'cors'});
        if(!response.ok)throw Error('HTTP '+response.status);
        const data=await response.arrayBuffer();
        const buffer=await ctx.decodeAudioData(data);
        if(!buffer.duration)throw Error('Archivo de audio vacío');
        buffers.set(midi,buffer);loaded=buffers.size;emit();return;
      }catch(e){lastError=e}finally{clearTimeout(timer)}
    }
    throw Error('No se pudo cargar '+file+'. Comprueba tu conexión y pulsa Cargar piano para reintentar.');
  }
  async function load(){
    await unlock();
    if(state==='ready')return;
    if(loading)return loading;
    state='loading';error='';emit();
    loading=(async()=>{
      let cursor=0,failures=[];
      const worker=async()=>{
        while(cursor<anchors.length){
          const note=anchors[cursor++];
          try{await getSample(note)}catch(e){failures.push(e)}
        }
      };
      await Promise.all([worker(),worker(),worker(),worker()]);
      if(failures.length)throw failures[0];
      state='ready';emit();
    })().catch(e=>{state='error';error=e.message;emit();throw e}).finally(()=>{loading=null});
    return loading;
  }
  async function ready(){const token=generation;await load();return token===generation;}
  function play(midi,duration=.9,delay=0,volume=.16){
    if(state!=='ready')throw Error('Carga el piano antes de tocar.');
    const nearest=anchors.reduce((a,b)=>Math.abs(b-midi)<Math.abs(a-midi)?b:a);
    const src=ctx.createBufferSource(),gain=ctx.createGain();
    src.buffer=buffers.get(nearest);src.playbackRate.value=Math.pow(2,(midi-nearest)/12);
    const t=ctx.currentTime+Math.max(0,delay),hold=Math.max(.08,duration),release=.4;
    const level=Math.min(.8,Math.max(0,volume*2.2));
    gain.gain.setValueAtTime(0,t);
    gain.gain.linearRampToValueAtTime(level,t+.008);
    gain.gain.setValueAtTime(level,t+hold);
    gain.gain.exponentialRampToValueAtTime(.0001,t+hold+release);
    src.connect(gain);gain.connect(graph.input);
    const voice={src,gain};voices.add(voice);
    src.onended=()=>{voices.delete(voice);src.disconnect();gain.disconnect()};
    src.start(t);src.stop(t+hold+release+.03);
  }
  function click(accent){
    const a=context(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
    o.frequency.value=accent?1400:950;g.gain.setValueAtTime(.12,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+.055);
    o.connect(g);g.connect(graph.master);o.start(t);o.stop(t+.06);
    o.onended=()=>{o.disconnect();g.disconnect()};
  }
  function stop(){
    generation++;
    for(const voice of voices){try{voice.src.stop()}catch(e){}}
    voices.clear();
  }
  return {ready,load,unlock,play,click,stop,status,configure};
})();
