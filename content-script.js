
(async () => {

    function getRandomInt(min, max) {
        if(max <= min) return 0;
        return Math.floor(Math.random() * (max - min)) + min;
    }

	if (typeof window.automateclick_hasRun !== 'undefined'){
		return;
	}
	window.automateclick_hasRun = true;

	let store = {};
	const extId = 'automate-click';
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

	const waitFor = (selectors, depth) => {

		if(!Array.isArray(selectors.code)) { return; }

		if(depth >= MAX_WAIT_CYCLES){ selectors.code.shift(); } // max_cycles goto next element

		if(selectors.code.length < 1) { return; }

		let clicked = false;

		document.querySelectorAll(selectors.code[0]).forEach( (item) => {
			if( typeof item.click === 'function') {
				item.click(); // click item
				log('debug', 'item clicked');
				clicked=true;
			}else{
				log('debug','item has no click function');
			}
		} );

		if(selectors.repeat > 0) {
			let selector = JSON.parse(JSON.stringify(selectors));
			selector.code = [selector.code[0]];
            const min = (selector.repeat - selector.rvariance);
            const max = (selector.repeat + selector.rvariance);
            const tovalue = (max > min && min >= 0) ? getRandomInt(min, max) : selector.repeat;
			log('debug','tovalue: ' + tovalue);
			setTimeout(function() {
				waitFor(selector, 0);
			},tovalue);
		}

		if(selectors.repeat > 0 || clicked === true){
			depth = -1;
			selectors.code.shift();
		}

		if(selectors.code.length > 0) {
			setTimeout(function() {
				waitFor(selectors, ++depth);
			}, 250);
		}
	}

	log( 'debug', 'temporary: ' + temporary);
	try {
		store = await browser.storage.local.get('selectors');
	}catch(e){
		log('error', 'access to rules storage failed');
		return;
	}

	if ( typeof store.selectors !== 'object' ) {
		log('error', 'rules selectors not available');
		return;
	}

	if ( typeof store.selectors.forEach !== 'function' ) {
		log('error', 'rules selectors not iterable');
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

		log('debug', window.location.href);

		if ( typeof selector.code !== 'string' ) { return; }
		if ( selector.code === '' ) { return; }

		selector.code = selector.code.split(';');

		log('debug', JSON.stringify(selector,null,4));

		try {
			setTimeout(function() {
				let depth = 0;
				waitFor(selector, depth)
			}, selector.delay || 3000); // wait delay
		}catch(e){
			log('WARN', 'code execution failed :' + selector.code + " delay: " + selectors.delay);
		}
	});

})();
