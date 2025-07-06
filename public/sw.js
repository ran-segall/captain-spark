// Service Worker for video caching
const CACHE_NAME = 'captain-spark-video-cache-v1';
const VIDEO_CACHE_NAME = 'captain-spark-videos-v1';

// Initial videos to cache (you can expand this list)
const urlsToCache = [
  '/videos/onboarding/Onboarding-1-HB.mp4'
];

// Install event - cache video files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VIDEO_CACHE_NAME)
      .then((cache) => {
        console.log('Caching video files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Failed to cache videos:', error);
      })
  );
});

// Fetch event - serve cached videos when available
self.addEventListener('fetch', (event) => {
  // Only handle video requests
  if (event.request.url.includes('/videos/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            console.log('Serving cached video:', event.request.url);
            return response;
          }
          
          // Otherwise fetch from network
          console.log('Fetching video from network:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // Cache the response for future use
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(VIDEO_CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                    console.log('Cached new video:', event.request.url);
                  });
              }
              return response;
            });
        })
        .catch(() => {
          // If both cache and network fail, return a fallback
          console.log('Video fetch failed:', event.request.url);
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== VIDEO_CACHE_NAME && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event - handle cache management from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    const { videoUrl } = event.data;
    
    caches.open(VIDEO_CACHE_NAME)
      .then((cache) => {
        return fetch(videoUrl)
          .then((response) => {
            if (response.status === 200) {
              return cache.put(videoUrl, response);
            }
          });
      })
      .then(() => {
        console.log('Manually cached video:', videoUrl);
      })
      .catch((error) => {
        console.log('Failed to manually cache video:', videoUrl, error);
      });
  }
}); 