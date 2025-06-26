import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { waitWorkerReady } from './xinyin_main.js';

waitWorkerReady().then(() => {
  console.log('Worker is ready');
}).catch((error) => {
  console.error('waitWorkerReady catch:', error);
});

@customElement('xinyin-app')
export class XinyinApp extends LitElement {
  static styles = css`
    .app-container {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
    }
  `;
  
  render() {
    return html`
      <div class="app-container">
        <h1>Xinyin App</h1>
        <p>Welcome to the Xinyin application!</p>
      </div>
    `;
  }
}