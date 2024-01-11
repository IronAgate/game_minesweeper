class PauseMenu {
	constructor(controller) {
		
		controller.eisel.color("rgba(0,0,0,0.5)");
		controller.eisel.clear();
		
		this.panel = new GamePanel(
			controller,
			100,100,
			300,//controller.eisel.getWidth(),
				300//controller.eisel.getHeight()
		);
		this.panel.content = this;
		
		this.btns = [];
		const btnCount = 2;
		
		const w = this.panel.eisel.getWidth();
		const d = this.panel.eisel.getHeight();
		
		const bX = w * 0.05;
		const bWidth = w - bX*2;
		
		const bY = d * 0.05;
		const bHeight = ((d-bY*2) * 0.95) / btnCount;
		
		const bSpacing = ((d-bY*2) * 0.05) / btnCount;
		
		this.bX = bX;
		this.bWidth = bWidth;
		this.bY = bY;
		this.bHeight = bHeight;
		this.bSpacing = bSpacing;
		this.drawnBs = 0;
		
		this.panel.eisel.color(BGC);
		this.panel.eisel.clear();
		
		this.drawButton("reset", this.reset);
		this.drawButton("quit", this.home);
		//this.drawButton("resume", this.resume);
		
		this.panel.present();
	}
	drawButton(text, f) {
		
		const specificY = this.bY + (this.bHeight + this.bSpacing) * this.drawnBs;
		
		//save for collision
		const btn = {
			f: f,
			y: specificY,
		};
		this.btns.push(btn);
		
		const e = this.panel.eisel;
		
		e.color(FGC);
		e.paintRectangle(
			this.bX,
				specificY,//this.bY + (this.bHeight + this.bSpacing) * this.drawnBs,
			this.bWidth, this.bHeight
			)
		
		e.color(TXC);
		e.font(this.bHeight*0.5);
		e.write(
			text,
			this.bX*1.5,
				(this.bY + (this.bHeight + this.bSpacing) * this.drawnBs) + this.bHeight*0.75,
			this.bWidth
		);
		
		this.drawnBs++;
	}
	
	trigger(x,y) {
		for (let i = this.btns.length-1; i >= 0; i--) {
			const xdif = x - this.bX;
			const ydif = y - this.btns[i].y;
			if (
				(ydif >= 0 && ydif <= this.bHeight)
				&& (xdif >= 0 && xdif <= this.bWidth)
			) {
				this.runme = this.btns[i].f;
				this.runme(this);
				delete this.runme;
				return
			}
		}
	}
	
	reset() {
		this.panel.game.reset();
	}
	home() {
		this.panel.game.exit();
	}
	resume() {
		this.panel.game.resume();
	}
	
}