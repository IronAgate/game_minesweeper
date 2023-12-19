
const DBTP = 300; //milliseconds to check double tap

class Tile {
	constructor(x,y) {
		this.sil = new Silhouette(cave, cave.fgFigureContext, "image_tile", 1,1);
		this.sil.pose(x,y)
		
		this.flagged = 0;
		this.dug = 0;
		this.x = x;
		this.y = y;
	}
	lay() {
		if ((Math.random() - ODDS) < 0) {
			this.mine = 1;
		}
	}
	checkMine(x,y) {
		if ( (x >= MAPSIZEX || x < 0) || (y >= MAPSIZEY || y < 0) ) {
			return 0;
		}
		if ( map[x][y].mine ) {
			return 1;
		}
		return 0;
	}
	neighborMines() {
		let n = 0;
		for (let x = -1; x < 2; x++) {
			for (let y = -1; y < 2; y++) {
				n += this.checkMine(this.x+x, this.y+y);
			}
		}
		return n;
	}
	checkDug(x,y) {
		if ( (x >= MAPSIZEX || x < 0) || (y >= MAPSIZEY || y < 0) ) {
			
		} else {
			const n = map[x][y];
			if (!n.dug && !n.flagged) {
				n.dig();
			}
		}
	}
	digNeighbors() {
		for (let x = -1; x < 2; x++) {
			for (let y = -1; y < 2; y++) {
				this.checkDug(this.x+x, this.y+y);
			}
		}
	}
	tap() {
		if (this.dug) {
			this.digNeighbors();
		} else if (this.flagged) {
			if (new Date().getTime() < this.flagged + 300) {
				this.dig();
			} else {
				this.unflag();
			}
		} else {
			this.flag();
		}
	}
	flag() {
		this.flagged = new Date().getTime();
		this.sil.image = document.getElementById("image_flag");
		this.sil.pose(this.x,this.y);
		cave.illuminateFg();
	}
	unflag() {
		this.flagged = 0;
		this.sil.image = document.getElementById("image_tile");
		this.sil.pose(this.x,this.y);
		cave.illuminateFg();
	}
	dig() {
		this.dug = 1;
		if (this.mine) {
			this.boom();
			return;
		}
		const n = this.neighborMines();
		this.sil.image = document.getElementById("image_" + n);
		this.sil.pose(this.x,this.y);
		cave.illuminateFg();
		if (!n) {
			this.digNeighbors();
		}
	}
	boom() {
		this.sil.image = document.getElementById("image_mine");
		this.sil.pose(this.x,this.y);
		cave.illuminateFg();
	}
	
}