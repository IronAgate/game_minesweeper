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
		
		const btnCount = 3;
		
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
		this.drawButton("home", this.home);
		this.drawButton("resume", this.resume);
		
		this.panel.present();
	}
	drawButton(text, f) {
		
		const e = this.panel.eisel;
		
		e.color(FGC);
		e.paintRectangle(
			this.bX,
				this.bY + (this.bHeight + this.bSpacing) * this.drawnBs,
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
		this.resume();
	}
	
	reset() {
		
	}
	home() {
		
	}
	resume() {
		this.panel.game.resume();
	}
	
}