
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Editor from './components/Editor' 
import PreviewPage from './plugins/Preview'
import Home from './components/Home'
import EditorWrapper from './components/EditorWrapper'
function App() {
  
  return (
    <>
    <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/editor" element={<Editor />} />
       <Route path="/editor/:id" element={<EditorWrapper />} />
         <Route path="/preview" element={<PreviewPage/>} />
       
    </Routes>
    
    </>
  )
}

export default App
