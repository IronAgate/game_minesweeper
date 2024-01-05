const DBLT = 300;
const BGC = "#324056";
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
		
		
		const spritesheet = new Spritesheet(
			document.getElementById("game_sheet"),
			8
		);
		const bar = new Bar(
			0,0,//x,y,
			spritesheet,
			fieldWidth,
			mineCount
		);
		const field = new Minefield(
			renderController,spritesheet,
			0,0,//x,y,
			fieldWidth,fieldDepth, mineCount,
			bar
		);
		
		
		renderController.input.recieveUp(this);
	}
	onUp([x,y]) {
		
	}
}

class GamePanel {
	constructor(renderController,spritesheet, x,y) {
		this.spritesheet = spritesheet;
		this.renderController = renderController;
		this.x = x;
		this.y = y;
		
		this.eisel = new OffscreenEisel(320,320);
		this.eisel.scale = 40;
	}
	drawTile(index, x,y) {
		this.spritesheet.paintSprite(
			index,
			this.eisel,
			x,y,
			1,1
		);
	}
	present() {
		this.eisel.presentFill(this.renderController.eisel);
	}
}

class Minefield {
	constructor(renderController, spritesheet, x,y, width,depth, mineCount, bar) {
		this.panel = new GamePanel(renderController,spritesheet, x,y);
		this.width = width;
		this.depth = depth;
		this.mineCount = mineCount;
		this.bar = bar;
		
		//this.terraform();
		
		this.panel.drawTile(IM.x, 2,1);
		this.panel.present();
		
	}
	/////////////////
	terraform() {
		
		this.blocktrigger = 0;
		
		this.lastTap = 0;
		this.tilesDug = 0;
		
		this.map = [];
		for (let x = 0; x < this.width; x++) {
			const col = [];
			for (let y = 0; y < this.depth; y++) {
				col[y] = 0;
				this.pose(IMUNDUG, x,y);
			}
			this.map[x] = col;
		}
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
				i--; //try again
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
			this.pose(IMUNDUG, x,y);
			
			this.flags += 1;
		} else {
			this.map[x][y] += 2;
			this.pose(IMFLAG, x,y);
			
			this.flags -= 1;
		}
		this.game.updateFlags(this.flags);
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
				this.flags += 1;
				this.game.updateFlags(this.flags);
			}
			this.map[x][y] = 4;
			this.tilesDug += 1;
			const nmines = this.countNeighboringMines(x,y);
			if (nmines) {
				this.pose(nmines, x,y);
			} else {
				this.pose(IMBLANK, x,y);
				this.digNeighbors(x,y);
			}
		}
		if (rootDig) {
			this.checkComplete();
		}
	}
	boom(mx,my) {
		this.map[mx][my] = 5;
		this.pose(IMMINE, mx,my);
		
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.depth; y++) {
				if (this.map[x][y] === 2) {
					this.pose(IMX, x,y);
				}
			}
		}
		this.blocktrigger = 1;
	}
	checkComplete() {
		if (this.tilesDug < this.width*this.depth - this.mineCount) {
			return;
		}
		console.log("complete!");
		this.blocktrigger = 1;
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.depth; y++) {
				if (this.map[x][y] === 4) {
					this.pose(IMBLANK, x,y);
				} else if (this.map[x][y] === 3) {
					this.pose(IMUNDUG, x,y);
				}
			}
		}
	}
	
	trigger(gx,gy) {
		//x = Math.floor(x - this.x);
		//y = Math.floor(y - this.y);
		const [x,y] = this.localize(gx,gy);
		
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
		
		cave.illuminateFg();//push visual changes
	}
	
	pose(spritenum, x,y) {
		this.sheet.pose(spritenum, this.x+x,this.y+y, 1,1);
	}
	/////////////////
}

class Bar {
	constructor(x,y, spritesheet, width, mineCount) {
		this.panel = new GamePanel(x,y, spritesheet);
		this.width = width;
		this.flagCount = mineCount;
	}
	useFlag() {
		
	}
	collectFlag() {
		
	}
}