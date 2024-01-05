/*
const cave = new Cave("cave", 500,500);
//const inp = new Input(cave.fgShadow);
//const chef = new Chef(cave, inp, tempMenuStr); //temp global
let game;

function middlemanTap(e) {
	game.tap(e);
}

function tempReset() {
	game = undefined;
	inp.unbindUpFrom(middlemanTap); //todo: put in Game
	
	chef.start("play");
}

function startup() {
	
	chef.start();
	
	cave.illuminateFg();
	//cave.wall.requestFullscreen();
	
}

cave.ignite(startup);
*/

const renderController = new RenderController("game", 500,500);

function startup() {
	
	
	renderController.artist.setColor("#ffaaef");
	renderController.artist.clear();
	
}

renderController.start(startup);