import './preview.css';
import { documentSource } from '../../document-source.js';

document.querySelector('#main').outerHTML = documentSource;

// on message from parent window
window.addEventListener('message', (event) => {
    console.log('Message received from parent:', event);
    const message = event.data; // The JSON data our parent sent
    switch (message.type) {
        case 'SELECTOR':
            console.log('Selector received:', message.payload);
            const element = document.querySelector(message.payload);
            selectElement(element);
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            break;
    }
});

function selectElement(element) {
    deselectAll();
    element.setAttribute('rr-selected', 'rr-selected');
}

function deselectElement(element) {
    element.removeAttribute('rr-selected');
}

function deselectAll() {
    const selected = document.querySelectorAll('[rr-selected]');
    selected.forEach(element => {
        deselectElement(element);
    });
}
