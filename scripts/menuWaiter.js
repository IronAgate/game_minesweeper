
class Waiter {
	//holds specialized functions called by menu btns
	play(x,y, m) {
		//13,27:75 / 9,20:35 / 14,14:35 / 8,8:10
		inp.unbindUpFrom(chef.tempF); //todo: put in chef
		inp.recieveUpAt(middlemanTap);
		
		game = new Game(cave, x,y,m);
		game.start();
	}
	
}