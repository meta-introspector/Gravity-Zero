import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Vehicle {
    constructor(scene, physicsWorld, inputManager) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.inputManager = inputManager;
        
        // Vehicle stats
        this.shields = 100;
        this.hull = 100;
        this.ammo = 100;
        this.maxSpeed = 80;
        this.hoverHeight = 2.5;
        
        // Physics properties
        this.thrustForce = 1500;
        this.turnForce = 800;
        this.driftFactor = 0.85;
        this.antiGravityForce = 2000;
        
        this.createVehicle();
        this.setupPhysics();
    }

    createVehicle() {
        // Cyberpunk vehicle geometry
        const bodyGeometry = new THREE.BoxGeometry(4, 1, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            emissive: 0x0f0f23,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Neon accents
        const accentGeometry = new THREE.BoxGeometry(4.2, 0.1, 8.2);
        const accentMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        const accent = new THREE.Mesh(accentGeometry, accentMaterial);
        accent.position.y = 0.5;
        this.mesh.add(accent);
        
        // Hover thrusters
        for (let i = 0; i < 4; i++) {
            const thrusterGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 8);
            const thrusterMaterial = new THREE.MeshPhongMaterial({
                color: 0x333366,
                emissive: 0x0066ff,
                emissiveIntensity: 0.5
            });
            
            const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
            thruster.position.set(
                i % 2 === 0 ? -1.5 : 1.5,
                -0.8,
                i < 2 ? 2.5 : -2.5
            );
            this.mesh.add(thruster);
        }
        
        this.scene.add(this.mesh);
    }

    setupPhysics() {
        // Physics body
        const shape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 4));
        this.body = new CANNON.Body({
            mass: 1200,
            material: this.physicsWorld.vehicleMaterial
        });
        this.body.addShape(shape);
        this.body.position.set(0, 5, 0);
        
        // Prevent flipping
        this.body.linearDamping = 0.1;
        this.body.angularDamping = 0.3;
        
        this.physicsWorld.addBody(this.body);
    }

    update() {
        const input = this.inputManager.getInput();
        
        // Anti-gravity hover mechanics
        this.applyAntiGravity();
        
        // Movement controls
        if (input.forward) {
            const force = new CANNON.Vec3(0, 0, -this.thrustForce);
            force.applyQuaternion(this.body.quaternion);
            this.body.applyLocalForce(force);
        }
        
        if (input.backward) {
            const force = new CANNON.Vec3(0, 0, this.thrustForce * 0.6);
            force.applyQuaternion(this.body.quaternion);
            this.body.applyLocalForce(force);
        }
        
        // Drift-style turning
        if (input.left || input.right) {
            const turnDirection = input.left ? 1 : -1;
            const speed = this.body.velocity.length();
            const turnIntensity = Math.min(speed / this.maxSpeed, 1);
            
            // Apply torque for turning
            this.body.applyLocalTorque(new CANNON.Vec3(0, turnDirection * this.turnForce * turnIntensity, 0));
            
            // Drift mechanics - reduce lateral grip
            const lateralVelocity = this.getLateralVelocity();
            const driftForce = lateralVelocity.scale(-this.driftFactor * speed * 0.1);
            this.body.applyForce(driftForce);
        }
        
        // Sync visual mesh with physics body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        
        // Speed limiting
        const velocity = this.body.velocity;
        if (velocity.length() > this.maxSpeed) {
            velocity.normalize();
            velocity.scale(this.maxSpeed, velocity);
        }
    }

    applyAntiGravity() {
        // Raycast downward to maintain hover height
        const rayStart = this.body.position.clone();
        const rayEnd = rayStart.clone();
        rayEnd.y -= this.hoverHeight + 2;
        
        const result = new CANNON.RaycastResult();
        this.physicsWorld.world.raycastClosest(rayStart, rayEnd, {}, result);
        
        if (result.hasHit) {
            const distance = result.distance;
            const hoverForce = Math.max(0, (this.hoverHeight - distance) * this.antiGravityForce);
            this.body.applyForce(new CANNON.Vec3(0, hoverForce, 0));
        }
    }

    getLateralVelocity() {
        const forward = new CANNON.Vec3(0, 0, -1);
        forward.applyQuaternion(this.body.quaternion);
        
        const right = new CANNON.Vec3(1, 0, 0);
        right.applyQuaternion(this.body.quaternion);
        
        const lateralSpeed = this.body.velocity.dot(right);
        return right.scale(lateralSpeed);
    }

    takeDamage(amount) {
        if (this.shields > 0) {
            this.shields = Math.max(0, this.shields - amount);
        } else {
            this.hull = Math.max(0, this.hull - amount);
        }
    }

    rechargeShields(amount) {
        this.shields = Math.min(100, this.shields + amount);
    }

    reloadAmmo(amount) {
        this.ammo = Math.min(100, this.ammo + amount);
    }

    getStats() {
        return {
            shields: this.shields,
            hull: this.hull,
            ammo: this.ammo
        };
    }

    getPosition() {
        return new THREE.Vector3().copy(this.body.position);
    }

    getRotation() {
        return new THREE.Quaternion().copy(this.body.quaternion);
    }
}