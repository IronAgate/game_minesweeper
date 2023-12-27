
const cave = new Cave("cave", 10*40,12*40, 40);
const inp = new Input(cave.fgShadow);
//13,27:75 / 9,20:35 / 14,14:35 / 8,8:10
//const field = new Field(8,8, 10, 1,3);
let field; //temp

function tempTap(e) {
	let [x,y] = cave.translate_canvas_to_game(...inp.translate_to_canv(e.clientX, e.clientY));
	x = Math.floor(x);
	y = Math.floor(y);
	
	if (
		(x >= field.x && x < field.x+field.sizeX)
		&& (y >= field.y && y < field.y+field.sizeY)
	) {
		field.trigger(x,y);
	}
}



const chef = new Chef(cave, inp); //temp global

function startup() {
	//cave.paintWall("#324056");
	//cave.wall.requestFullscreen();
	//field.terraform();
	
	//inp.recieveDownAt(tempTap);
	
	
	cave.illuminateFg();
	
}

cave.ignite(startup);
