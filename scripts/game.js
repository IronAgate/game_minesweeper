
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

const DBLT = 250; //milliseconds within to check double tap

const cave = new Cave("cave", 320,320, 40);
const inp = new Input(cave.fgShadow);

const map = [];
	//0 undug empty
	//1 undug mine
	//2 flagged empty
	//3 flagged mine
	//4 dug empty
	//5 dug mine
let sizeX = 0;
let sizeY = 0;
let mineCount = 0;
let lastTap = 0;
let tilesDug = 0;

const sheet = new Spritesheet(cave, "image_sheet", 4,4, 8);

function terraform() {
	//show grid of blank tiles
	//also used as reset
	
	lastTap = 0;
	tilesDug = 0;
	
	for (let x = 0; x < sizeX; x++) {
		const col = [];
		for (let y = 0; y < sizeY; y++) {
			col[y] = 0;
			sheet.pose(IMUNDUG, x,y, 1,1);
		}
		map[x] = col;
	}
	cave.illuminateFg();
}
function layMines(notX,notY) {
	//populate map with mines
	for (let i = 0; i < mineCount; i++) {
		const r = Math.floor(Math.random() * (sizeX*sizeY));
		const rx = Math.floor(r/sizeX);
		const ry = r - rx*sizeX; //err? i mean it works, but might be translating wrong here technically / see spritesheet
		
		if (
			(
				(rx > notX+1 || rx < notX-1) 
				|| (ry > notY+1 || ry < notY-1) //not near starting tap
			)
			&& !(map[rx][ry]) //not mine
		) {
			map[rx][ry] = 1;
		} else {
			i--; //try again
		}
	}
}

function countNeighboringMines(ox,oy) {
	let m = 0;
	for (let x = ox-1; x < ox+2; x++) {
		for (let y = oy-1; y < oy+2; y++) {
			if (x >= 0 && x < sizeX && y >= 0 && y < sizeY) {
				m += map[x][y] % 2;
			}
		}
	} 
	return m;
}
function countNeighboringFlags(ox,oy) {
	//counts flags & revealed mines
	let m = 0;
	for (let x = ox-1; x < ox+2; x++) {
		for (let y = oy-1; y < oy+2; y++) {
			if (x >= 0 && x < sizeX && y >= 0 && y < sizeY) { //doesnt exclude origin
				m += ((map[x][y] > 1 && map[x][y] < 4) || map[x][y] === 5);
			}
		}
	} 
	return m;
}
function digNeighbors(ox, oy) {
	for (let x = ox-1; x < ox+2; x++) {
		for (let y = oy-1; y < oy+2; y++) {
			if (x >= 0 && x < sizeX && y >= 0 && y < sizeY && !(x === ox && y === oy)) { //in map bounds and not origin point
				if (map[x][y] < 2) {//undug unflagged
					dig(x,y); //beware recursion limit
				}
			}
		}
	}
}

function flag(x,y) {
	//toggle flags
	if (map[x][y] > 1) { //flagged or dug
		map[x][y] -= 2;
		sheet.pose(IMUNDUG, x,y, 1,1);
		//cave.illuminateFg();
	} else {
		map[x][y] += 2;
		sheet.pose(IMFLAG, x,y, 1,1);
		//cave.illuminateFg();
	}
}
function dig(x,y, rootDig=false) {
	if (map[x][y] % 2) { //mine
		map[x][y] = 5;
		sheet.pose(IMMINE, x,y, 1,1);
	} else if (map[x][y] > 3) { //is already dug
		if (countNeighboringFlags(x,y) >= countNeighboringMines(x,y)) {
			digNeighbors(x,y);
		}
	} else { //non-mine, unflagged
		map[x][y] = 4;
		tilesDug += 1;
		const nmines = countNeighboringMines(x,y);
		sheet.pose(nmines, x,y, 1,1);
		if (!nmines) {
			digNeighbors(x,y);
		}
	}
	if (rootDig) {
		checkComplete();
	}
}

function checkComplete() {
	if (tilesDug < sizeX*sizeY - mineCount) {
		return;
	}
	console.log("complete!");
	for (let x = 0; x < sizeX; x++) {
		for (let y = 0; y < sizeY; y++) {
			if (map[x][y] === 4) {
				sheet.pose(0, x,y, 1,1);
			} else if (map[x][y] === 3) {
				sheet.pose(IMUNDUG, x,y, 1,1);
			}
		}
	}
}

function tap(e) {
	
	let [x,y] = cave.translate_canvas_to_game(...inp.translate_to_canv(e.clientX, e.clientY));
	x = Math.floor(x);
	y = Math.floor(y);
	
	const now = new Date().getTime();
	if (!lastTap) { //first tap
		layMines(x,y);
		dig(x,y, true);
	} else if ((lastTap[0] + DBLT > now) && (lastTap[1] == x) && (lastTap[2] == y)) { //double tap
		dig(x,y, true);
	} else if (map[x][y] < 4) { //undug
		flag(x,y);
	} else { //dug, by elimination
		dig(x,y, true);
	}
	lastTap = [now, x,y];
	
	cave.illuminateFg();//push visual changes
}

function startup() {
	cave.paintWall("#000");
	
	sizeX = 8;
	sizeY = 8;
	mineCount = 10;
	
	terraform();
	
	inp.recieveDownAt(tap);
}

cave.ignite(startup);
