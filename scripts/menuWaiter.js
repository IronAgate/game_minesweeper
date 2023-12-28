
class Waiter {
	//holds specialized functions called by menu btns
	play(x,y, m) {
		//field = new Field(x,y, m, 1,3);
		//todo: rescale game on canvas to fit other field dimensions
		
		game = new Game(x,y,m);
		
		cave.poseFg().fillStyle = "#324056";
		cave.poseFg().fillRect(0,0, cave.X,cave.Y);
		cave.illuminateFg();
		
		game.start();
		
		inp.unbindUpFrom(chef.tempF);
		inp.recieveUpAt(middlemanTap);
	}
	
}