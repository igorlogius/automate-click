
// button refs
const impbtnWrp = document.getElementById('impbtn_wrapper');
const impbtn = document.getElementById('impbtn');
const savbtn= document.getElementById('savbtn');
const expbtn = document.getElementById('expbtn');
const delbtn = document.getElementById('delbtn');
const ablebtn = document.getElementById('ablebtn');
const addbtn = document.getElementById('addbtn');

addbtn.addEventListener('click', async function (evt) {

                table.addRow({
                    enabled: false,
                    group: '',
                    annotation: '',
                    tags: '',
                    cssselector: '',
                    initaldelay: 0,
                    repeatdelay: 0,
                    randomrepeatvariance: 0,
                    urlregex: '',
                    action: 'Add'
                },true);

        savbtn.style.background='red';
});

ablebtn.addEventListener('click', async function (evt) {
    let changed = false;
    const rows = table.getSelectedRows();
    for(const row of rows){
        const cell = row.getCell('enabled');
        if(cell.setValue(!cell.getValue())){
            changed = true;
        }
    }
    if(changed){
        savbtn.style.background='red';
    }
});

delbtn.addEventListener('click', async function (evt) {
    let changed = false;
    const rows = table.getSelectedRows();
    for(const row of rows){
        row.delete();
        changed = true;
    }
    if(changed){
        savbtn.style.background='red';
    }

});
savbtn.addEventListener('click', async function (evt) {
    let data = table.getData();
    let i=0;
    for(i=0; i<data.length;i++){
        // numbers need parsing ... for whatever reason
        data[i].initaldelay = parseInt(data[i].initaldelay);
        data[i].repeatdelay = parseInt(data[i].repeatdelay);
        data[i].randomrepeatvariance= parseInt(data[i].randomrepeatvariance);
        data[i].pos = i;
    }
    browser.storage.local.set({ 'selectors': data })
    savbtn.style.background='lightgreen';
});

expbtn.addEventListener('click', async function (evt) {
    var dl = document.createElement('a');
    var data = table.getSelectedData();
    for(i=0; i<data.length;i++){
        data[i].initaldelay = parseInt(data[i].initaldelay);
        data[i].repeatdelay = parseInt(data[i].repeatdelay);
        data[i].randomrepeatvariance= parseInt(data[i].randomrepeatvariance);
        data[i].pos = i;
    }
    const content = JSON.stringify(data,null,4);
    dl.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    dl.setAttribute('download', 'data.json');
    dl.setAttribute('visibility', 'hidden');
    dl.setAttribute('display', 'none');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
});

// delegate to real import Button which is a file selector
impbtnWrp.addEventListener('click', function(evt) {
	impbtn.click();
});

// read data from file into current table
impbtn.addEventListener('input', function (evt) {
	var file  = this.files[0];
	var reader = new FileReader();
	        reader.onload = async function(e) {
            try {
                var config = JSON.parse(reader.result);
                let imported_something = false;
                config.forEach( (selector) => {
                    table.addRow({
                        enabled: selector.activ || selector.enabled || false,
                        group: selector.group || '',
                        annotation: selector.annotation || '',
                        tags: selector.tags || '',
                        cssselector: selector.code || selector.cssselector || '',
                        initaldelay: parseInt(selector.delay || selector.initaldelay || 0),
                        repeatdelay: parseInt(selector.repeat || selector.repeatdelay || 0),
                        randomrepeatvariance: parseInt(selector.rvariance || selector.randomrepeatvariance || 0),
                        urlregex: selector.url_regex || selector.urlregex || ''
                    }, false);
                    imported_something = true;
                });
                if(imported_something) {
                    savbtn.style.background='red';
                }
            } catch (e) {
                console.error('error loading file: ' + e);
            }
        };
        reader.readAsText(file);
});

function tagValuesLookup (){
    const rows = table.getRows();
    const tags = [];
    for(const row of rows){
        const cell = row.getCell('tags');
        const vals = cell.getValue().split(/[\s,]+/);
        for(const val of vals){
            if(val !== ''){
                tags.push(val);
            }
        }
    }
    return tags;
}

async function onDOMContentLoaded() {

    table = new Tabulator("#mainTable", {
        height: "100%",
        layout:"fitColumns",      //fit columns to width of table
        //responsiveLayout:"hide",  //hide columns that dont fit on the table
        responsiveLayout: false,  //hide columns that dont fit on the table
        //tooltips:true,            //show tool tips on cells
        addRowPos:"top",          //when adding a new row, add it to the top of the table
        //history:true,             //allow undo and redo actions on the table
        //pagination:"local",       //paginate the data
        pagination: false,       //paginate the data
        //paginationSize: 25,         //allow 7 rows per page of data
        //movableColumns:true,      //allow column order to be changed
        //resizableRows:true,       //allow row order to be changed
        movableRows: true,
        initialSort:[             //set the initial sort order of the data
            {column:"group", dir:"asc"},
            //{column:"action", dir:"asc"},
        ],
        groupBy: "group",
        groupUpdateOnCellEdit:true,
        /*groupStartOpen:function(value, count, data, group){
            //value - the value all members of this group share
            //count - the number of rows in this group
            //data - an array of all the row data objects in this group
            //group - the group component for the group

            return count < 3; //all groups with less than three rows start open, any with three or less start closed
        },*/
        groupStartOpen: true,
        layoutColumnsOnNewData:true,
        columns:[
            {rowHandle:true, formatter:"handle", headerSort:false, frozen:true, width:30, minWidth:30, },
            {formatter:"rowSelection", titleFormatter:"rowSelection", width:30, minWidth:30, hozAlign:"left", headerSort:false, cellClick:function(e, cell){
                cell.getRow().toggleSelect();
            }},
            {title:"Enabled", width: 100, field:"enabled", formatter: "tickCross", sorter:"boolean", headerHozAlign: "center",  hozAlign:"center", editor:true, editorParams: { tristate:false}},
            {title:"Group", field:"group", headerFilter:"input", headerFilterPlaceholder:"Textfilter", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Annotation", field:"annotation", headerFilter:"input", headerFilterPlaceholder:"Textfilter", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Tags", field:"tags", headerFilter:"select", headerFilterPlaceholder:"Multiselect", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "bottom"} , headerFilterParams:{
                values: tagValuesLookup, // get values
                verticalNavigation:"hybrid", //navigate to new row when at the top or bottom of the selection lis
                multiselect:true, //allow multiple entries to be selected

            }


            },
            {title:"CSS Selector", field:"cssselector", headerFilter:"input", headerFilterPlaceholder:"Textfilter",editor:"input"},
            {title:"Inital <br/>Delay", width: 100, field:"initaldelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer'] },
            {title:"Repeat <br/>Delay", width: 100, field:"repeatdelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']},
            {title:'<acronym title="Random Repeat Variance" style="text-decoration-style:dashed;">RRV</acronym>', headerSort: false, width: 120, field:"randomrepeatvariance", sorter:"number", editor:"input", validator: ['required','min:0', 'integer']},
            {title:'URL <acronym title="Regular Expression" style="text-decoration-style:dashed;">RegEx</acronym>', field:"urlregex",headerFilter:"input", headerFilterPlaceholder:"Textfilter",editor:"input"}
            //{title:"Single Action", width: 100, field:"action", hozAlign:"center", headerHozAlign: "center",  formatter: btnFormatter, headerSort: false, cellClick: actionHandler}
        ],
    });

    table.on("cellEdited", function(cell){
        //if( cell.getRow().getData()['action'] !== 'Add') {
            const new_val = cell.getValue();
            const old_val = cell.getOldValue();
            if(new_val != old_val){
                savbtn.style.background='red';
            }
        //}
    });

    table.on("rowMoved", function(row){
        //row - row component
        savbtn.style.background='red';
    });

    /*
    table.on("rowMoved", function(row){
        //row - row component
        var rowData = row.getData();
        console.log(row.getPosition(), JSON.stringify(rowData,null,4));
        if(rowData.action === 'Add') {
            //table.moveRow(2,true);
        }
    });
    */

    const data = await getTblData();

    data.forEach((e) => {
        table.addRow(e,true);
    });

    // add input row
    /*
    table.addRow({
            enabled: true,
            group: '#Default Group',
            annotation: '',
            tags: '',
            cssselector: '',
            initaldelay: 1000,
            repeatdelay: 0,
            randomrepeatvariance: 0,
            urlregex: '',
            action: 'Add'
        },true);
        */



    /*
    table.on("dataGrouped", function(groups){
        //groups - array of top level group components
    });
    */

    /*
    table.on("movableRowsSent", function(fromRow, toRow, toTable){
        console.log(fromRow,toRow);
        //fromRow - the row component from the sending table
        //toRow - the row component from the receiving table (if available)
        //toTable - the Tabulator object for the receiving table
        //const rows = table.searchRows("action", "=","Add");
        //rows[0].move(1, true);
    });
    */

    table.on("groupClick", function(e, group){
        //e - the click event object
        //group - group component
        console.log('groupClick');

        const rows = group.getRows();
        for(const row of rows){

            //const cell = row.getCell("enabled");
            //cell.setValue(!cell.getValue())
            row.toggleSelect();

        }
    });

    /*
    table.on("dataSorted", function(_sorters, _rows){
        //sorters - array of the sorters currently applied
        //rows - array of row components in their new order
            const rows = table.searchRows("action", "=","Add");
            rows[0].delete();
            cell.getRow().delete().then(function() {
                browser.storage.local.set({ 'selectors': table.getData() })
                table.addRow({
                    enabled: true,
                    group: '#Default Group',
                    annotation: '',
                    tags: '',
                    cssselector: '',
                    initaldelay: 0,
                    repeatdelay: 0,
                    randomrepeatvariance: 0,
                    urlregex: '',
                    action: 'Add'
                },true);
                savbtn.style.background='red';
            });

    });
    */
}

async function getTblData() {
    let data = [];
    var res = await browser.storage.local.get('selectors');

    if ( Array.isArray(res.selectors) ) {
        res.selectors.sort(function(b,a){
            // > 0 => b before a
            // < 0 => a before b
            // === 0 => keep original order of a and b

            if(typeof a.pos === 'undefined' && typeof b.pos === 'number'){
                return 1; // b before a
            }
            if(typeof a.pos === 'number' && typeof b.pos === 'undefined'){
                return -1; // a before b
            }

            if(typeof a.pos === 'number' && typeof b.pos === 'number'){
                if(a.pos > b.pos){
                    return 1;
                }
                if(a.pos < b.pos){
                    return -1;
                }
            }
            // if in doubt, do nothing :) , also covers  double undeinfed and a === b
            return 0;

        });
        res.selectors.forEach( (selector) => {
            data.push({
                enabled: selector.activ || selector.enabled || false,
                annotation: selector.annotation || '',
                tags: selector.tags || '',
                group: selector.group || '',
                cssselector: selector.code || selector.cssselector || '',
                initaldelay: selector.delay || selector.initaldelay || 1000,
                repeatdelay: selector.repeat || selector.repeatdelay || 0,
                randomrepeatvariance: parseInt(selector.rvariance || selector.randomrepeatvariance || 0),
                urlregex: selector.url_regex || selector.urlregex || ''
                //action: 'Delete'
            });
        });
    }
    return data;
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
