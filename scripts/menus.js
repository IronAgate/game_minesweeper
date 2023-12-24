

class Waiter {
	constructor(cave, inp) {
		
		this.ms = JSON.parse(tempMenuStr);
		
		
		this.cave = cave;
		
		this.inp = inp;
		inp.recieveUpAt(this.onTap);
		
		this.display("home");
	}
	onTap(e) {
		
	}
	display(menuName) {
		const contents = this.ms[menuName].contents
		
		this.cave.poseBg().fillStyle = this.ms["style"].bgColor;
		this.cave.poseBg().fillRect(0,0, this.cave.X,this.cave.Y);
		
		let startX = this.cave.X * 0.05;
		let width = this.cave.X - startX*2;
		
		let startY = this.cave.Y * 0.10;
		let depth = ((this.cave.Y-startY*2) * 0.95) / contents.length
		let spacing = ((this.cave.Y - startY*2) * 0.05) / contents.length
		
		for (let i = 0; i < contents.length; i++) {
			
			this.cave.poseFg().fillStyle = this.ms["style"].fgColor;
			this.cave.poseFg().fillRect(
				startX
				, startY + (depth + spacing) * i
				, width
				, depth
			);
			this.cave.poseFg().fillStyle = this.ms["style"].textColor;
			//this.cave.poseFg().textAlign = "center";
			this.cave.poseFg().font = String(depth*0.50) + "px monospace";
			this.cave.poseFg().fillText(
				this.ms[menuName].contents[i].text
				, startX * 1.50
				, (startY + (depth + spacing) * i) + depth*0.75
				, width
			);
		}
		this.cave.illuminateBg();
		this.cave.illuminateFg();
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
			"text": "settings"
			, "type": 0
			, "menu": "settings"
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
			, "f": "playBeginner"
		}, {
			"text": "medium"
			, "type": 1
			, "f": "playMedium"
		}, {
			"text": "hard"
			, "type": 1
			, "f": "playHard"
		}, {
			"text": "mega"
			, "type": 1
			, "f": "playMega"
		}, {
			"text": "back"
			, "type": 0
			, "menu": "home"
		}
	]
}
, "settings": {
	
	
	"contents": [
		{
			"text": "safety"
			, "type": 1
			, "f": "settingsSafety"
		}, {
			"text": "death"
			, "type": 1
			, "f": "settingsDeath"
		}, {
			"text": "palette"
			, "type": 1
			, "f": "settingsPalette"
		}, {
			"text": "done"
			, "type": 0
			, "menu":"home"
		}
	]
}


}
`