import { useState, useRef } from 'react'
import './App.css'

function App() {

  const [post, setPost] = useState();
  const controllerRef = useRef(null);

  const loadPost = (id) => {

    if(controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {signal: controller.signal})
    .then(response => response.json())
    .then(data => setPost(data))
    .catch(error => console.error('Error:', error));
  }

  return (
    <>
      <button onClick={() => loadPost(1)}>post 1</button>
      <button onClick={() => loadPost(2)}>post 2</button>
      {post && <div>{post.title}</div>}
    </>
  )
}

export default App
