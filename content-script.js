
(async () => {

	let store;
	const extId = 'CAA';
	const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?

	const log = (level, msg) => { 
		level = level.trim().toLowerCase();
		if (['error','warn'].includes(level) 
			|| ( temporary && ['debug','info','log'].includes(level))
		) {
			console[level](extId + '::' + level.toUpperCase() + '::' + msg); 
			return;
		}
	}

	const MAX_WAIT_CYCLES=50;


	const waitFor = (selectors, time, depth) => {
		log('DEBUG', JSON.stringify(selectors) + "|" + depth);

		if(!Array.isArray(selectors)) { return; }

		if(depth >= MAX_WAIT_CYCLES){
			selectors.shift();
		}

		if(selectors.length < 1) { return; }

		let clicked = false;
		document.querySelectorAll(selectors[0]).forEach( (item) => {

			if( typeof item.click === 'function') {
				item.click(); // click item 
				log('DEBUG', 'item clicked');
				clicked=true;
			}else{
				log('DEBUG','item has no click function');
			}
		} );

		if(clicked === true){
			depth = -1;
			selectors.shift();
		}
		
		if(selectors.length > 0) {
			setTimeout(function() {
				waitFor(selectors, time, ++depth);
			}, time);
		}
	}

	log( 'DEBUG', 'temporary: ' + temporary);
	try {
		store = await browser.storage.local.get('selectors');
	}catch(e){
		log('ERROR', 'access to rules storage failed');
		return;
	}

	if ( typeof store.selectors.forEach !== 'function' ) { 
		log('ERROR', 'rules selectors not iterable');
		return;
	}

	store.selectors.forEach( (selector) => {

		// check activ
		if(typeof selector.activ !== 'boolean') { return; }
		if(selector.activ !== true) { return; }

		// check url regex 
		if(typeof selector.url_regex !== 'string') { return; }
		selector.url_regex = selector.url_regex.trim(); 
		if(selector.url_regex === ''){ return; }

		if(!(new RegExp(selector.url_regex)).test(window.location.href)){ return; }

		if ( typeof selector.code !== 'string' ) { return; }
		if ( selector.code === '' ) { return; }

		log('DEBUG', JSON.stringify(selector,null,4));

		//try {
			let depth = 0;
			waitFor(selector.code.split(';'),100, depth)
		//}catch(e){
		//	log('WARN', 'code execution failed :' + selector.code);
		//}
	});

})();
