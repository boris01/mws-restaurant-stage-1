const staticCacheName = 'restaurant-static-v1';

const pageUrls = [
    '/',
    '/index.html',
    '/restaurant.html'
];
const scriptUrls = [
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js'
];
const dataUrls = ['./data/restaurants.json'];
const stylesUrls = [
    '/css/styles.css',
    '/css/responsive.css'
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


// Delete resources from the cache that is not longer needed (removed from the )
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('restaurant-') &&
                        !allCaches.includes(cacheName);
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// self.addEventListener('activate',  event => {
//     event.waitUntil(self.clients.claim());
//   });


self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request, {'ignoreSearch': true}).then(function (response) {
            return response || fetch(event.request);
        })
        .catch(err => console.log(err, event.request))
    );
});

