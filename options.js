$(document).ready(function() {

	/*
	const dateFormat = "yy-mm-dd";

	$.fn.dataTable.ext.search.push(
		function( settings, data, dataIndex ) {

			const min = (function() {
				const from_str = $('#from').val();
				if(from_str !== "" ) {
					try {
						const date = $.datepicker.parseDate( dateFormat, from_str);
						return parseInt( date.getTime(), 10 );
					}catch(e){
						console.error(e);
					}
				}
				return NaN;
			})();

			const max = (function() {
				const to_str = $('#to').val();
				if(to_str !== "" ) {
					try {
						const date = $.datepicker.parseDate( dateFormat, to_str);
						return parseInt( date.getTime(), 10 );
					}catch(e){
						console.error(e);
					}
				}
				return NaN;
			})();

			const age = parseFloat( data[0] ) || 0; // use data for the age column

			console.log('min: ' + min, " max: ", max, " value: ", data[0]);

			return ( ( isNaN( min ) && isNaN( max ) ) ||
				( isNaN( min ) && age <= max ) ||
				( min <= age   && isNaN( max ) ) ||
				( min <= age   && age <= max ) );
		});
	*/

	console.log('init mainTable');

	let table = $('#mainTable').DataTable( {
		'columnDefs': [
			{ orderable: false , targets: 2}
		],
		'processing': true,
		'language': {
			//'processing': '<div id="outerProgress"><div id="innerProgress"></div></div>',
			'loadingRecords': "Loading,<br/>please wait"
		},
		"deferRender": true,
		"stateSave": true,
		"ajax": async function(data, callback, settings)  {

			//var res = await browser.storage.local.get('selectors');
			//
			const rows = [
				{
					// activ, desc, selector, delay, repeat, url-regex, actions
					 'activ': true
					,'desciption': ''
					,'selector': ''
					,'delay': 1000
					,'repeat': 0
					,'regex': ''
					
				}

			];

			callback({data: rows});
		},
		"dom": '<"top"flip>rt<"bottom"flip>',
		"lengthMenu": [ [25, 50, 100, 250, 500, -1], [25, 50, 100, 250, 500, "All"] ],
		"columns": [
			{ "data": "activ"
				, "render": function(data, type, row, meta) {
					return type === 'display' ? '<input style="width:98%;" type="checkbox" '+(data?'checked':'')+' />' : data;
				}
			}
			,{ "data": "desciption"
				, "render": function(data, type, row, meta) {
					return type === 'display' ? '<input style="width:98%;" type="text" value="' + data + '" />' : data;
				}
			}
			,{ "data": "selector"
				, "render": function(data, type, row, meta) {
					return type === 'display' ? '<input style="width:98%;" type="text" value="' + data + '" />' : data;
				}
			}
			,{ "data": "delay"
				,"render": function(data, type,row, meta) {
					return type === 'display' ? '<input type="number" value="' +data+ '" />' : data;
				}
			}
			,{ "data": "repeat"
				,"render": function(data, type,row, meta) {
					return type === 'display' ? '<input type="number" value="' +data+ '" />' : data;
				}
			}
			,{ "data": "regex"
				, "render": function(data, type, row, meta) {
					return type === 'display' ? '<input style="width:98%;" type="text" value="' + data + '" />' : data;
				}
			}
		]
	});

	$('#myTable tbody').on( 'click', 'tr', function () {
		$(this).toggleClass('selected');
	});

	/*
	$('#removeDisplayed').click(function() {
		const filteredRows = table.rows({page: 'current', filter: 'applied'});
		const filteredRows_data = filteredRows.data();
		const filteredRows_len = filteredRows_data.length;
		if(filteredRows_len < 1){
			alert('nothing to delete on the current page');
			return;
		}
		if (!confirm('Are you sure you want delete all displayed (aka. currently visible) entries?')) {
			return;
		}
		filteredRows.remove().draw();
		for(let i = 0;i < filteredRows_len;++i) {
			idbKeyval.del(filteredRows_data[i].url);
		}
	});

	$('#removeSelected').click( function () {
		const filteredRows = table.rows('.selected'); 
		const filteredRows_data = filteredRows.data();
		const filteredRows_len = filteredRows_data.length;
		if(filteredRows_len < 1){
			alert('no rows selected');
			return;
		}
		if (!confirm('Are you sure you want delete the selected entries?')) {
			return;
		}
		filteredRows.remove().draw();
		for(let i = 0;i < filteredRows_len;++i) {
			idbKeyval.del(filteredRows_data[i].url);
		}
	});

	let from = $( "#from" )
		.datepicker({
			dateFormat: dateFormat,
			//defaultDate: "+1w",
			changeMonth: true,
			changeYear: true,
			numberOfMonths: 1
		})
		.on( "change", function() {
			to.datepicker( "option", "minDate", getDate( this ) );
			table.draw();
		});

	let to = $( "#to" ).datepicker({
		dateFormat: dateFormat,
		//defaultDate: "+1w",
		changeMonth: true,
		changeYear: true,
		numberOfMonths: 1
		})
		.on( "change", function() {
			from.datepicker( "option", "maxDate", getDate( this ) );
			table.draw();
		});

	$('#resetFrom').click(function(){ $('#from').val(''); table.draw();});
	$('#resetTo').click(function(){ $('#to').val('');table.draw(); });

	function getDate( element ) {
			console.log('getDate',element.value);
		try {
			return $.datepicker.parseDate( dateFormat, element.value );
		} catch( error ) {
			console.error(error);
		}
		return null;
	}

	*/

} );

