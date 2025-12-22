import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Vehicle } from './entities/Vehicle.js';
import { Track } from './entities/Track.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { InputManager } from './systems/InputManager.js';
import { UI } from './systems/UI.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.physicsWorld = new PhysicsWorld();
        this.inputManager = new InputManager();
        this.ui = new UI();
        
        this.vehicle = null;
        this.track = null;
        
        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x0a0a0a);
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);

        // Cyberpunk lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Neon rim lighting
        const rimLight = new THREE.DirectionalLight(0xff00ff, 0.5);
        rimLight.position.set(-50, 50, -50);
        this.scene.add(rimLight);

        // Initialize game objects
        this.track = new Track(this.scene, this.physicsWorld);
        this.vehicle = new Vehicle(this.scene, this.physicsWorld, this.inputManager);
        
        // Camera follow setup
        this.camera.position.set(0, 15, 20);
        this.camera.lookAt(0, 0, 0);
        
        // Start game loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update physics
        this.physicsWorld.step();
        
        // Update vehicle
        this.vehicle.update();
        
        // Update track
        this.track.update();
        
        // Update camera to follow vehicle
        this.updateCamera();
        
        // Update UI
        this.ui.update(this.vehicle.getStats());
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateCamera() {
        if (this.vehicle) {
            const vehiclePos = this.vehicle.getPosition();
            const vehicleRot = this.vehicle.getRotation();
            
            // Camera follows behind and above the vehicle
            const offset = new THREE.Vector3(0, 8, 15);
            offset.applyQuaternion(vehicleRot);
            
            this.camera.position.lerp(vehiclePos.clone().add(offset), 0.1);
            this.camera.lookAt(vehiclePos);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the game
const game = new Game();