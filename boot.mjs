// The browser may refuse orientation locking outside fullscreen. In that case
// the portrait overlay asks the player to turn the phone instead.
const portraitPhone=matchMedia('(pointer: coarse) and (orientation: portrait)');
const tryLandscape=()=>{try{const result=screen.orientation?.lock?.('landscape');if(result?.catch)result.catch(()=>{})}catch{}};
tryLandscape();
async function enterLandscape(){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen()}catch{}tryLandscape()}
document.getElementById('landscapeFullscreen').addEventListener('click',enterLandscape);
document.getElementById('fullscreen').addEventListener('click',enterLandscape);
document.getElementById('start').addEventListener('click',()=>{if(matchMedia('(pointer:coarse)').matches)enterLandscape()},{capture:true});
function sizeViewport(){document.documentElement.style.setProperty('--app-height',`${window.visualViewport?.height||innerHeight}px`)}
sizeViewport();window.visualViewport?.addEventListener('resize',sizeViewport);addEventListener('resize',sizeViewport);document.addEventListener('fullscreenchange',()=>{sizeViewport();dispatchEvent(new Event('resize'))});
function pauseInPortrait(){const overlay=document.getElementById('overlay');if(portraitPhone.matches&&document.body.classList.contains('racing')&&overlay.hidden)document.getElementById('pause').click()}
portraitPhone.addEventListener?.('change',pauseInPortrait);addEventListener('orientationchange',()=>setTimeout(pauseInPortrait,100));
// Suppress native selection and long-press menus only on the race controls.
const hud=document.getElementById('hud');
for(const type of ['contextmenu','selectstart','dragstart'])hud.addEventListener(type,event=>{if(document.body.classList.contains('racing'))event.preventDefault()});
const canvas=document.getElementById('world');let gl;try{gl=canvas.getContext('webgl2',{antialias:true,powerPreference:'high-performance'})}catch{}if(gl){await import('./game.js')}else{document.body.classList.add('compatible');await import('./game-compatible.js');const note=document.createElement('div');note.className='compatibility-note';note.textContent='Modo compatible · 3D no disponible en este navegador';document.body.append(note)}
