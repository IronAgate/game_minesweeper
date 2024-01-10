
class Bar {
	constructor(panel,sheet, width, flags) {
		this.panel = panel;
		panel.content = this;
		panel.eisel.setScaleFit(width, 1);
		
		this.sheet = sheet;
		this.width = width;
		this.flags = flags;
	}
	
	terraform() {
		this.drawTile(IM.undug, 0);
		this.drawTile(IM.flag, 1);
		for (let i = 4; i < this.width; i++) {
			this.drawTile(IM.undug, i);
		}
		this.drawTile(IM.button, this.width-2);
		
		//this.panel.present();
		this.display();
	}
	
	useFlag() {
		this.flags -= 1;
		this.display();
	}
	collectFlag() {
		this.flags += 1;
		this.display();
	}
	
	display() {
		if (this.flags < 0) {
			return; //todo: negative flag count
		}
		const fs = String(this.flags);
		if (fs.length === 1) {
			this.drawTile(0, 2);
			this.drawTile(fs, 3);
		} else {
			this.drawTile(fs[0], 2);
			this.drawTile(fs[1], 3);
		}//cant show more than 99 flags
		
		this.panel.present();
	}
	trigger(x,_) {
		x = Math.floor(x);
		
		if (x === this.width-2) { //burger btn
			this.panel.game.pause();
		}
	}
	drawTile(index, x) {
		this.panel.eisel.paintSprite(
			index,
			this.sheet, SPRSZ,
			x,0
		);
	}
}