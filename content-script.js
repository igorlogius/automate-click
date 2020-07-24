
(async () => {

	let store;
	const extId = 'PER';
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
	let WAIT_CYCLES_COUNTER=0;

	const waitFor = (selector, time) => {
		console.log(selector,time);
		var item = document.querySelector(selector);
		if( item !=null ) {
			if( typeof item.click === 'function') {
				item.click();
			}else{
				log('DEBUG','item has no click function');
			}
			return;
		} else {
			if( WAIT_CYCLES_COUNTER >= MAX_WAIT_CYCLES) { return; }
			WAIT_CYCLES_COUNTER++;
			setTimeout(function() {
				waitFor(selector, time);
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

		log('DEBUG', 'host:' + window.location.host);
		if(selector.url_regex !== window.location.host){ return; }

		if ( typeof selector.code !== 'string' ) { return; }
		if ( selector.code === '' ) { return; }

		log('DEBUG', JSON.stringify(selector,null,4));

		try {
			//const gen = new Function(selector.code); // build function
			waitFor(selector.code,100)
			 // execute function
			log('DEBUG', 'code executed:' + selector.code);
		}catch(e){
			log('WARN', 'code execution failed :' + selector.code);
		}
	});

})();
