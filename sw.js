const staticCacheName = ['restaurant-static-v80'];


const pageUrls = [
    '/',
    '/index.html',
    '/restaurant.html'
];
const scriptUrls = [
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/js/Dialog.js',
    '/js/swhelper.js'
];
const dataUrls = ['./data/restaurants.json'];
const stylesUrls = [
    '/css/styles.css',
    '/css/responsive.css',
    'css/modal.css'
];
const imgsUrls = [
    '/img/1.jpg',
    '/img/1_300.jpg',
    '/img/1_400.jpg',
    '/img/1_600.jpg',
    '/img/2.jpg',
    '/img/2_300.jpg',
    '/img/2_400.jpg',
    '/img/2_600.jpg',
    '/img/3.jpg',
    '/img/3_300.jpg',
    '/img/3_400.jpg',
    '/img/3_600.jpg',
    '/img/4.jpg',
    '/img/4_300.jpg',
    '/img/4_400.jpg',
    '/img/4_600.jpg',
    '/img/5.jpg',
    '/img/5_300.jpg',
    '/img/5_400.jpg',
    '/img/5_600.jpg',
    '/img/6.jpg',
    '/img/6_300.jpg',
    '/img/6_400.jpg',
    '/img/6_600.jpg',
    '/img/7.jpg',
    '/img/7_300.jpg',
    '/img/7_400.jpg',
    '/img/7_600.jpg',
    '/img/8.jpg',
    '/img/8_300.jpg',
    '/img/8_400.jpg',
    '/img/8_600.jpg',
    '/img/9.jpg',
    '/img/9_300.jpg',
    '/img/9_400.jpg',
    '/img/9_600.jpg',
    '/img/10.jpg',
    '/img/10_300.jpg',
    '/img/10_400.jpg',
    '/img/10_600.jpg'
];

const allCaches = [
    ...pageUrls,
    ...scriptUrls,
    ...dataUrls,
    ...stylesUrls,
    ...imgsUrls
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            console.log('Cache oppend for install')
            return cache.addAll(allCaches);
        })
    );
});

// Delete resources from the cache that is not longer needed.
self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(
        keys.map(key => {
          if (!staticCacheName.includes(key)) {
            return caches.delete(key);
          }
        })
      )).then(() => {
        console.log(staticCacheName[0] +' now ready to handle fetches!');
      })
    );
  });

self.addEventListener('fetch', function (event) {

    if (event.request.url.startsWith('https://maps.googleapis.com/')) {
        event.respondWith(serveGoogleMap(event));
        return;
      }

    event.respondWith(
        caches.match(event.request, { 'ignoreSearch': true }).then(async response => {
            if(response) return response;
          
            let networkFetchRequest = event.request.clone();
            return await fetch(networkFetchRequest).then(response =>{
                if(!response) return response;
                let cacheResponse = response.clone();
                caches.open(staticCacheName).then(cache=>{
                    cache.put(event.request, cacheResponse);
                });
                return response;
            });
        })
            .catch(err => console.log(err, event.request))
    );
});



self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    this.console.log('Skip waiting');
    }
});

function serveGoogleMap(event){
  return caches.match(event.request).then(async response => {
        if(response) return response;
        
        let networkFetchRequest = event.request.clone();
        return await fetch(networkFetchRequest).then(response =>{
            if(!response) return response;
            let cacheResponse = response.clone();
            caches.open(staticCacheName).then(cache=>{
                cache.put(event.request, cacheResponse);
            });
            return response;
        });
    })
        .catch((err) =>{ 
            console.log(err, event.request);
        })
}
