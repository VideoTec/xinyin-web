import { useState } from 'react'
import Button from '@mui/material/Button';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello React!</h1>
      <p>你点击了 {count} 次。</p>
      <Button variant="outlined" onClick={() => setCount(count + 1)}>点击我</Button>
    </div>
  )
}

export default App