const cache = new Map();

async function fetchWithTTL(url, ttl = 3000) {
    const now = Date.now();
    const cached = cache.get(url);

    if(cached && now - cached.timestamp < ttl) {
        console.log('cache hit');
        return cached.data;
    }

    console.log('cache miss');
    const res = await fetch(url);
    const data = await res.json();
    cache.set(url, {data, timestamp: now});

    return data;
}

fetchWithTTL("https://jsonplaceholder.typicode.com/posts/1", 3000)
    .then(data => console.log(data))
    .catch(error => console.error(error));


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

delay(2000).then(() => {
    fetchWithTTL('https://jsonplaceholder.typicode.com/posts/1')
        .then(data => console.log(data))
        .catch(error => console.error(error));
});


delay(5000).then(() => {
    fetchWithTTL('https://jsonplaceholder.typicode.com/posts/1')
        .then(data => console.log(data))
        .catch(error => console.error(error));
});

delay(6000).then(() => {
    fetchWithTTL('https://jsonplaceholder.typicode.com/posts/1')
        .then(data => console.log(data))
        .catch(error => console.error(error));
});
