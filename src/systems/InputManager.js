export class InputManager {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
    }

    getInput() {
        return {
            forward: this.keys['KeyW'] || this.keys['ArrowUp'],
            backward: this.keys['KeyS'] || this.keys['ArrowDown'],
            left: this.keys['KeyA'] || this.keys['ArrowLeft'],
            right: this.keys['KeyD'] || this.keys['ArrowRight'],
            brake: this.keys['Space'],
            fire: this.keys['KeyF'] || this.keys['Enter']
        };
    }
}