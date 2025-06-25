import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

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