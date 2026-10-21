/* Local encrypted profiles. No server, remote session or cross-device sync. */
const ProfileStore = (() => {
  const prefix='cadencia-profile-v1:',enc=new TextEncoder(),dec=new TextDecoder();
  let username=null,key=null,salt=null,data={},guest=false,queue=Promise.resolve(),revision=0,saveVersion=0;
  const bytes=a=>new Uint8Array(a),b64=a=>btoa(String.fromCharCode(...bytes(a))),un64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const normalize=s=>String(s).normalize('NFKC').trim().toLowerCase();
  const announce=()=>window.dispatchEvent(new CustomEvent('cadencia-profile',{detail:status()}));
  function status(){return {username,guest,active:guest||!!username}}
  async function derive(password,s){
    const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:s,iterations:600000},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function seal(k,s,name,values){
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(name)},k,enc.encode(JSON.stringify(values)));
    return JSON.stringify({version:1,salt:b64(s),iv:b64(iv),cipher:b64(cipher)});
  }
  async function register(name,password,importLegacy=false){
    const u=normalize(name);
    if(!/^[a-z0-9_.-]{3,24}$/.test(u))throw Error('Usa entre 3 y 24 letras, números, puntos o guiones.');
    if(password.length<12||password.length>128)throw Error('La contraseña debe tener entre 12 y 128 caracteres.');
    if(localStorage.getItem(prefix+u))throw Error('Ese usuario ya existe en este navegador.');
    const s=crypto.getRandomValues(new Uint8Array(16)),k=await derive(password,s),values={};
    if(importLegacy){for(let i=0;i<localStorage.length;i++){const n=localStorage.key(i);if(n==='cadencia-v1'||n==='cadencia-practice-v1'||/^cadencia-note-\d+$/.test(n))values[n]=localStorage.getItem(n)}}
    const sealed=await seal(k,s,u,values);
    if(localStorage.getItem(prefix+u))throw Error('Ese usuario acaba de crearse en otra pestaña. Elige otro nombre.');
    localStorage.setItem(prefix+u,sealed);
    username=u;key=k;salt=s;data=values;guest=false;revision++;announce();
  }
  let failures=0,lockedUntil=0;
  async function login(name,password){
    if(Date.now()<lockedUntil)throw Error('Espera unos segundos antes de volver a intentarlo.');
    const u=normalize(name),raw=localStorage.getItem(prefix+u);
    try{
      if(!raw)throw Error('missing');
      const record=JSON.parse(raw);if(record.version!==1)throw Error('version');
      const s=un64(record.salt),k=await derive(password,s);
      const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(record.iv),additionalData:enc.encode(u)},k,un64(record.cipher));
      const values=JSON.parse(dec.decode(plain));if(!values||typeof values!=='object'||Array.isArray(values))throw Error('data');
      username=u;key=k;salt=s;data=values;guest=false;revision++;failures=0;announce();
    }catch(e){failures++;if(failures>=5){lockedUntil=Date.now()+30000;failures=0}throw Error('Usuario o contraseña incorrectos, o perfil dañado. Revisa los datos.')}
  }
  function getItem(n){return Object.prototype.hasOwnProperty.call(data,n)?data[n]:null}
  function persist(){
    if(guest||!username)return;
    const u=username,k=key,s=salt,snapshot={...data},rev=revision,version=++saveVersion;
    queue=queue.catch(()=>{}).then(async()=>{
      const sealed=await seal(k,s,u,snapshot);
      if(rev!==revision)return;
      localStorage.setItem(prefix+u,sealed);
      if(version===saveVersion)window.dispatchEvent(new CustomEvent('cadencia-saved'));
    });
    queue.catch(()=>window.dispatchEvent(new CustomEvent('cadencia-save-error')));
  }
  function setItem(n,v){if(!status().active)throw Error('Entra con un perfil o como invitado.');data[n]=String(v);persist()}
  function removeItem(n){delete data[n];persist()}
  async function flush(){try{await queue}catch(e){if(!username)throw e;queue=Promise.resolve();persist();await queue}}
  async function logout(){await flush();username=null;key=null;salt=null;data={};guest=false;revision++;announce()}
  async function enterGuest(){await flush();username=null;key=null;salt=null;data={};guest=true;revision++;announce()}
  return {status,register,login,enterGuest,logout,getItem,setItem,removeItem,flush};
})();
