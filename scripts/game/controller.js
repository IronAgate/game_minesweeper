const DBLT = 300;
const BGC = "#324056";
const FGC = "#557185";//used in pause menu
const TXC = "#ffd079";
const SPRSZ = 8;
const IM = {
	blank:10,
	mine:11,
	undug:12,
	flag:13,
	x:14,
	button:15
}

class GameController {
	constructor(renderController, fieldWidth,fieldHeight, mineCount) {
		
		this._renderController = renderController;
		
		renderController.input.recieveUp(this);
		
		//for reset
		this.w = fieldWidth;
		this.h = fieldHeight;
		this.m = mineCount;
		
		this.eisel = renderController.newFrame();
		
		const sheet = document.getElementById("game_sheet");
		
		
		
		const barPanel = new GamePanel(
			this,
			25,0,
			this._renderController.eisel.getWidth() - 50, //something is wrond here
				(this._renderController.eisel.getWidth() - 50)/fieldWidth
		);
		this.bar = new Bar(
			barPanel,
			sheet,
			8, mineCount
		);
		
		
		const fieldPanel = new GamePanel(
			this,
			25,75,
			this._renderController.eisel.getWidth() * 0.75,
				this._renderController.eisel.getHeight() * 0.75
		);
		this.field = new Minefield(
			fieldPanel,
			sheet,
			fieldWidth,fieldHeight, mineCount,
			this.bar
		);
		
		this.clear();
		this.start();
	}
	start() {
		this.field.terraform();
		this.bar.terraform();
		this.paused = false;
		this.present();
	}
	clear() {
		this.eisel.color(BGC);
		this.eisel.clear();
	}
	present() {
		this._renderController.eisel.display(this.eisel)
	}
	onUp([x,y]) {
		//waits for response to draw frames / doesnt redraw frames constantly like most games
		
		if (this.paused) {
			if (this.pauseMenu.panel.collides(x,y)) {
				this.pauseMenu.panel.trigger(x,y);
			} else {
				this.resume();
			}
			
		} else if (this.field.panel.collides(x,y)) {
			this.field.panel.trigger(x,y);
		} else if (this.bar.panel.collides(x,y)) {
			this.bar.panel.trigger(x,y);
		}
		
		if (this.doExit) {
			return;
		}
		
		//finally
		this.present();
	}
	
	pause() {
		this.paused = true;
		this.pauseMenu = new PauseMenu(this);
	}
	resume() {
		delete this.pauseMenu;
		this.paused = false;
		
		this.clear();
		
		this.field.panel.present();
		this.bar.panel.present();
	}
	exit() {
		this.doExit = true;
		new Chef(
			this._renderController
			, new Waiter(this._renderController)
			, tempMenuStr
			, "play"
		);
	}
	reset() {
		this.doExit = true;
		new GameController(this._renderController, this.w,this.h,this.m);
	}
}

class GamePanel {
	constructor(game, x,y, width,height) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		this.eisel = new OffscreenEisel(width,height);
		//todo: better way to set resolution. Currently, if proportions uneven, will crop instead of warp
	}
	collides(x,y) {
		return (
			(x >= this.x && x < this.x+this.width)
			&& (y >= this.y && y < this.y+this.height)
		);
	}
	trigger(x,y) {
		//coord args are relative to display canvas at first, but scaled as game coords. In this case game coords == display canvas coords
		
		//make relative to this panel:
		x -= this.x;
		y -= this.y;
		
		[x,y] = this.eisel.unscale(x,y);
		
		this.content.trigger(x,y);
	}
	present() {
		this.game.eisel.paintImage(
			this.eisel.getCanvas()
			, this.x,this.y
			, this.width,this.height
		);
	}
}