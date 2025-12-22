import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Track {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.shieldStrips = [];
        this.ammoPickups = [];
        
        this.createTrack();
        this.createShieldStrips();
        this.createAmmoPickups();
    }

    createTrack() {
        // Main track surface
        const trackGeometry = new THREE.PlaneGeometry(200, 400);
        const trackMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            transparent: true,
            opacity: 0.9
        });
        
        this.trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
        this.trackMesh.rotation.x = -Math.PI / 2;
        this.trackMesh.receiveShadow = true;
        this.scene.add(this.trackMesh);
        
        // Track physics
        const trackShape = new CANNON.Plane();
        this.trackBody = new CANNON.Body({
            mass: 0,
            material: this.physicsWorld.trackMaterial
        });
        this.trackBody.addShape(trackShape);
        this.trackBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physicsWorld.addBody(this.trackBody);
        
        // Track boundaries
        this.createBoundaries();
        
        // Cyberpunk grid lines
        this.createGridLines();
    }

    createBoundaries() {
        const boundaryMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0066,
            emissive: 0x330011,
            transparent: true,
            opacity: 0.8
        });
        
        // Side barriers
        for (let i = 0; i < 2; i++) {
            const barrierGeometry = new THREE.BoxGeometry(2, 5, 400);
            const barrier = new THREE.Mesh(barrierGeometry, boundaryMaterial);
            barrier.position.set(i === 0 ? -101 : 101, 2.5, 0);
            this.scene.add(barrier);
            
            // Physics barrier
            const barrierShape = new CANNON.Box(new CANNON.Vec3(1, 2.5, 200));
            const barrierBody = new CANNON.Body({ mass: 0 });
            barrierBody.addShape(barrierShape);
            barrierBody.position.set(i === 0 ? -101 : 101, 2.5, 0);
            this.physicsWorld.addBody(barrierBody);
        }
    }

    createGridLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        
        // Vertical lines
        for (let x = -90; x <= 90; x += 20) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, 0.1, -200),
                new THREE.Vector3(x, 0.1, 200)
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
        }
        
        // Horizontal lines
        for (let z = -180; z <= 180; z += 40) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-100, 0.1, z),
                new THREE.Vector3(100, 0.1, z)
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
        }
    }

    createShieldStrips() {
        // Red shield recharge strips
        const stripMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0x660000,
            transparent: true,
            opacity: 0.8
        });
        
        const positions = [
            { x: -40, z: -100 },
            { x: 40, z: -50 },
            { x: -30, z: 0 },
            { x: 50, z: 50 },
            { x: -50, z: 100 }
        ];
        
        positions.forEach((pos, index) => {
            const stripGeometry = new THREE.PlaneGeometry(15, 30);
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            strip.rotation.x = -Math.PI / 2;
            strip.position.set(pos.x, 0.2, pos.z);
            this.scene.add(strip);
            
            // Physics trigger
            const stripShape = new CANNON.Box(new CANNON.Vec3(7.5, 0.1, 15));
            const stripBody = new CANNON.Body({
                mass: 0,
                isTrigger: true,
                material: this.physicsWorld.shieldMaterial
            });
            stripBody.addShape(stripShape);
            stripBody.position.set(pos.x, 0.2, pos.z);
            stripBody.userData = { type: 'shield', rechargeRate: 2 };
            this.physicsWorld.addBody(stripBody);
            
            this.shieldStrips.push({
                mesh: strip,
                body: stripBody,
                active: true
            });
        });
    }

    createAmmoPickups() {
        // Ammo reload pickups
        const ammoMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0x666600,
            transparent: true,
            opacity: 0.9
        });
        
        const positions = [
            { x: -60, z: -150 },
            { x: 60, z: -75 },
            { x: 0, z: -25 },
            { x: -70, z: 75 },
            { x: 70, z: 150 }
        ];
        
        positions.forEach((pos, index) => {
            const ammoGeometry = new THREE.BoxGeometry(3, 3, 3);
            const ammo = new THREE.Mesh(ammoGeometry, ammoMaterial);
            ammo.position.set(pos.x, 1.5, pos.z);
            this.scene.add(ammo);
            
            // Rotating animation
            ammo.userData = { rotationSpeed: 0.02 };
            
            // Physics trigger
            const ammoShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5));
            const ammoBody = new CANNON.Body({
                mass: 0,
                isTrigger: true,
                material: this.physicsWorld.ammoMaterial
            });
            ammoBody.addShape(ammoShape);
            ammoBody.position.set(pos.x, 1.5, pos.z);
            ammoBody.userData = { type: 'ammo', reloadAmount: 25 };
            this.physicsWorld.addBody(ammoBody);
            
            this.ammoPickups.push({
                mesh: ammo,
                body: ammoBody,
                active: true
            });
        });
    }

    update() {
        // Animate ammo pickups
        this.ammoPickups.forEach(pickup => {
            if (pickup.active) {
                pickup.mesh.rotation.y += pickup.mesh.userData.rotationSpeed;
                pickup.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.3;
            }
        });
        
        // Animate shield strips
        this.shieldStrips.forEach(strip => {
            if (strip.active) {
                const intensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
                strip.mesh.material.opacity = intensity;
            }
        });
    }
}