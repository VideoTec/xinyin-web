
self.addEventListener("fetch", (event: FetchEvent) => {
    console.log("Fetch event for ", event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse: Response | undefined) => {
            return cachedResponse || fetch(event.request);
        })
    );
});