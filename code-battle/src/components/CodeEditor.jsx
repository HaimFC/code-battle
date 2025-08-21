// Editor where users write and run code (used in Practice & Battle)
import { Textarea } from '@mantine/core';

function CodeEditor({code, setCode}){
    return (
    <Textarea
        placeholder="Enter your code here..."
        value={code}
        onChange={(event) => setCode(event.currentTarget.value)}
        size="xl"
        styles={{
            input: {
            height: 500,
            fontSize: 18,
            width: 500
            },
        }}
        />
  );
}

export default CodeEditor;