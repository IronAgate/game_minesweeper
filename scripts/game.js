const DBLT = 300;
const BGC = "#324056";
const SPSZ = 8;
const IM = {
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
		
		//bad practice?
		renderController.eisel.setColor(BGC);
		renderController.eisel.clear();
		
		this.eisel = renderController.createFullEisel();
		
		const sheet = document.getElementById("game_sheet");
		
		
		const fieldPanel = new GamePanel(
			this,
			0,0,
			this.renderController.width,
				this.renderController.depth
		);
		
		const field = new Minefield(
			fieldPanel,
			fieldWidth,fieldDepth,
			mineCount
		);
		
		
		
		
		renderController.input.recieveUp(this);
	}
	present() {
		this.eisel.presentFill(this.renderController.eisel);
		//this.eisel.setColor(BGC);
		//this.eisel.clear();
	};
	onUp([x,y]) {
		//detect collision, send to appropriate panel
		
		//panel.trigger(x,y);
		
		
		//finally
		this.present();
	}
}

class GamePanel {
	constructor(controller, x,y, width,depth) {
		
		this.controller = controller;
		this.x = x;
		this.y = y;
		this.width = width;
		this.depth = depth;
		
		this.eisel = new OffscreenEisel(width,depth);
	}
	collides(x,y) {
		return (
			(x >= this.x && x < this.x+this.width)
			&& (y >= this.y && y < this.y+this.depth)	
		);
	}
	trigger(x,y) {
		//localize coords
		x -= this.x;
		y -= this.y;
		//rescale?
		this.content.trigger(x,y);
	}
	present() {
		this.eisel.present(
			this.controller.eisel,
			this.x,this.y,
			this.width,this.depth
		);
	}
}

class Minefield {
	constructor(panel, width,depth, mineCount) {
		this.panel = panel;
		panel.content = this;
		panel.eisel.scaleFit(width,depth);
		
		this.width = width;
		this.depth = depth;
		this.mineCount = mineCount;
		
		const sheet = document.getElementById("game_sheet");
		this.panel.eisel.paintSprite(IM.x, sheet,8, 1,2);
		this.panel.eisel.paintSprite(IM.undug, sheet,8, 1,1);
		this.panel.present();
		this.panel.controller.present();
		
	}
	
}