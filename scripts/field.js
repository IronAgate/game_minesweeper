const DBLT = 250; //milliseconds within to check double tap
const [
	IMMINE,
	IMUNDUG,
	IMFLAG,
	IMX,
	IMVOID
] = [
	11,
	12,
	13,
	14,
	15
]

class Field {
	constructor(sizeX,sizeY, mineCount) {
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.mineCount = mineCount;
		
		this.sheet = new Spritesheet(cave, "image_sheet", 4,4, 8);
	}
	terraform() {
		
		this.blocktrigger = 0;
		
		this.lastTap = 0;
		this.tilesDug = 0;
		
		this.map = [];
		for (let x = 0; x < this.sizeX; x++) {
			const col = [];
			for (let y = 0; y < this.sizeY; y++) {
				col[y] = 0;
				this.sheet.pose(IMUNDUG, x,y, 1,1);
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
			this.sheet.pose(IMUNDUG, x,y, 1,1);
		} else {
			this.map[x][y] += 2;
			this.sheet.pose(IMFLAG, x,y, 1,1);
		}
	}
	dig(x,y, rootDig=false) {
		if (this.map[x][y] % 2) { //mine
			this.boom(x,y);
		} else if (this.map[x][y] > 3) { //is already dug
			if (this.countNeighboringFlags(x,y) >= this.countNeighboringMines(x,y)) {
				this.digNeighbors(x,y);
			}
		} else { //non-mine, unflagged
			this.map[x][y] = 4;
			this.tilesDug += 1;
			const nmines = this.countNeighboringMines(x,y);
			this.sheet.pose(nmines, x,y, 1,1);
			if (!nmines) {
				this.digNeighbors(x,y);
			}
		}
		if (rootDig) {
			this.checkComplete();
		}
	}
	boom(mx,my) {
		this.map[mx][my] = 5;
		this.sheet.pose(IMMINE, mx,my, 1,1);
		
		for (let x = 0; x < this.sizeX; x++) {
			for (let y = 0; y < this.sizeY; y++) {
				if (this.map[x][y] === 2) {
					this.sheet.pose(IMX, x,y, 1,1);
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
					this.sheet.pose(0, x,y, 1,1);
				} else if (this.map[x][y] === 3) {
					this.sheet.pose(IMUNDUG, x,y, 1,1);
				}
			}
		}
	}
	
	trigger(x,y) {
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
}