import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello React!</h1>
      <p>你点击了 {count} 次。</p>
      <button onClick={() => setCount(count + 1)}>点击我</button>
    </div>
  )
}

export default App