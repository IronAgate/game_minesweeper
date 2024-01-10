
class Minefield {
	constructor(panel,sheet, width,height, mineCount, bar) {
		this.panel = panel;
		panel.content = this;
		panel.eisel.setScaleFit(width,height);
		
		this.sheet = sheet;
		
		this.width = width;
		this.height = height;
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
			for (let y = 0; y < this.height; y++) {
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
			const r = Math.floor(Math.random() * (this.width*this.height));
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
				if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
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
				if (x >= 0 && x < this.width && y >= 0 && y < this.height) { //doesnt exclude origin
					m += ((this.map[x][y] > 1 && this.map[x][y] < 4) || this.map[x][y] === 5);
				}
			}
		} 
		return m;
	}
	digNeighbors(ox, oy) {
		for (let x = ox-1; x < ox+2; x++) {
			for (let y = oy-1; y < oy+2; y++) {
				if (x >= 0 && x < this.width && y >= 0 && y < this.height && !(x === ox && y === oy)) { //in map bounds and not origin point
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
			for (let y = 0; y < this.height; y++) {
				if (this.map[x][y] === 2) {
					this.drawTile(IM.x, x,y);
				}
			}
		}
		this.blocktrigger = 1;
	}
	checkComplete() {
		if (this.tilesDug < this.width*this.height - this.mineCount) {
			return;
		}
		//console.log("complete!");
		this.blocktrigger = 1;
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
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
		
		this.panel.present();
	}
	
	drawTile(index, x,y) {
		this.panel.eisel.paintSprite(
			index,
			this.sheet, SPRSZ,
			x,y
		);
	}
	
	
	
}