export class UI {
    constructor() {
        this.shieldBar = document.querySelector('.shield-bar');
        this.hullBar = document.querySelector('.hull-bar');
        this.ammoBar = document.querySelector('.ammo-bar');
    }

    update(stats) {
        this.shieldBar.style.width = `${stats.shields}%`;
        this.hullBar.style.width = `${stats.hull}%`;
        this.ammoBar.style.width = `${stats.ammo}%`;
        
        // Add warning effects for low values
        this.updateWarningEffects(stats);
    }

    updateWarningEffects(stats) {
        // Shield warning
        if (stats.shields < 25) {
            this.shieldBar.style.animation = 'blink 0.5s infinite';
        } else {
            this.shieldBar.style.animation = 'none';
        }
        
        // Hull critical warning
        if (stats.hull < 25) {
            this.hullBar.style.animation = 'blink 0.3s infinite';
            document.body.style.filter = 'hue-rotate(0deg) saturate(1.5)';
        } else {
            this.hullBar.style.animation = 'none';
            document.body.style.filter = 'none';
        }
        
        // Ammo low warning
        if (stats.ammo < 20) {
            this.ammoBar.style.animation = 'blink 0.7s infinite';
        } else {
            this.ammoBar.style.animation = 'none';
        }
    }
}