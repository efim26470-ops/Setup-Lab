const CACHE='setuplab-shell-v1.1.1';
const SHELL=['./','./index.html','./styles.css?v=1.1.1','./app.js?v=1.1.1','./catalog.json?v=1.1.1','./manifest.webmanifest?v=1.1.1','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png', './assets/fallbacks/generic.svg', './assets/fallbacks/cpu.svg', './assets/fallbacks/gpu.svg', './assets/fallbacks/motherboard.svg', './assets/fallbacks/ram.svg', './assets/fallbacks/storage.svg', './assets/fallbacks/psu.svg', './assets/fallbacks/case.svg', './assets/fallbacks/cooler.svg', './assets/fallbacks/wheelbase.svg', './assets/fallbacks/wheel.svg', './assets/fallbacks/pedals.svg', './assets/fallbacks/cockpit.svg', './assets/fallbacks/shifter.svg', './assets/fallbacks/handbrake.svg', './assets/fallbacks/dashboard.svg', './assets/fallbacks/display.svg', './assets/fallbacks/projector.svg', './assets/fallbacks/receiver.svg', './assets/fallbacks/speakers.svg', './assets/fallbacks/soundbar.svg', './assets/fallbacks/subwoofer.svg', './assets/fallbacks/source.svg', './assets/fallbacks/screen.svg', './assets/fallbacks/monitor.svg', './assets/fallbacks/desk.svg', './assets/fallbacks/chair.svg', './assets/fallbacks/keyboard.svg', './assets/fallbacks/mouse.svg', './assets/fallbacks/dock.svg', './assets/fallbacks/lighting.svg', './assets/fallbacks/monitorarm.svg', './assets/fallbacks/webcam.svg', './assets/fallbacks/camera.svg', './assets/fallbacks/lens.svg', './assets/fallbacks/gimbal.svg', './assets/fallbacks/flash.svg', './assets/fallbacks/tripod.svg', './assets/fallbacks/amplifier.svg', './assets/fallbacks/turntable.svg', './assets/fallbacks/headphones.svg', './assets/fallbacks/activemonitors.svg', './assets/fallbacks/interface.svg', './assets/fallbacks/microphone.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==location.origin) return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
        return response;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      const network=fetch(request).then(response=>{
        if(response.ok){ const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(request,copy)); }
        return response;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
