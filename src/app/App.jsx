import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <p>haha puceau, moi ?</p>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-500">Hello, Tailwind CSS!</h1>
      <p className="mt-4 text-lg text-gray-700">
        Tailwind CSS is successfully set up!
      </p>
    </div>
    </>
  )
}

export default App