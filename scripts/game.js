const DBLT = 250; //milliseconds within to check double tap
const [
	IMBLANK,
	IMMINE,
	IMUNDUG,
	IMFLAG,
	IMX,
	IMVOID
] = [
	10,
	11,
	12,
	13,
	14,
	15
]

class Game {
	constructor(width,depth, mineCount) {
		
		const sheet = new Spritesheet(cave, "image_sheet", 4,4, 8);
		
		this.field = new Field(
			this,sheet,
			1,3,
			width,depth,
			mineCount
		);
		this.bar = new FieldBar(
			sheet,
			1,1,
			width
		);
		
		//logic for scaling to canvas
	}
	start() {
		this.bar.terraform();
		this.field.terraform();
	}
	tap(e) {
		let [x,y] = cave.translate_canvas_to_game(...inp.translate_to_canv(e.clientX, e.clientY));
		x = Math.floor(x);
		y = Math.floor(y);
		
		const field = this.field;
		if (
			(x >= field.x && x < field.x+field.sizeX)
			&& (y >= field.y && y < field.y+field.sizeY)
		) {
			field.trigger(x,y);
		}
	}
	updateFlags(flagCount) {
		this.bar.poseCount(flagCount);
	}
}

class Field {
	constructor(game, sheet, x,y, sizeX,sizeY, mineCount) {
		this.game = game;
		this.sheet = sheet;
		this.x = x;
		this.y = y;
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.mineCount = mineCount;
	}
	terraform() {
		
		this.flags = this.mineCount;
		this.game.updateFlags(this.flags);
		
		this.blocktrigger = 0;
		
		this.lastTap = 0;
		this.tilesDug = 0;
		
		this.map = [];
		for (let x = 0; x < this.sizeX; x++) {
			const col = [];
			for (let y = 0; y < this.sizeY; y++) {
				col[y] = 0;
				this.pose(IMUNDUG, x,y);
			}
			this.map[x] = col;
		}
		cave.illuminateFg();
	}
	layMines(notX,notY) {
		//populate map with mines
		for (let i = 0; i < this.mineCount; i++) {
			const r = Math.floor(Math.random() * (this.sizeX*this.sizeY));
			const ry = Math.floor(r/this.sizeX);
			const rx = r - ry*this.sizeX;
			
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
				if (x >= 0 && x < this.sizeX && y >= 0 && y < this.sizeY) {
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
				if (x >= 0 && x < this.sizeX && y >= 0 && y < this.sizeY) { //doesnt exclude origin
					m += ((this.map[x][y] > 1 && this.map[x][y] < 4) || this.map[x][y] === 5);
				}
			}
		} 
		return m;
	}
	digNeighbors(ox, oy) {
		for (let x = ox-1; x < ox+2; x++) {
			for (let y = oy-1; y < oy+2; y++) {
				if (x >= 0 && x < this.sizeX && y >= 0 && y < this.sizeY && !(x === ox && y === oy)) { //in map bounds and not origin point
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
		
		for (let x = 0; x < this.sizeX; x++) {
			for (let y = 0; y < this.sizeY; y++) {
				if (this.map[x][y] === 2) {
					this.pose(IMX, x,y);
				}
			}
		}
		this.blocktrigger = 1;
	}
	checkComplete() {
		if (this.tilesDug < this.sizeX*this.sizeY - this.mineCount) {
			return;
		}
		console.log("complete!");
		this.blocktrigger = 1;
		for (let x = 0; x < this.sizeX; x++) {
			for (let y = 0; y < this.sizeY; y++) {
				if (this.map[x][y] === 4) {
					this.pose(IMBLANK, x,y);
				} else if (this.map[x][y] === 3) {
					this.pose(IMUNDUG, x,y);
				}
			}
		}
	}
	
	trigger(x,y) {
		x -=this.x;
		y -= this.y;
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
}

class FieldBar {
	constructor(sheet, x,y, width) {
		this.sheet = sheet;
		this.x = x;
		this.y = y;
		this.width = width;
		
		
	}
	terraform() {
		this.pose(IMUNDUG, 0,0);
		this.pose(IMFLAG, 1,0);
		for (let i = 4; i < this.width; i++) {
			this.pose(IMUNDUG, i, 0);
		}
	}
	poseCount(flags) {
		if (flags < 0) {
			return;
		}
		const fs = String(flags);
		if (fs.length === 1) {
			this.pose(0, 2,0);
			this.pose(fs, 3,0);
		} else {
			this.pose(fs[0], 2,0);
			this.pose(fs[1], 3,0);
		}
	}
	pose(spritenum, x,y) {
		this.sheet.pose(spritenum, this.x+x,this.y+y, 1,1);
	}
}