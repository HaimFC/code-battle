import Editor from "@monaco-editor/react";

function CodeEditor({ code, setCode }) {
  return (
    <Editor
      defaultLanguage="javascript"
      value={code}
      onChange={(value) => setCode(value)}
      theme="vs-dark"
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true
      }}
    />
  );
}

export default CodeEditor;