import './style.scss';
import * as monaco from 'monaco-editor';
import { documentSource } from './document-source';
import * as parse5 from 'parse5';

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
});

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

const ast = parse5.parse(documentSource, { sourceCodeLocationInfo: true });

function isPositionInsideElement(startLine, startCol, endLine, endCol, targetLine, targetCol) {
    if (targetLine < startLine || targetLine > endLine) {
        // Если строка находится за пределами диапазона, то позиция не находится внутри элемента
        return false;
    }

    if (targetLine === startLine && targetLine === endLine) {
        // Если позиция находится на одной строке с началом и концом элемента,
        // то позиция находится внутри элемента, только если она находится
        // внутри диапазона между началом и концом элемента по колонкам
        return targetCol >= startCol && targetCol <= endCol;
    }

    if (targetLine === startLine) {
        // Если позиция находится на строке начала элемента,
        // то позиция находится внутри элемента, только если ее колонка больше или равна
        // колонке начала элемента
        return targetCol >= startCol;
    }

    if (targetLine === endLine) {
        // Если позиция находится на строке конца элемента,
        // то позиция находится внутри элемента, только если ее колонка меньше или равна
        // колонке конца элемента
        return targetCol <= endCol;
    }

    // Если позиция находится между строкой начала и строкой конца элемента,
    // то позиция находится внутри элемента, независимо от колонки
    return true;
}

// function getElementByLineAndColumn(lineNumber, columnNumber) {
//     // Проходимся по AST, ищем элемент с заданными координатами
//     function findElement(node) {
//         if (node.childNodes) {
//             for (let i = 0; i < node.childNodes.length; i++) {
//                 const childNode = node.childNodes[i];

//                 if (childNode.sourceCodeLocation) {
//                     const startLine = childNode.sourceCodeLocation.startLine;
//                     const startCol = childNode.sourceCodeLocation.startCol;
//                     const endLine = childNode.sourceCodeLocation.endLine;
//                     const endCol = childNode.sourceCodeLocation.endCol;

//                     if (isPositionInsideElement(startLine, startCol, endLine, endCol, lineNumber, columnNumber)) {
//                         return childNode;
//                     }

//                     // Если элемент содержит другие элементы, ищем среди них
//                     const found = findElement(childNode);
//                     if (found) {
//                         return found;
//                     }
//                 }
//             }
//         }
//         return null;
//     }

//     const elementNode = findElement(ast);

//     if (elementNode) {
//         console.log('Element found:', elementNode.nodeName);
//         console.log('Start line:', elementNode.sourceCodeLocation.startLine);
//         console.log('Start column:', elementNode.sourceCodeLocation.startCol);
//         console.log('End line:', elementNode.sourceCodeLocation.endLine);
//         console.log('End column:', elementNode.sourceCodeLocation.endCol);
//     } else {
//         console.log('Element not found');
//     }
// }

// // Поиск элемента по номеру строки и столбца
// getElementByLineAndColumn(429, 28);

function findNodeFromLeavesToRoot(node, line, column) {
    if (node.nodeName === '#text' || node.nodeName === '#comment') {
        return null;
    }

    if (node.childNodes) {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const child = node.childNodes[i];
            const result = findNodeFromLeavesToRoot(child, line, column);
            if (result) {
                return result;
            }
        }
    }
    const location = node.sourceCodeLocation;
    if (isPositionInsideElement(location.startLine, location.startCol, location.endLine, location.endCol, line, column)) {
        return node;
    }
    return null;
}

function getElementByLineAndColumn(line, column) {
    return findNodeFromLeavesToRoot(ast, line, column);
}

// function getCssSelector(element) {
//     // Функция для получения тега с идентификатором или классом
//     function getTagIdentifier(node) {
//         let id = "";
//         let classNames = [];
//         let index = 1;
//         let siblings = node.parentNode ? node.parentNode.childNodes : [];

//         if (node.attrs) {
//             for (const attr of node.attrs) {
//                 if (attr.name === "id") {
//                     id = "#" + attr.value;
//                 } else if (attr.name === "class") {
//                     classNames = attr.value.split(" ").map(name => "." + name);
//                 }
//             }
//         }

//         if (siblings && siblings.length > 0) {
//             console.log(siblings);
//             for (let i = 0; i < siblings.length; i++) {
//                 const sibling = siblings[i];
//                 if (sibling === node) {
//                     break;
//                 } else if (sibling.tagName === node.tagName) {
//                     index++;
//                 }
//             }
//         }

//         if (index === 1) {
//             return node.tagName + id + classNames.join("");
//         } else {
//             return node.tagName + id + classNames.join("") + `:nth-child(${index})`;
//         }
//     }

//     let selector = getTagIdentifier(element);

//     // Получаем родительский узел элемента
//     let parent = element.parentNode;

//     // Пока не достигнуто начало документа, повторяем
//     while (parent.tagName !== "html") {
//         selector = getTagIdentifier(parent) + " > " + selector;
//         parent = parent.parentNode;
//     }

//     return selector;
// }

function getCssSelector(node) {
    const path = [];
    let current = node;

    // Loop through the node's ancestors and collect tag names and class names
    while (current && current.tagName) {
        const tagName = current.tagName;
        const classes = (current.attrs || []).filter(attr => attr.name === 'class').map(attr => attr.value);

        // If there are no classes, add just the tag name to the path
        if (!classes.length) {
            path.unshift(tagName);
        } else {
            // If there are classes, add the tag name and the classes to the path
            const classString = classes.map(s => s.split(' ').map(x => x.trim()).join('.')).join('.');
            path.unshift(`${tagName}.${classString}`);
        }

        current = current.parentNode;
    }

    // Join all the tags and classes to form the selector
    return path.join(' > ');
}

function selectElement(line, column) {
    const foundElement = getElementByLineAndColumn(line, column);
    console.log('Element found:', foundElement);
    const selector = getCssSelector(foundElement);
    console.log('Element selector:', selector);

    const preview = document.getElementById('preview');
    // post message to preview iframe
    preview.contentWindow.postMessage({
        type: 'SELECTOR',
        payload: selector,
    }, '*');
}

editor.onMouseUp((evt) => {
    if (evt.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT
        || evt.target.type === monaco.editor.MouseTargetType.CONTENT_EMPTY) {
        const position = editor.getPosition();
        selectElement(position.lineNumber, position.column);
    }
});
