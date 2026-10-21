(() => {
 const $=id=>document.getElementById(id);let mode='login',busy=false;
 function update(){
  const s=ProfileStore.status();$('accessScreen').hidden=s.active;$('appShell').hidden=!s.active;
  $('accountLabel').textContent=s.guest?'Invitado':s.username||'Mi perfil';
  $('profileMessage').textContent=s.guest?'Modo invitado: este avance se perderá al recargar o cerrar.':'Perfil local: el progreso se guarda cifrado en este navegador.';
  $('accountDescription').textContent=s.guest?'Tu sesión es temporal. Al salir se pierde el progreso.':'Tu perfil y tu progreso están en este navegador. Para volver a entrar necesitarás tu contraseña.';
  $('exitAccount').textContent=s.guest?'Salir del modo invitado':'Guardar y cerrar sesión';
 }
 function changeMode(next){mode=next;$('registerFields').hidden=mode!=='register';$('authTitle').textContent=mode==='register'?'Crea tu espacio musical':'Qué bueno verte de nuevo';$('authSubmit').textContent=mode==='register'?'Crear mi perfil':'Entrar';$('authPassword').autocomplete=mode==='register'?'new-password':'current-password';$('authPassword').minLength=mode==='register'?12:1;$('authError').textContent='';document.querySelectorAll('[data-auth-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.authMode===mode)))}
 document.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.authMode));
 $('authForm').onsubmit=async e=>{
  e.preventDefault();if(busy)return;busy=true;$('authSubmit').disabled=true;$('authError').textContent='';
  try{
   const name=$('authUsername').value,password=$('authPassword').value;
   if(mode==='register'){
    if(password!==$('authConfirm').value)throw Error('Las contraseñas no coinciden.');
    await ProfileStore.register(name,password,$('importLegacy').checked);
   }else await ProfileStore.login(name,password);
   $('authPassword').value='';$('authConfirm').value='';$('authForm').reset();
  }catch(err){$('authError').textContent=err.message}
  finally{busy=false;$('authSubmit').disabled=false}
 };
 $('guestEntry').onclick=async()=>{if(busy)return;try{await ProfileStore.enterGuest()}catch(e){$('authError').textContent=e.message}};
 $('exitAccount').onclick=async()=>{
  try{await ProfileStore.logout();$('accountMenu').open=false;$('authError').textContent='';changeMode('login');$('authUsername').focus()}
  catch(e){$('accountDescription').textContent='No se pudo guardar. Libera espacio y vuelve a intentarlo; tu sesión sigue abierta.'}
 };
 window.addEventListener('cadencia-profile',update);
 window.addEventListener('cadencia-save-error',()=>{$('profileMessage').textContent='No se pudo guardar el progreso. Libera espacio antes de cerrar la sesión.'});
 changeMode('login');update();
})();
