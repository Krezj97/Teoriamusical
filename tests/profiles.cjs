/* Actual Web Crypto checks for local profiles and progress isolation. */
const fs=require('node:fs'),path=require('node:path'),{webcrypto}=require('node:crypto');
async function run(){
 let checks=0;const assert=(ok,message)=>{if(!ok)throw Error(message);checks++};
 const records=new Map(),events=[],storage={getItem:n=>records.get(n)??null,setItem:(n,v)=>records.set(n,String(v)),removeItem:n=>records.delete(n),key:i=>[...records.keys()][i],get length(){return records.size}};
 let full=false;const limited={...storage,get length(){return records.size},setItem(n,v){if(full)throw Error('QuotaExceededError');storage.setItem(n,v)}};
 const store=new Function('localStorage','crypto','window','CustomEvent',fs.readFileSync(path.join(__dirname,'../profiles.js'),'utf8')+'\nreturn ProfileStore;')(limited,webcrypto,{dispatchEvent:e=>events.push(e)},class{constructor(type,init){this.type=type;this.detail=init?.detail}});
 assert(!store.status().active,'No implicit authenticated session');
 await store.enterGuest();store.setItem('cadencia-v1','guest-progress');assert(store.getItem('cadencia-v1')==='guest-progress','Guest can practice');assert(records.size===0,'Guest never writes progress to disk');
 await store.logout();await store.enterGuest();assert(store.getItem('cadencia-v1')===null,'A new guest visit starts empty');
 let bad=false;try{await store.register('ana','short')}catch(e){bad=true}assert(bad,'Weak passwords rejected');
 await store.register('Ana','sample passphrase 123');assert(store.status().username==='ana','Usernames normalized');
 store.setItem('cadencia-v1','private-progress');store.setItem('cadencia-note-0','private-notes');await store.flush();
 let raw=storage.getItem('cadencia-profile-v1:ana');assert(!raw.includes('private-progress')&&!raw.includes('sample passphrase'),'Neither progress nor password stored in plaintext');
 const first=JSON.parse(raw);assert(Buffer.from(first.salt,'base64').length===16&&Buffer.from(first.iv,'base64').length===12,'Random salt and GCM nonce have expected sizes');
 store.setItem('cadencia-v1','updated-progress');await store.flush();assert(JSON.parse(storage.getItem('cadencia-profile-v1:ana')).iv!==first.iv,'Every save uses a fresh nonce');
 await store.logout();bad=false;try{await store.login('ana','wrong passphrase')}catch(e){bad=true}assert(bad&&!store.status().active,'Incorrect password cannot unlock profile');
 await store.login('ANA','sample passphrase 123');assert(store.getItem('cadencia-v1')==='updated-progress'&&store.getItem('cadencia-note-0')==='private-notes','Login restores encrypted progress and notebook');
 await store.logout();await store.register('bea','another passphrase 456');assert(store.getItem('cadencia-v1')===null,'A second user starts with separate progress');
 store.setItem('cadencia-v1','bea-progress');await store.flush();await store.logout();await store.login('ana','sample passphrase 123');assert(store.getItem('cadencia-v1')==='updated-progress','Switching users preserves isolation');
 full=true;store.setItem('cadencia-v1','pending');bad=false;try{await store.logout()}catch(e){bad=true}assert(bad&&store.status().active,'A failed save does not silently discard session');full=false;store.setItem('cadencia-v1','recovered');await store.flush();await store.logout();
 raw=storage.getItem('cadencia-profile-v1:ana');const record=JSON.parse(raw),cipher=Buffer.from(record.cipher,'base64');cipher[0]^=1;record.cipher=cipher.toString('base64');storage.setItem('cadencia-profile-v1:ana',JSON.stringify(record));
 bad=false;try{await store.login('ana','sample passphrase 123')}catch(e){bad=true}assert(bad&&!store.status().active,'Tampered ciphertext is rejected');
 storage.setItem('cadencia-v1','legacy');await store.register('cami','third passphrase 789',true);assert(store.getItem('cadencia-v1')==='legacy','Explicit legacy import preserves earlier progress');assert(storage.getItem('cadencia-v1')==='legacy','Legacy data remains untouched');
 console.log(JSON.stringify({checks,scope:'Real Web Crypto encryption, password failures, guest behavior, account isolation, tampering, legacy import and save failures.'},null,2));
}
run().catch(e=>{console.error(e);process.exitCode=1});
