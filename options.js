
const extId = 'AC';
const temporary = browser.runtime.id.endsWith('@temporary-addon');

const log = (level, msg) => {
    level = level.trim().toLowerCase();
    if (['error','warn'].includes(level)
        || ( temporary && ['debug','info','log'].includes(level))
    ) {
        console[level]('[' + extId + '] [' + level.toUpperCase() + '] ' + msg);
        return;
    }
}

let table = null;

// button refs
const impbtnWrp = document.getElementById('impbtn_wrapper');
const impbtn = document.getElementById('impbtn');
const savbtn= document.getElementById('savbtn');
const discbtn= document.getElementById('discbtn');
const expbtn = document.getElementById('expbtn');
const delbtn = document.getElementById('delbtn');
const ablebtn = document.getElementById('ablebtn');
const addbtn = document.getElementById('addbtn');
const tgladv = document.getElementById('tgladv');


function hightlightChange(){
    savbtn.style.borderColor='red';
}

function unhightlightChange(){
    savbtn.style.borderColor='';
}

tgladv.addEventListener('click', async function (evt) {
    table.toggleColumn('tags');
    //table.toggleColumn('annotation');
    table.toggleColumn('repeatdelay');
    table.toggleColumn('maxrepeats');
    table.toggleColumn('randomrepeatvariance');
    table.toggleColumn('xclickpos');
    table.toggleColumn('yclickpos');
});

function addNewRowWithData(regex) {
    console.log('addNewRowWithData', regex);
    table.deselectRow();
    table.addRow({
        enabled: true,
        group: '',
        annotation: '',
        tags: '',
        cssselector: '',
        initaldelay: 1000,
        repeatdelay: 0,
        maxrepeats: 0,
        randomrepeatvariance: 0,
        urlregex: regex,
        xclickpos: 0,
        yclickpos: 0
    },true);
    hightlightChange();
}

addbtn.addEventListener('click', async function (evt) {
    table.deselectRow();
    table.addRow({
        enabled: true,
        group: '',
        annotation: '',
        tags: '',
        cssselector: '',
        initaldelay: 1000,
        repeatdelay: 0,
        maxrepeats: 0,
        randomrepeatvariance: 0,
        urlregex: '',
        xclickpos: 0,
        yclickpos: 0
    },true);
    hightlightChange();
});

ablebtn.addEventListener('click', async function (evt) {
    let changed = false;
    table.getSelectedRows().forEach( (row) => {
        const cell = row.getCell('enabled');
        if(cell.setValue(!cell.getValue())){
            changed = true;
        }
    });
    if(changed){
        hightlightChange();
    }
});

delbtn.addEventListener('click', async function (evt) {
    let changed = false;
    table.getSelectedRows().forEach( (row) =>  {
        row.delete();
        changed = true;
    });
    if(changed){
        hightlightChange();
    }
});

discbtn.addEventListener('click', (evt)=> {
    if (!window.confirm("Discard changes?")) {
        return;
    }
    window.location.reload();
});

savbtn.addEventListener('click', (evt)=> {
    if (!window.confirm("Save changes?")) {
        return;
    }
    let data = table.getData();
    let i=0;
    for(i=0; i<data.length;i++){
        // numbers need parsing ... for whatever reason
        data[i].initaldelay = parseInt(data[i].initaldelay);
        data[i].repeatdelay = parseInt(data[i].repeatdelay);
        data[i].maxrepeats = parseInt(data[i].maxrepeats);
        data[i].xclickpos = parseInt(data[i].xclickpos);
        data[i].yclickpos = parseInt(data[i].yclickpos);
        data[i].randomrepeatvariance= parseInt(data[i].randomrepeatvariance);
        data[i].idx = i;
    }
    browser.storage.local.set({ 'selectors': data })
    unhightlightChange();
});

expbtn.addEventListener('click', async function (evt) {

    let selectedRows = table.getSelectedRows();

    // order the selected by position

    selectedRows.sort( (a,b) => {
        return b.getPosition() - a.getPosition();
    });


    let idx_count = 0;

    // fixup the export data
    const expData = [];
    selectedRows.forEach( (row) => {
        const rowData = row.getData();
        rowData.initaldelay = parseInt(rowData.initaldelay);
        rowData.repeatdelay = parseInt(rowData.repeatdelay);
        rowData.maxrepeats = parseInt(rowData.maxrepeats);
        rowData.randomrepeatvariance= parseInt(rowData.randomrepeatvariance);
        rowData.idx = idx_count;
        expData.push(rowData);
    });
    const content = JSON.stringify(expData,null,4);
    console.log(content);
    let dl = document.createElement('a');
    const href = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
    dl.setAttribute('href', href);
    dl.setAttribute('download', extId + '-rules.json');
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
                        initaldelay: parseInt(selector.delay || selector.initaldelay || 1000),
                        repeatdelay: parseInt(selector.repeat || selector.repeatdelay || 0),
                        maxrepeats: parseInt(selector.maxrepeats || 0),
                        randomrepeatvariance: parseInt(selector.rvariance || selector.randomrepeatvariance || 0),
                        urlregex: selector.url_regex || selector.urlregex || '',
                        xclickpos: 0,
                        yclickpos: 0,
                    }, false);
                    imported_something = true;
                });
                if(imported_something) {
                    hightlightChange();
                }
            } catch (e) {
                log('ERROR','error loading file ' + e);
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
            if(val !== '' && !tags.includes(val)){
                tags.push(val);
            }
        }
    }
    return tags;
}

async function onDOMContentLoaded() {

    table = new Tabulator("#mainTable", {
        //height: "100%",
        virtualDom: false, //disable virtual DOM rendering
        layout: "fitDataStretch",  //fit columns to width of table
        responsiveLayout: "hide", //hide columns that dont fit on the table
        pagination: false,  //paginate the data
        movableRows: true,
        groupBy: "group",
        groupUpdateOnCellEdit:true,
        groupStartOpen: false,
        initialSort: [
            {column: "group", dir: "asc"},
        ],
        columns:[
            {rowHandle:true, formatter:"handle", headerSort:false, frozen:true, width:30, minWidth:30, },
            {formatter:"rowSelection", titleFormatter:"rowSelection", width:30, minWidth:30, hozAlign:"left", headerSort:false, cellClick:function(e, cell){
                cell.getRow().toggleSelect();
            }},
            {title:"Enabled", width: 100, field:"enabled", formatter: "tickCross", sorter:"boolean", headerHozAlign: "center",  hozAlign:"center", editor:true, editorParams: { tristate:false}},
            {title:"Group", field:"group", headerFilter:"input", headerFilterPlaceholder:"Text filter", width:120, editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}},
            {title:"Tags", field:"tags", width: 120, headerFilter:"select", headerFilterPlaceholder:"Multiselect", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "bottom"} , headerFilterParams:{
                    values: tagValuesLookup, // get values
                    verticalNavigation:"hybrid", //navigate to new row when at the top or bottom of the selection list
                    multiselect:true, //allow multiple entries to be selected
                }
                , visible: false
            },
            {title:"Annotation", field:"annotation", maxWidth: 240, headerFilter:"input", headerFilterPlaceholder:"Text filter", editor:"input", sorter: "string", sorterParams: {locale: true, alignEmptyValues: "top"}
                ,visible : true
            },
            {title:"Inital <br/>Delay", width: 80, field:"initaldelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer'] },
            {title:"Repeat <br/>Delay", width: 80, field:"repeatdelay", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']
                ,visible : false
            },
            {title:"Max <br/>Repeats", width: 80, field:"maxrepeats", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']
                ,visible : false
            },
            {title:'<acronym title="Random Repeat Variance" style="text-decoration-style:dashed;">RRV</acronym>', headerSort: false, width: 80, field:"randomrepeatvariance", sorter:"number", editor:"input", validator: ['required','min:0', 'integer']
                ,visible : false
            },
            {title:"X-Click<br/>Position", width: 80, field:"xclickpos", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']
                ,visible : false
            },
            {title:"Y-Click<br/>Position", width: 80, field:"yclickpos", sorter:"number", editor:"input", headerSort: false, validator: ['required','min:0', 'integer']
                ,visible : false
            },
            {title:'CSS Selector*', field:"cssselector", width:"25%",headerFilter:"input", headerFilterPlaceholder:"Text filter",editor:"textarea", editorParams: { verticalNavigation: "editor", } ,formatter: "plaintext"
            },
            {title:'URL Regular Expression*', width:"25%",field:"urlregex",headerFilter:"input", headerFilterPlaceholder:"Text filter",editor:"input"
            }
        ],
    });


    // Load data
    const data = await getTblData();
    data.forEach((e) => {
        table.addRow(e,true);
    });

    /**
     * Register Table Events
     */
    // hlchange if values change
    table.on("cellEdited", function(cell){
        if(cell.getValue() !== cell.getOldValue()){
            hightlightChange();
        }
    });

    // todo: determine if the row actually moved
    table.on("rowMoved", function(row){
        hightlightChange();
    });

    // invert the selected state of each row
    table.on("groupClick", function(e, group){
        group.getRows().forEach( (row) => {
            row.toggleSelect();
        });
    });

    // after adding a row, open the group it is in and highlight/select it
    table.on("rowAdded", function(row){
        var group = row.getGroup();
        group.show();
        row.select();
    });

    let params = (new URL(document.location)).searchParams;
    let url = params.get('url'); // is the string "Jonathan Smith".


    if(url) {

        let regex = "^" + url.replaceAll("/","\\/");
            regex = regex.replaceAll('.','\\.');
            regex = regex + ".*";
            //console.log('regex', regex);

        //let origin =  (new URL(url)).origin;
        //todo: maybe make permission requeste based on this, problem is, that regex might match multiple domains ... but to be fair that is pretty unlikely ... so maybe its ok?

        addNewRowWithData(regex);
    }

}

async function getTblData() {
    let data = [];
    var res = await browser.storage.local.get('selectors');

    if ( Array.isArray(res.selectors) ) {
        res.selectors.sort(function(b,a){
            // > 0 => b before a
            // < 0 => a before b
            // === 0 => keep original order of a and b

            if(typeof a.idx === 'undefined' && typeof b.idx === 'number'){
                return 1; // b before a
            }
            if(typeof a.idx === 'number' && typeof b.idx === 'undefined'){
                return -1; // a before b
            }

            if(typeof a.idx === 'number' && typeof b.idx === 'number'){
                if(a.idx > b.idx){
                    return 1;
                }
                if(a.idx < b.idx){
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
                maxrepeats: selector.maxrepeats || 0,
                randomrepeatvariance: parseInt(selector.rvariance || selector.randomrepeatvariance || 0),
                urlregex: selector.url_regex || selector.urlregex || '',
                xclickpos: selector.xclickpos|| 0,
                yclickpos: selector.yclickpos|| 0
            });
        });
    }
    return data;
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
