// holds React Router setup and wraps everything with Context Providers (Auth, Battle).

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import './App.css'
import CodeEditor from './components/CodeEditor';
import ProfileImage from './components/ProfileImage';


function App() {
  return (
    <>
      <MantineProvider>
        <CodeEditor/>
        <ProfileImage/>
        </MantineProvider>
    </>
  )
}

export default App
