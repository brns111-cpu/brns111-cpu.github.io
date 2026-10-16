// عامل الخدمة الوحيد للموقع: تخزين الواجهة والمكتبات للعرض دون اتصال + نقر الإشعارات
const V='ah-v3',CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(u.host==='firestore.googleapis.com'||u.host.endsWith('identitytoolkit.googleapis.com')||u.host==='securetoken.googleapis.com')return; // بيانات حيّة: لا نتدخل
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put('./index.html',c));return x}).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return;
  }
  const ok=u.origin===location.origin||/(^|\.)gstatic\.com$|^fonts\.googleapis\.com$|^images\.unsplash\.com$/.test(u.host);
  if(!ok)return;
  e.respondWith(caches.match(r).then(m=>{
    const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x}).catch(()=>m);
    return m||n;
  }));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')))});
