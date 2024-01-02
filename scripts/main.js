
const cave = new Cave("cave", 500,500);
const inp = new Input(cave.fgShadow);
const chef = new Chef(cave, inp, tempMenuStr); //temp global
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
	
}

cave.ignite(startup);
