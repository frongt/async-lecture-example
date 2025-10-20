const worker = new Worker('./worker.js');

worker.onmessage= (e) => {
    console.log('Main received message:', e.data);
}

worker.postMessage('Hello, Worker!');


