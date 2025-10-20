const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, retryCount = 5, delay=1000) {
    for(let attempt = 0; attempt < retryCount; attempt++) {
        try {
            const res = await fetch(url);
            return await res.json();
        } catch (error) {
            if(attempt === retryCount -1 ) {
                throw error;
            }
            console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
            await wait(delay * 2 ** attempt);
        }
    }
}

fetchWithRetry('https://jsonpceholder.typicode.com/posts/1')
    .then(data => console.log(data))
    .catch(error => console.error(error));



