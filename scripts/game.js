const DBLT = 300; //milliseconds within to check double tap
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
	constructor(cave, fieldWidth,fieldDepth, mineCount) {
		
		this.cave = cave;
		cave.poseFg().fillStyle = "#324056";
		cave.poseFg().fillRect(0,0, cave.X,cave.Y);
		
		const pad = 0.5;
		//temp: assume y is larger dimension
		const width = fieldWidth;
		const depth = fieldDepth + 1 + pad;
		let newscale = cave.Y / (depth + pad*2);
		cave.scale = newscale;
		//todo: move this^ to a cave.fitY(depth) method
		
		let barPosY = pad;
		let fieldPosY = barPosY + 1 + pad;
		let fieldPosX = ((cave.X/cave.scale) - width)/2;
		
		
		const sheet = new Spritesheet(cave, "image_sheet", 4,4, 8);
		this.field = new Field(
			this,sheet,
			fieldPosX,fieldPosY,
			fieldWidth,fieldDepth,
			mineCount
		);
		this.bar = new FieldBar(
			sheet,
			fieldPosX,barPosY,
			fieldWidth
		);
	}
	start() {
		this.bar.terraform();
		this.field.terraform();
		
		cave.illuminateFg();
	}
	reset() {
		this.field.terraform();
		
		cave.illuminateFg();
	}
	tap(e) {
		let [x,y] = cave.translate_canvas_to_game(...inp.translate_to_canv(e.clientX, e.clientY));
		
		if (this.field.collides(x,y)) {
			this.field.trigger(x,y);
		}
	}
	updateFlags(flagCount) {
		this.bar.poseCount(flagCount);
	}
}

class GameObj {
	constructor(x,y, width,depth) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.depth = depth;
	}
	collides(x,y) {
		return (
			(x >= this.x && x < this.x+this.width)
			&& (y >= this.y && y < this.y+this.depth)	
		)
	}
	
}

class Field extends GameObj {
	constructor(game, sheet, x,y, width,depth, mineCount) {
		super(x,y, width,depth);
		this.game = game;
		this.sheet = sheet;
		this.mineCount = mineCount;
	}
	terraform() {
		
		this.flags = this.mineCount;
		this.game.updateFlags(this.flags);
		
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
	
	trigger(x,y) {
		x = Math.floor(x - this.x);
		y = Math.floor(y - this.y);
		
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

class FieldBar extends GameObj{
	constructor(sheet, x,y, width) {
		super(x,y, width,1);
		this.sheet = sheet;
		
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