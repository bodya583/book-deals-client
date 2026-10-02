import { useState } from 'react'
import './App.css'

function App() {
  const [data, setText] = useState<Array<{id: Number, text: String, createdAt: Date}>>();
  const [input, setInput] = useState("type here...");

  async function handleOnClick(){
    const response = await fetch("/api/text")
    if(!response.ok){
      console.log(response.ok)
      return
    }
    const data = await response.json()
    setText(data ?? []);
  }

  async function createText(){
    await fetch("api/text", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({value: input})
    })
  }

  return (
    <>
      <section id="center">
        {data?.length != 0
          ?
          <li>
            {data?.map(obj => 
              <ol id={obj.id.toString()}>
                <h6 color='white'>{`id: ${obj.id} | ${obj.text} | ${obj.createdAt}`}</h6>
              </ol>
            )}
          </li>
          :
          'No data'
        }
        <button title='fetch' onClick={() => handleOnClick()} style={{width: 100, height: 50}}/>
        <input type='text' onChange={(e) => setInput(e.target.value)} value={input}></input>
        <button title="create" onClick={createText} style={{width: 100, height: 50}}/>
      </section>
    </>
  )
}

export default App
