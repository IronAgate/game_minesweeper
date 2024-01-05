
class Waiter {
	constructor(renderController) {
		this.renderController = renderController;
	}
	play(x,y, m) {
		//13,27:75 / 9,20:35 / 14,14:35 / 8,8:10
		this.renderController.input.forgetUp();
		
		new GameController(this.renderController, x,y,m);
		//todo: recieve inp in game.start
	}
	
}