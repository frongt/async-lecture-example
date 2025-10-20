const cache = new Map();

const FRESH_TTL = 5000;            
const STALE_WHILE_REVALIDATE = 5000;
const TOTAL_TTL = FRESH_TTL + STALE_WHILE_REVALIDATE;

async function fetchWithSWR(url) {
  const now = Date.now();
  const cached = cache.get(url);

  // 캐시 없음 → 바로 네트워크
  if (!cached) {
    console.log('miss -> fetch & cache');
    return await fetchAndCache(url);
  }

  const gap = now - cached.timestamp;

  if (gap <= FRESH_TTL) {
    console.log('fresh -> use cache');
    return cached.data;
  }

  if (gap <= TOTAL_TTL) {
    console.log('stale -> return cache & revalidate in background');
    // 백그라운드 재검증 (대기하지 않음)
    fetchAndCache(url).catch(() => {});
    return cached.data;
  }

  console.log('expired -> force refresh (await network)');
  // 완전 만료 → 네트워크 응답을 기다림
  return await fetchAndCache(url);
}

async function fetchAndCache(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

const delay = (time) => new Promise( (resolve)=> setTimeout(resolve, time));


// 사용 예시
fetchWithSWR('https://jsonplaceholder.typicode.com/posts/1')
  .then(console.log)
  .catch(console.error);

delay(3000).then(() => {
    fetchWithSWR('https://jsonplaceholder.typicode.com/posts/1')
      .then(console.log)
      .catch(console.error);
});

delay(9000).then(() => {
    fetchWithSWR('https://jsonplaceholder.typicode.com/posts/1')
      .then(console.log)
      .catch(console.error);
});
