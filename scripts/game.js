const DBLT = 300;
const BGC = "#324056";
const IMAGES = {
	blank:10,
	mine:11,
	undug:12,
	flag:13,
	x:14,
	button:15
}

class GameController {
	constructor(renderController, fieldWidth,fieldDepth, mineCount) {
		
		this.renderController = renderController;
		
		renderController.eisel.setColor(BGC);
		renderController.eisel.clear();
		this.test = 3;
		
		renderController.input.recieveUp(this);
	}
	onUp([x,y]) {
		
	}
}

class GamePanel {
	constructor() {
		
		//handle rendering-related stuff
	}
}

class Field {
	
}

class Bar {

}