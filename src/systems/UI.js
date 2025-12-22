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
        
        // Subtle warning effects
        if (stats.shields < 25) this.shieldBar.style.filter = 'brightness(1.5) saturate(2)';
        else this.shieldBar.style.filter = 'none';
        
        if (stats.hull < 25) this.hullBar.style.filter = 'brightness(1.5) saturate(2)';
        else this.hullBar.style.filter = 'none';
    }
}