
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

    const waitFor = (selector) => {

		log('debug', JSON.stringify(selector,null,4));

        if(selector.repeatdelay > 0 && selector.maxrepeats === 0) { return; }

        if(selector.maxrepeats > 0){
            selector.maxrepeats--;
        }

        for(const item of document.querySelectorAll(selector.cssselector)) {
            if(item) {
                if( typeof item.click === 'function') {
                    item.click(); // click item
                    log('debug', 'item clicked');
                }else{
                    log('warn','item has no click function');
                }
            }
        }

        if(selector.repeatdelay > 0) {
            const min = (selector.repeatdelay - selector.randomrepeatvariance);
            const max = (selector.repeatdelay + selector.randomrepeatvariance);
            const tovalue = ((max - min) > 0) ? getRandomInt(min, max) : selector.repeatdelay;
            log('debug','waitTime: ' + tovalue);
            setTimeout(function() {
                waitFor(selector);
            },tovalue);
        }
    } // waitFor end

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

        log('debug', JSON.stringify(selector,null,4));
        setTimeout(function() {
            selector.maxrepeats--; // negativ maxrepeats will continue forever
            waitFor(selector)
        }, selector.initaldelay || 3000); // wait initaldelay
    });

})();
