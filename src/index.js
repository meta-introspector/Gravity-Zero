import { Game } from './main.js';

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Add CSS animations for UI effects
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
        
        #ui {
            animation: fadeIn 2s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🚀 Gravity Zero initialized');
    console.log('Controls: WASD/Arrow Keys to move, Space to brake, F to fire');
});