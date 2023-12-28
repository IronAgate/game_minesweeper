
const cave = new Cave("cave", 10*40,12*40, 40);
const inp = new Input(cave.fgShadow);
//13,27:75 / 9,20:35 / 14,14:35 / 8,8:10

let game;
function middlemanTap(e) {
	game.tap(e);
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
