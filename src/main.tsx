
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react';
import App from './App.tsx'
import './index.css'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure root element exists before rendering
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found! Make sure there is a div with id 'root' in your HTML.");
}
