
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

		if(!Array.isArray(selectors.cssselector)) { return; }

		if(depth >= MAX_WAIT_CYCLES){ selectors.cssselector.shift(); } // max_cycles goto next element

		if(selectors.cssselector.length < 1) { return; }

		let clicked = false;

		document.querySelectorAll(selectors.cssselector[0]).forEach( (item) => {
			if( typeof item.click === 'function') {
				item.click(); // click item
				log('debug', 'item clicked');
				clicked=true;
			}else{
				log('debug','item has no click function');
			}
		} );

		if(selectors.repeatdelay > 0) {
			let selector = JSON.parse(JSON.stringify(selectors));
			selector.cssselector = [selector.cssselector[0]];
            const min = (selector.repeatdelay - selector.randomrepeatvariance);
            const max = (selector.repeatdelay + selector.randomrepeatvariance);
            const tovalue = ((max - min) > 0) ? getRandomInt(min, max) : selector.repeatdelay;
			log('debug','tovalue: ' + tovalue);
			setTimeout(function() {
				waitFor(selector, 0);
			},tovalue);
		}

		if(selectors.repeatdelay > 0 || clicked === true){
			depth = -1;
			selectors.cssselector.shift();
		}

		if(selectors.cssselector.length > 0) {
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

		// check enabled
		if(typeof selector.enabled !== 'boolean') { return; }
		if(selector.enabled !== true) { return; }

		// check url regex
		if(typeof selector.urlregex !== 'string') { return; }
		selector.urlregex = selector.urlregex.trim();
		if(selector.urlregex === ''){ return; }

		if(!(new RegExp(selector.urlregex)).test(window.location.href)){ return; }

		log('debug', window.location.href);

		if ( typeof selector.cssselector !== 'string' ) { return; }
		if ( selector.cssselector === '' ) { return; }

		selector.cssselector = selector.cssselector.split(';');

		log('debug', JSON.stringify(selector,null,4));

		try {
			setTimeout(function() {
				let depth = 0;
				waitFor(selector, depth)
			}, selector.initaldelay || 3000); // wait initaldelay
		}catch(e){
			log('WARN', 'cssselector execution failed :' + selector.cssselector + " initaldelay: " + selectors.initaldelay);
		}
	});

})();
