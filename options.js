
// button refs
const impbtnWrp = document.getElementById('impbtn_wrapper');
const impbtn = document.getElementById('impbtn');
const savbtn= document.getElementById('savbtn');
const expbtn = document.getElementById('expbtn');

savbtn.addEventListener('click', async function (evt) {
    let data = table.getData();
    let i=0;

    for(i=0; i<data.length;i++){
        if(data[i].action === 'Add'){
            data.splice(i,1);
            break;
        }
    }

    for(i=0; i<data.length;i++){
        data[i].initaldelay = parseInt(data[i].initaldelay);
        data[i].repeatdelay = parseInt(data[i].repeatdelay);
        data[i].randomrepeatvariance= parseInt(data[i].randomrepeatvariance);
    }
    // remove Add Row
    browser.storage.local.set({ 'selectors': data })
    savbtn.style.background='lightgreen';
});

expbtn.addEventListener('click', async function (evt) {
    var dl = document.createElement('a');
    let data = table.getData();
    for(let i=0; i<data.length;i++){
        if(data[i].action === 'Add'){
            data.splice(i,1);
            break;
        }
    }
    for(i=0; i<data.length;i++){
        data[i].initaldelay = parseInt(data[i].initaldelay);
        data[i].repeatdelay = parseInt(data[i].repeatdelay);
        data[i].randomrepeatvariance= parseInt(data[i].randomrepeatvariance);
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
                        urlregex: selector.url_regex || selector.urlregex || '',
                        action: 'Delete'
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


// formatter func for the action column
function btnFormatter(cell, formatterParams, onRendered){
    return '<button style="width:100%" >' + cell.getValue() + '</button>';
}

// onClick handler for the action cells
function actionHandler(e,cell) {
    switch( cell.getValue() ){
        case 'Add':
            cell.setValue("Delete",true);
            table.addRow({
                enabled: true,
                annotation: '',
                group: '#Default Group',
                tags: '',
                cssselector: '',
                initaldelay: 0,
                repeatdelay: 0,
                randomrepeatvariance: 0,
                urlregex: '',
                action: 'Add'
            },true);
            break;
        default:
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
            //table.redraw();
            break;
    }
}

function tagFilter(headerValue, rowValue, rowData, filterParams){
    console.log(headerValue, rowValue, rowData, filterParams);
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property
    //
    if(typeof rowValue !== 'string'){
        return true;
    }
    const tags = rowValue.split(", ");

    for(const tag of tags) {
        if(tag.includes(headerValue)){
            return true;
        }
    }
    return false;
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
            {column:"action", dir:"asc"},
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
            //{rowHandle:true, formatter:"handle", headerSort:false, frozen:true, width:30, minWidth:30},
            /*{formatter:"rowSelection", titleFormatter:"rowSelection", width:30, minWidth:30, hozAlign:"left", headerSort:false, cellClick:function(e, cell){
                cell.getRow().toggleSelect();
            }},*/
            {title:"Enabled", width: 100, field:"enabled", formatter: "tickCross", sorter:"boolean", headerHozAlign: "center",  hozAlign:"center", editor:true, editorParams: { tristate:false}},
            {title:"Group", field:"group", headerFilter:"input", headerFilterPlaceholder:"Filter by Group", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Annotation", field:"annotation", headerFilter:"input", headerFilterPlaceholder:"Filter by Annotation", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Tags", field:"tags", headerFilter:"input", headerFilterPlaceholder:"Filter by Tag/Label", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "bottom"}, headerFilterFunc:tagFilter },
            {title:"CSS Selector", field:"cssselector", headerFilter:"input", headerFilterPlaceholder:"Filter by CSS Selector",editor:"input"},
            {title:"Inital <br/>Delay", width: 100, field:"initaldelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer'] },
            {title:"Repeat <br/>Delay", width: 100, field:"repeatdelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']},
            {title:'<acronym title="Random Repeat Variance" style="text-decoration-style:dashed;">RRV</acronym>', headerSort: false, width: 120, field:"randomrepeatvariance", sorter:"number", editor:"input", validator: ['required','min:0', 'integer']},
            {title:'URL <acronym title="Regular Expression" style="text-decoration-style:dashed;">RegEx</acronym>', field:"urlregex",headerFilter:"input", headerFilterPlaceholder:"Filter by URL RegEx",editor:"input"},
            {title:"Action", width: 100, field:"action", hozAlign:"center", headerHozAlign: "center",  formatter: btnFormatter, headerSort: false, cellClick: actionHandler}
        ],
    });

    table.on("cellEdited", function(cell){
        if( cell.getRow().getData()['action'] !== 'Add') {
            const new_val = cell.getValue();
            const old_val = cell.getOldValue();
            if(new_val != old_val){
                savbtn.style.background='red';
            }
        }
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
}

async function getTblData() {
    let data = [];
    var res = await browser.storage.local.get('selectors');
    if ( Array.isArray(res.selectors) ) {
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
                urlregex: selector.url_regex || selector.urlregex || '',
                action: 'Delete'
            });
        });
    }
    return data;
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
