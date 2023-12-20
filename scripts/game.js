
const cave = new Cave("cave", 320,320, 40);
const inp = new Input(cave.fgShadow);

const field = new Field(8,8, 10);

function tempTap(e) {
	let [x,y] = cave.translate_canvas_to_game(...inp.translate_to_canv(e.clientX, e.clientY));
	x = Math.floor(x);
	y = Math.floor(y);
	
	field.trigger(x,y);
}

function startup() {
	cave.paintWall("#000");
	
	field.terraform();
	
	inp.recieveDownAt(tempTap);
}

cave.ignite(startup);
