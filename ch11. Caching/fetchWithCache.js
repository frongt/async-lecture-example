/*

1. 캐시가 있는지 확인 
2. 캐시가 없으면 서버로 전송
3. 캐시가 있으면 캐시를 사용해서 응답
*/

const cache = new Map();

async function fetchWithCache(url, options) {
    if (cache.has(url)) {
        console.log('cache hit');
        return cache.get(url);
    }
    console.log('cache miss');
    const res = await fetch(url, options);
    const data = await res.json();
    cache.set(url, data);
    return data;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

fetchWithCache('https://jsonplaceholder.typicode.com/posts/1')
    .then(data => console.log(data))
    .catch(error => console.error(error));


delay(1000).then(() => {
    fetchWithCache('https://jsonplaceholder.typicode.com/posts/1')
        .then(data => console.log(data))
        .catch(error => console.error(error));
});

delay(1000).then(() => {
    fetchWithCache('https://jsonplaceholder.typicode.com/posts/1')
        .then(data => console.log(data))
        .catch(error => console.error(error));
});

delay(1000).then(() => {
    fetchWithCache('https://jsonplaceholder.typicode.com/posts/1')
        .then(data => console.log(data))
        .catch(error => console.error(error));
});




























































