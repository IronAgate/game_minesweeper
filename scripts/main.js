
const MAPSIZEX = 8;
const MAPSIZEY = 8;
const RATIO = Math.floor(300/Math.min(MAPSIZEX,MAPSIZEY)) + 1;

//const ODDS = 0.20625;
const ODDS = 10/(8*8);

const cave = new Cave("cave", MAPSIZEX*RATIO,MAPSIZEY*RATIO, RATIO);
const inp = new Input(cave.fgShadow);

const map = [];
let firstTap = 1;

function tap(e) {
	let [x,y] = cave.translate_canvas_to_game(...inp.translate_to_canv(e.clientX, e.clientY));
	x = Math.floor(x);
	y = Math.floor(y);
	
	if (firstTap) {
		layMines(x,y);
		firstTap = 0;
		map[x][y].dig();
	} else {
		map[x][y].tap();
	}
	
}

function layMines(notX,notY) {
	for (let x = 0; x < MAPSIZEX; x++) {
		for (let y = 0; y < MAPSIZEY; y++) {
			if (!(x === notX) && !(y === notY)) {
				map[x][y].lay();
			}
		}
	}
}

function startup() {
	cave.paintWall("#000");
	
	//const sil = new Silhouette(cave, cave.fgFigureContext, "image_tile", 1,1);
	for (let x = 0; x < MAPSIZEX; x++) {
		const col = [];
		for (let y = 0; y < MAPSIZEY; y++) {
			col[y] = new Tile(x,y);
		}
		map.push(col);
	}
	cave.illuminateFg();
	
	inp.recieveDownAt(tap);
}

cave.ignite(startup);