import * as THREE from 'three';
import Clock from './clock';

class Character {
	
	constructor(json) {
		this.loader = new THREE.JSONLoader();
		this.modelFile = this.loader.parse(json,'/model/');
		this.geometry = this.modelFile.geometry;
		this.material = this.modelFile.materials[0];
		this.material.skinning = true;
		this.mesh = new THREE.SkinnedMesh(
			this.geometry,
			this.material
		);
		this.mesh.castShadow = true;
		this.clock = new Clock(true);
		
		this.mixer = new THREE.AnimationMixer(this.mesh);
		
		this._attack = this.mixer.clipAction( this.geometry.animations[0] );
		this._attack.setLoop( THREE.LoopOnce );
		this._attack.clampWhenFinished = true;
		
		this._idle = this.mixer.clipAction(this.geometry.animations[2]);
		
		this._run = this.mixer.clipAction(this.geometry.animations[3]);
		
		this._dance = this.mixer.clipAction(this.geometry.animations[1]);
		
		this.angle = null;
		
		this._$run = false;
		
		this._$attack = false;
		
	}
	
	attack() {
		this.reset();
		this._$attack = true;
		this._attack.play();
		
		this.mixer.addEventListener('finished',() => {
			this._$attack = false;
			if(this._$run) {
				this._attack.crossFadeTo(this._run,0.15,true);
				this._run.play();
			}else{
				this._attack.crossFadeTo(this._idle,0.15,true);
				this._idle.play();
			}
			//shoot bullet
		});
	}
	
	idle() {
		this.reset();
		this._idle.play();
		this._$run = false;
	}
	
	run(data) {
		this._$attack = false;
		this._$run = true;	
		this.reset();
		this._run.play();
	}
	
	
	dance() {
		this.reset();
		this._dance.play();
		this._dance.crossFadeFrom(this._idle,0.3,true);
	}
	
	reset() {
    	this.mixer.stopAllAction();
    	for( let i=0; i < this.mesh.geometry.animations.length; i++) {
    		this.mixer.clipAction( this.mesh.geometry.animations[i] ).reset();
    	}
	}
	
	rotate(data) {
		if(data.angle) {
			let deg = data.angle.degree;
			this.mesh.rotation.y = toRad(deg - 270);
			this.deg = deg;
		}
		function toRad(deg){
			return (deg/180)*Math.PI;
		}
	}
	
	animate() {
		this.mixer.update(this.clock.delta);
		if(this._$run && !this._$attack) {
			const movingStep = 0.003;
			this.mesh.position.x += movingStep * Math.cos(toRad(this.deg));
			this.mesh.position.z -= movingStep * Math.sin(toRad(this.deg));
		}
		function toRad(deg){
			return (deg/180) * Math.PI;
		}
	}
	
}

export default Character;
