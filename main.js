import './style.scss'
import * as monaco from 'monaco-editor';
import { documentSource } from './document-source';

const editor = monaco.editor.create(
    document.getElementById('editor-container'),
    {
        value: documentSource,
        language: 'html',
    });

editor.onDidChangeCursorPosition((evt) => {
    const position = evt.position;
    document.getElementById('currentPositionLine').value = position.lineNumber;
    document.getElementById('currentPositionColumn').value = position.column;
})

const editorPositionForm = document.getElementById('editorPositionForm');
editorPositionForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    editor.setSelection({
        startColumn: parseInt(editorPositionForm.elements.startColumn.value),
        endColumn: parseInt(editorPositionForm.elements.endColumn.value),
        startLineNumber: parseInt(editorPositionForm.elements.startLineNumber.value),
        endLineNumber: parseInt(editorPositionForm.elements.endLineNumber.value),
    });
});

const preview = document.getElementById('preview');
preview.srcdoc = documentSource;
