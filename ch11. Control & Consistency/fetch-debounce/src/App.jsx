import { useState, useRef } from "react";

export default function App() {
  const [title, setTitle] = useState();
  const timerRef = useRef(null);

  function inputChangeHandler(e) {
    const todoNum = +e.target.value;

    if(timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const stID = setTimeout(() => {
    fetch(`https://jsonplaceholder.typicode.com/todos/${todoNum}`)
      .then((res) => res.json())
      .then((result) => setTitle(result.title));
    }, 500);

    timerRef.current = stID;
  }

  return (
    <div className="App">
      <input type="text" onChange={inputChangeHandler}></input>
      <div>title : {title} </div>
    </div>
  );
}
