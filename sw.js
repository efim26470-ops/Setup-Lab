const CACHE='setuplab-shell-v1.3.1';
const CORE=['./','./index.html','./styles.css?v=1.3.1','./app.js?v=1.3.1','./manifest.webmanifest?v=1.3.1','./icons/icon.svg','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(CORE.map(url=>fetch(url,{cache:'reload'}).then(r=>{if(r.ok)return cache.put(url,r);}).catch(()=>null)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('setuplab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put('./index.html',r.clone()));return r;}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));return;
  }
  const important=/\/(app\.js|styles\.css|catalog(?:\.min)?\.json|manifest\.webmanifest)(?:\?|$)/.test(url.pathname+url.search);
  if(important){
    event.respondWith(fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r;}).catch(()=>caches.match(req).then(r=>r||caches.match(url.pathname.replace(/^.*\/Setup-Lab\//,'./')))));return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r;})));
});
