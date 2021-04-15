
(async () => {

	if (typeof window.automateclick_hasRun !== 'undefined'){
		return;
	}
	window.automateclick_hasRun = true;

	let store = {};
	const extId = 'auto-click';
	const MAX_WAIT_CYCLES = 50;

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

	const waitFor = (selectors, time, depth) => {
		//log('debug', JSON.stringify(selectors) + "|" + depth);

		if(!Array.isArray(selectors)) { return; }

		if(depth >= MAX_WAIT_CYCLES){ selectors.shift(); } // max_cycles goto next element

		if(selectors.length < 1) { return; }

		let clicked = false;
		document.querySelectorAll(selectors[0]).forEach( (item) => {
			if( typeof item.click === 'function') {
				item.click(); // click item 
				log('debug', 'item clicked');
				clicked=true;
			}else{
				log('debug','item has no click function');
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

	log( 'debug', 'temporary: ' + temporary);
	try {
		store = await browser.storage.local.get('selectors');
	}catch(e){
		log('ERROR', 'access to rules storage failed');
		return;
	}

	if ( typeof store.selectors !== 'object' ) { 
		log('ERROR', 'rules selectors not available');
		return;
	}

	if ( typeof store.selectors.forEach !== 'function' ) { 
		log('ERROR', 'rules selectors not iterable');
		return;
	}

	store.selectors.forEach( (selector) => {

		//console.log(JSON.stringify(selector));

		// check activ
		if(typeof selector.activ !== 'boolean') { return; }
		if(selector.activ !== true) { return; }

		// check url regex 
		if(typeof selector.url_regex !== 'string') { return; }
		selector.url_regex = selector.url_regex.trim(); 
		if(selector.url_regex === ''){ return; }

		if(!(new RegExp(selector.url_regex, 'g')).test(window.location.href)){ return; }

		log('INFO', window.location.href);

		if ( typeof selector.code !== 'string' ) { return; }
		if ( selector.code === '' ) { return; }

		log('debug', JSON.stringify(selector,null,4));

		try {
			setTimeout(function() {
				let depth = 0;
				waitFor(selector.code.split(';'),250, depth)
			},selector.delay || 3000); // wait delay
		}catch(e){
			log('WARN', 'code execution failed :' + selector.code + " delay: " + selectors.delay);
		}
	});

})();
