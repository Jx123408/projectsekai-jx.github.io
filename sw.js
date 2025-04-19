self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    self.skipWaiting();
    e.waitUntil(
        caches.open(cacheName).then((cache) => 
            Promise.all(
                contentToCache.map((url) => {
                    // cache-bust using a random query string
                    return fetch(`${url}?${Math.random()}`).then((response) => {
                        // fail on 404, 500 etc
                        if (response.ok){
                            //pass
                        }else{
                            console.error(`can't get "${url}"`);
                        } 
                        return cache.put(url, response);
                    }).catch(err => {
                        console.error(err);
                    });
                }),
            )
        ),
    );
});

self.addEventListener('fetch', function(event) {
    if(navigator.onLine){
        event.respondWith(
            fetch(event.request).then((response) => {
                if(response){
                    return response;
                }else{
                    return new Response(null,{
                        status:504,
                        statusText:"net failed",
                    });
                }
            }).catch((error) => {
                console.warn(error);
                return new Response(null,{
                    status:500,
                    statusText:"internal error",
                });
            })
        );
        
    }else{
        event.respondWith(
            caches.match(event.request,{cacheName:cacheName,ignoreVary:true}).then((response) => {
                if (response) {
                    return response;
                }else{
                    return new Response(null,{
                        status:504,
                        statusText:"net failed",
                    });
                }
            }).catch((error) => {
                console.warn(error);
                return new Response(null,{
                    status:500,
                    statusText:"internal error",
                });
            })
        );
    }
});

self.addEventListener('activate', (evt) => {
    console.log('[Service Worker] Activating new service worker...');
    const cacheAllowlist = [cacheName];
  
    evt.waitUntil(
        caches.keys().then((keyList) => {
            // eslint-disable-next-line array-callback-return
            return Promise.all(
                keyList.filter(key => {
                    return !cacheAllowlist.includes(key);
                }).map(key => {
                    console.log(`[Service Worker] Deleting old cache ("${key}")`);
                    return caches.delete(key);
                })
            );
        }).catch((error) => {
            console.warn(error);
        })
    )
    console.log('done.');
})

const cacheName = "SWP-PWA-v0.1.0";
const contentToCache = [
    "./index.html",
    "./manifest.json",

    "./assets/node_calc.wasm",
    "./assets/index.js",
    "./assets/index.css",

    "./icons/favicon.ico",
    "./icons/favicon.png",

    "./localization/ja-localization-react.json",
    "./localization/en-localization-react.json",

    "./textures/cancel.svg",
    "./textures/caution_orange.svg",
    "./textures/caution.svg",
    "./textures/close.svg",
    "./textures/cloud_download.png",
    "./textures/delete.svg",
    "./textures/edit.svg",
    "./textures/loading.svg",
    "./textures/noimage.png",
    "./textures/system_tex.webp",
    
    "./zlib/gunzip.min.js",
    "./zlib/unzip.min.js",
];