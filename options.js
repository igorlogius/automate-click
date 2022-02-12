
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
        layout:"fitDataStretch",      //fit columns to width of table
        responsiveLayout: "hide",  //hide columns that dont fit on the table
        tooltips:true,            //show tool tips on cells
        addRowPos:"top",          //when adding a new row, add it to the top of the table
        history:true,             //allow undo and redo actions on the table
        //pagination:"local",       //paginate the data
        pagination: false,       //paginate the data
        //paginationSize: 25,         //allow 7 rows per page of data
        //movableColumns:true,      //allow column order to be changed
        //resizableRows:true,       //allow row order to be changed
        movableRows: true,
        /*initialSort:[             //set the initial sort order of the data
            {column:"group", dir:"asc"},
            //{column:"action", dir:"asc"},
        ],*/
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
            {title:"Group", field:"group", headerFilter:"input", headerFilterPlaceholder:"Text filter", width:120, editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Tags", field:"tags", width: 120, headerFilter:"select", headerFilterPlaceholder:"Multiselect", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "bottom"} , headerFilterParams:{
                    values: tagValuesLookup, // get values
                    verticalNavigation:"hybrid", //navigate to new row when at the top or bottom of the selection lis
                    multiselect:true, //allow multiple entries to be selected
                }
            },
            {title:"Annotation", field:"annotation", maxWidth: 240, headerFilter:"input", headerFilterPlaceholder:"Text filter", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Inital <br/>Delay", width: 80, field:"initaldelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer'] },
            {title:"Repeat <br/>Delay", width: 80, field:"repeatdelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']},
            {title:'<acronym title="Random Repeat Variance" style="text-decoration-style:dashed;">RRV</acronym>', headerSort: false, width: 80, field:"randomrepeatvariance", sorter:"number", editor:"input", validator: ['required','min:0', 'integer']},
            {title:"CSS Selector", field:"cssselector", width:"25%",headerFilter:"input", headerFilterPlaceholder:"Text filter",editor:"input"},
            {title:'URL Regular Expression', width:"25%",field:"urlregex",headerFilter:"input", headerFilterPlaceholder:"Text filter",editor:"input"},
        ],
    });

    table.on("cellEdited", function(cell){
            const new_val = cell.getValue();
            const old_val = cell.getOldValue();
            if(new_val != old_val){
                savbtn.style.background='red';
            }
    });

    table.on("rowMoved", function(row){
        savbtn.style.background='red';
    });

    const data = await getTblData();
    data.forEach((e) => {
        table.addRow(e,true);
    });

    table.on("groupClick", function(e, group){
        const rows = group.getRows();
        for(const row of rows){
            row.toggleSelect();
        }
    });

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
            });
        });
    }
    return data;
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
