// holds React Router setup and wraps everything with Context Providers (Auth, Battle).

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import './App.css'
import BattlePage from './pages/BattlePage';

const comp = true
const players = [{name:"Haim Cohen", status:"Coding..."},{name:"Shlomo Levi", status:"Coding..."}]
const question = {description: `/*
Create a function that takes two numbers and a mathematical operator + - / * and will perform a calculation with the given numbers.

Examples
calculator(2, "+", 2) âžž 4

calculator(2, "*", 2) âžž 4

calculator(4, "/", 2) âžž 2
Notes
If the input tries to divide by 0, return: "Can't divide by 0!"
*/
`, initialValue:`function calculator( /*args*/ ) {
  //your code
}

exports.solution = calculator;`}

function App() {
  return (
    <>
      <MantineProvider>
        <BattlePage comp={comp} players={players} question={question}/>
      </MantineProvider>
    </>
  )
}

export default App
