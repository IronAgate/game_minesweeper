
class Waiter {
	constructor(renderController) {
		this.renderController = renderController;
	}
	play(w,h, m) {
		//13,27:75 / 9,20:35 / 14,14:35 / 8,8:10
		
		new GameController(this.renderController, w,h,m);
	}
}