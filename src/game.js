// Gravity Zero - Anti-Gravity Racing Game
class GravityZero {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        
        this.keys = {};
        this.vehicle = null;
        this.stats = { shields: 100, hull: 100, ammo: 100 };
        
        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor(0x0a0a0a);
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);

        // Create track
        this.createTrack();
        
        // Create vehicle
        this.createVehicle();
        
        // Camera position
        this.camera.position.set(0, 15, 20);
        
        // Input handling
        this.setupInput();
        
        // Start game loop
        this.animate();
    }

    createTrack() {
        // Main track
        const trackGeometry = new THREE.PlaneGeometry(200, 400);
        const trackMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
        const track = new THREE.Mesh(trackGeometry, trackMaterial);
        track.rotation.x = -Math.PI / 2;
        this.scene.add(track);

        // Track physics
        const trackShape = new CANNON.Plane();
        const trackBody = new CANNON.Body({ mass: 0 });
        trackBody.addShape(trackShape);
        trackBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(trackBody);

        // Shield strips
        for (let i = 0; i < 5; i++) {
            const stripGeometry = new THREE.PlaneGeometry(15, 30);
            const stripMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff0000, 
                transparent: true, 
                opacity: 0.8 
            });
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            strip.rotation.x = -Math.PI / 2;
            strip.position.set((i - 2) * 40, 0.1, (i - 2) * 50);
            this.scene.add(strip);
        }

        // Grid lines
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.3 
        });
        
        for (let x = -90; x <= 90; x += 20) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, 0.1, -200),
                new THREE.Vector3(x, 0.1, 200)
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
        }
    }

    createVehicle() {
        // Vehicle mesh
        const bodyGeometry = new THREE.BoxGeometry(4, 1, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            emissive: 0x0f0f23
        });
        
        this.vehicleMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.vehicleMesh.position.set(0, 5, 0);
        this.scene.add(this.vehicleMesh);

        // Neon accent
        const accentGeometry = new THREE.BoxGeometry(4.2, 0.1, 8.2);
        const accentMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const accent = new THREE.Mesh(accentGeometry, accentMaterial);
        accent.position.y = 0.5;
        this.vehicleMesh.add(accent);

        // Physics body
        const shape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 4));
        this.vehicleBody = new CANNON.Body({ mass: 1200 });
        this.vehicleBody.addShape(shape);
        this.vehicleBody.position.set(0, 5, 0);
        this.vehicleBody.linearDamping = 0.1;
        this.vehicleBody.angularDamping = 0.3;
        this.world.add(this.vehicleBody);
    }

    setupInput() {
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        
        // PS5 Controller support
        this.gamepad = null;
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepad = e.gamepad;
            console.log('🎮 PS5 Controller connected');
        });
    }

    updateVehicle() {
        const thrustForce = 1500;
        const turnForce = 800;
        const hoverForce = 2000;

        // Get controller input
        let forward = this.keys['KeyW'] || this.keys['ArrowUp'];
        let backward = this.keys['KeyS'] || this.keys['ArrowDown'];
        let left = this.keys['KeyA'] || this.keys['ArrowLeft'];
        let right = this.keys['KeyD'] || this.keys['ArrowRight'];
        
        if (this.gamepad) {
            const gp = navigator.getGamepads()[this.gamepad.index];
            if (gp) {
                // Right trigger (R2) = forward, Left trigger (L2) = backward
                forward = forward || gp.buttons[7].value > 0.1;
                backward = backward || gp.buttons[6].value > 0.1;
                
                // Left stick for steering
                const stickX = gp.axes[0];
                if (Math.abs(stickX) > 0.2) {
                    if (stickX < 0) left = true;
                    if (stickX > 0) right = true;
                }
            }
        }

        // Anti-gravity hover
        if (this.vehicleBody.position.y < 3) {
            this.vehicleBody.applyForce(new CANNON.Vec3(0, hoverForce, 0));
        }

        // Movement
        if (forward) {
            const force = new CANNON.Vec3(0, 0, -thrustForce);
            this.vehicleBody.applyLocalForce(force);
        }
        
        if (backward) {
            const force = new CANNON.Vec3(0, 0, thrustForce * 0.6);
            this.vehicleBody.applyLocalForce(force);
        }
        
        if (left) {
            this.vehicleBody.applyLocalTorque(new CANNON.Vec3(0, turnForce, 0));
        }
        
        if (right) {
            this.vehicleBody.applyLocalTorque(new CANNON.Vec3(0, -turnForce, 0));
        }

        // Sync mesh with physics
        this.vehicleMesh.position.copy(this.vehicleBody.position);
        this.vehicleMesh.quaternion.copy(this.vehicleBody.quaternion);
    }

    updateCamera() {
        const vehiclePos = this.vehicleBody.position;
        const offset = new THREE.Vector3(0, 8, 15);
        
        this.camera.position.lerp(
            new THREE.Vector3(vehiclePos.x + offset.x, vehiclePos.y + offset.y, vehiclePos.z + offset.z), 
            0.1
        );
        this.camera.lookAt(vehiclePos.x, vehiclePos.y, vehiclePos.z);
    }

    updateUI() {
        document.querySelector('.shield-bar').style.width = `${this.stats.shields}%`;
        document.querySelector('.hull-bar').style.width = `${this.stats.hull}%`;
        document.querySelector('.ammo-bar').style.width = `${this.stats.ammo}%`;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.world.step(1/60);
        this.updateVehicle();
        this.updateCamera();
        this.updateUI();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    new GravityZero();
    console.log('🚀 Gravity Zero loaded - Use WASD to control');
});