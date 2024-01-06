const DBLT = 300;
const BGC = "#324056";
const SPSZ = 8;
const IM = {
	blank:10,
	mine:11,
	undug:12,
	flag:13,
	x:14,
	button:15
}

class GameController {
	constructor(renderController, fieldWidth,fieldDepth, mineCount) {
		
		this.renderController = renderController;
		
		//bad practice?
		renderController.eisel.setColor(BGC);
		renderController.eisel.clear();
		
		this.eisel = renderController.createFullEisel();
		
		const sheet = document.getElementById("game_sheet");
		
		
		const barPanel = new GamePanel(
			this,
			25,0,
			this.renderController.width - 50,
				(this.renderController.width - 50)/8
		);
		this.bar = new Bar(
			barPanel,
			sheet,
			fieldWidth, mineCount
		);
		
		
		const fieldPanel = new GamePanel(
			this,
			25,75,
			this.renderController.width * 0.75,
				this.renderController.width * 0.75
		);
		this.field = new Minefield(
			fieldPanel,
			sheet,
			fieldWidth,fieldDepth, mineCount,
			this.bar
		);
		
		
		
		renderController.input.recieveUp(this);
		
		this.ignite();
	}
	ignite() {
		this.field.terraform();
		this.bar.terraform();
		this.present();
	}
	present() {
		this.eisel.presentFill(this.renderController.eisel);
		//this.eisel.setColor(BGC); since minesweeper is simple, dont need to clear
		//this.eisel.clear();
	};
	onUp([x,y]) {
		//detect collision, send to appropriate panel
		
		this.field.panel.trigger(x,y);
		
		
		//finally
		this.present();
	}
}

class GamePanel {
	constructor(controller, x,y, width,depth) {
		
		this.controller = controller;
		this.x = x;
		this.y = y;
		this.width = width;
		this.depth = depth;
		
		this.eisel = new OffscreenEisel(width,depth);
		//todo: better way to set resolution. Currently, if proportions uneven, will crop instead of warp
	}
	collides(x,y) {
		return (
			(x >= this.x && x < this.x+this.width)
			&& (y >= this.y && y < this.y+this.depth)	
		);
	}
	trigger(x,y) {
		x -= this.x;
		y -= this.y;
		
		[x,y] = this.eisel.translateCanvasApp(x,y);
		
		this.content.trigger(x,y);
		this.present();
	}
	present() {
		this.eisel.present(
			this.controller.eisel,
			this.x,this.y,
			this.width,this.depth
		);
	}
}

class Minefield {
	constructor(panel,sheet, width,depth, mineCount, bar) {
		this.panel = panel;
		panel.content = this;
		panel.eisel.scaleFit(width,depth);
		
		this.sheet = sheet;
		
		this.width = width;
		this.depth = depth;
		this.mineCount = mineCount;
		
		this.bar = bar;
		
	}
	terraform() {
		
		this.blocktrigger = 0;
		
		this.lastTap = 0;
		this.tilesDug = 0;
		
		this.map = [];
		for (let x = 0; x < this.width; x++) {
			const col = [];
			for (let y = 0; y < this.depth; y++) {
				col[y] = 0;
				this.drawTile(IM.undug, x,y);
			}
			this.map[x] = col;
		}
		
		
		this.panel.present();
	}
	layMines(notX,notY) {
		//populate map with mines
		for (let i = 0; i < this.mineCount; i++) {
			const r = Math.floor(Math.random() * (this.width*this.depth));
			const ry = Math.floor(r/this.width);
			const rx = r - ry*this.width;
			
			if (
				(
					(rx > notX+1 || rx < notX-1) 
					|| (ry > notY+1 || ry < notY-1) //not near starting tap
				)
				&& !(this.map[rx][ry]) //not mine
			) {
				this.map[rx][ry] = 1;
			} else {
				i--; //try again if failed
			}
		}
	}
	
	countNeighboringMines(ox,oy) {
		let m = 0;
		for (let x = ox-1; x < ox+2; x++) {
			for (let y = oy-1; y < oy+2; y++) {
				if (x >= 0 && x < this.width && y >= 0 && y < this.depth) {
					m += this.map[x][y] % 2;
				}
			}
		} 
		return m;
	}
	countNeighboringFlags(ox,oy) {
		//counts flags & revealed mines
		let m = 0;
		for (let x = ox-1; x < ox+2; x++) {
			for (let y = oy-1; y < oy+2; y++) {
				if (x >= 0 && x < this.width && y >= 0 && y < this.depth) { //doesnt exclude origin
					m += ((this.map[x][y] > 1 && this.map[x][y] < 4) || this.map[x][y] === 5);
				}
			}
		} 
		return m;
	}
	digNeighbors(ox, oy) {
		for (let x = ox-1; x < ox+2; x++) {
			for (let y = oy-1; y < oy+2; y++) {
				if (x >= 0 && x < this.width && y >= 0 && y < this.depth && !(x === ox && y === oy)) { //in map bounds and not origin point
					if (this.map[x][y] < 2) {//undug unflagged
						this.dig(x,y); //beware recursion limit
					}
				}
			}
		}
	}
	
	flag(x,y) {
		//toggle flags
		if (this.map[x][y] > 1) { //flagged or dug
			this.map[x][y] -= 2;
			this.drawTile(IM.undug, x,y);
			
			this.bar.collectFlag();
		} else {
			this.map[x][y] += 2;
			this.drawTile(IM.flag, x,y);
			
			this.bar.useFlag();
		}
		//update flag manipulation, if applicable
	}
	dig(x,y, rootDig=false) {
		if (this.map[x][y] % 2) { //mine
			this.boom(x,y);
		} else if (this.map[x][y] > 3) { //is already dug
			if (this.countNeighboringFlags(x,y) >= this.countNeighboringMines(x,y)) {
				this.digNeighbors(x,y);
			}
		} else { 
			if (this.map[x][y] > 1 && this.map[x][y] < 4) {
				this.bar.collectFlag();
			}
			this.map[x][y] = 4;
			this.tilesDug += 1;
			const nmines = this.countNeighboringMines(x,y);
			if (nmines) {
				this.drawTile(nmines, x,y);
			} else {
				this.drawTile(IM.blank, x,y);
				this.digNeighbors(x,y);
			}
		}
		if (rootDig) {
			this.checkComplete();
		}
	}
	boom(mx,my) {
		this.map[mx][my] = 5;
		this.drawTile(IM.mine, mx,my);
		
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.depth; y++) {
				if (this.map[x][y] === 2) {
					this.drawTile(IM.x, x,y);
				}
			}
		}
		this.blocktrigger = 1;
	}
	checkComplete() {
		if (this.tilesDug < this.width*this.depth - this.mineCount) {
			return;
		}
		//console.log("complete!");
		this.blocktrigger = 1;
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.depth; y++) {
				if (this.map[x][y] === 4) {
					this.drawTile(IM.blank, x,y);
				} else if (this.map[x][y] === 3) {
					this.drawTile(IM.undug, x,y);
				}
			}
		}
	}
	
	trigger(x,y) {
		x = Math.floor(x);
		y = Math.floor(y);
		//const [x,y] = this.localize(gx,gy);
		
		if (this.blocktrigger) {
			return;
		}
		const now = new Date().getTime();
		if (!this.lastTap) { //first tap
			this.layMines(x,y);
			this.dig(x,y, true);
		} else if ((this.lastTap[0] + DBLT > now) && (this.lastTap[1] === x) && (this.lastTap[2] === y)) { //double tap
			this.dig(x,y, true);
		} else if (this.map[x][y] < 4) { //undug
			this.flag(x,y);
		} else { //dug, by elimination
			this.dig(x,y, true);
		}
		this.lastTap = [now, x,y];
		
	}
	
	drawTile(index, x,y) {
		this.panel.eisel.paintSprite(
			index,
			this.sheet, SPSZ,
			x,y
		);
	}
	
}

class Bar {
	constructor(panel,sheet, width, flags) {
		this.panel = panel;
		panel.eisel.scaleFit(width, 1);
		
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
		}
		
		this.panel.present();
	}
	
	drawTile(index, x) {
		this.panel.eisel.paintSprite(
			index,
			this.sheet, SPSZ,
			x,0
		);
	}
}