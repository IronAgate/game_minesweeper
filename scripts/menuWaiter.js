
class Waiter {
	//holds specialized functions called by menu btns
	playBeginner() {
		field = new Field(8,8, 10, 1,3);
		//todo: rescale game on canvas to fit other field dimensions
		
		cave.poseFg().fillStyle = "#324056";
		cave.poseFg().fillRect(0,0, cave.X,cave.Y);
		cave.illuminateFg();
		
		field.terraform();
		
		inp.unbindUpFrom(chef.tempF);
		inp.recieveUpAt(tempTap);
}
	
}