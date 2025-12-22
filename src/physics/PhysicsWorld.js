import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        
        // Enhanced physics for realistic hover mechanics
        this.world.solver.iterations = 10;
        this.world.solver.tolerance = 0.0001;
        
        // Materials for different surface interactions
        this.setupMaterials();
    }

    setupMaterials() {
        // Vehicle material - low friction for drifting
        this.vehicleMaterial = new CANNON.Material('vehicle');
        
        // Track material
        this.trackMaterial = new CANNON.Material('track');
        
        // Shield strip material
        this.shieldMaterial = new CANNON.Material('shield');
        
        // Ammo pickup material
        this.ammoMaterial = new CANNON.Material('ammo');
        
        // Contact materials for realistic physics interactions
        const vehicleTrackContact = new CANNON.ContactMaterial(
            this.vehicleMaterial,
            this.trackMaterial,
            {
                friction: 0.3,
                restitution: 0.1,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3
            }
        );
        
        this.world.addContactMaterial(vehicleTrackContact);
    }

    step() {
        this.world.fixedStep(1/60, 1/60, 3);
    }

    addBody(body) {
        this.world.addBody(body);
    }

    removeBody(body) {
        this.world.removeBody(body);
    }
}