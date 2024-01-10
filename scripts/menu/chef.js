
class Chef {
	constructor(renderController, waiter, menuStr, home="home") {
		
		this._renderController = renderController;
		this._menuData = JSON.parse(menuStr);
		
		this._eisel = renderController.newFrame();
		
		this._waiter = waiter;
		
		this._renderController.input.recieveUp(this);
		this.display(home);
	}
	display(menuName) {
		const contents = this._menuData[menuName].contents;
		this._current = menuName;
		
		this._eisel.color(this._menuData.style.bgColor);
		this._eisel.clear();
		
		const ew = this._eisel.getWidth();
		const eh = this._eisel.getHeight();
		
		const padding = .05;
		
		const bx = ew * padding;
		const bw = ew - bx*2;
		
		const startY = eh * padding;
		const bh = ((eh - startY*2) * (1-padding)) / contents.length;
		const spacing = ((eh - startY*2) * padding) / contents.length;
		
		for (let i = 0; i < contents.length; i++) {
			
			const by = startY + ((bh + spacing) * i);
			
			//set for collision
			contents[i].x = bx;
			contents[i].y = by;
			contents[i].endX = bx + bw;
			contents[i].endY = by + bh;
			
			this._eisel.color(this._menuData.style.fgColor);
			this._eisel.paintRectangle(bx,by, bw,bh);
			
			this._eisel.color(this._menuData.style.textColor);
			this._eisel.font(bh*0.5);
			this._eisel.write(
				contents[i].text
				, bx * 1.50
					, by + bh*0.75
				, bw
			);
		}
		this._renderController.eisel.display(this._eisel);
	}
	onUp([x,y]) {
		const contents = this._menuData[this._current].contents;
		
		for (let i = 0; i < contents.length; i++) {
				
			if (
				(x >= contents[i].x)
				&& (x <= contents[i].endX)
				&& (y >= contents[i].y)
				&& (y <= contents[i].endY)
			) {
				this.trigger(contents[i]);
				break;
			}
		}
	}
	trigger(btn) {
		
		if (btn.type === 0) { //navigate
			this.display(btn.menu);
		} else if (btn.type === 1) { //call func
			eval("this._waiter." + btn.f); //todo: find alternative
		} else if (btn.type === 2) {//open link
			//btn.link
		}
		
	}
}



const tempMenuStr = `
{

"style": {
	"bgColor": "#324056"
	, "fgColor": "#557185"
	, "textColor": "#ffd079"
}

, "home": {
	
	
	"contents": [
		{
			"text": "play"
			, "type": 0
			, "menu": "play"
		}, {
			"text": "help"
			, "type": 2
			, "link": ""
		}
	]
}
, "play": {
	
	
	"contents": [
		{
			"text": "beginner"
			, "type": 1
			, "f": "play(8,8,10)"
		}, {
			"text": "medium"
			, "type": 1
			, "f": "play(14,14,35)"
		}, {
			"text": "hard"
			, "type": 1
			, "f": "play(19,19,75)"
		}, {
			"text": "mega"
			, "type": 1
			, "f": "playMega()"
		}, {
			"text": "<- back"
			, "type": 0
			, "menu": "home"
		}
	]
}

}
`
/*
, "settings": {
	
	
	"contents": [
		{
			"text": "safety"
			, "type": 1
			, "f": "settingsSafety()"
		}, {
			"text": "death"
			, "type": 1
			, "f": "settingsDeath()"
		}, {
			"text": "palette"
			, "type": 1
			, "f": "settingsPalette()"
		}, {
			"text": "done"
			, "type": 0
			, "menu":"home"
		}
	]
}


}
`
*/