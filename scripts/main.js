
function startup(renderController) {
	
	
	
	new Chef(
		renderController
		, new Waiter(renderController)
		, tempMenuStr
	);
	
}

new RenderController("game", 500,500, startup);