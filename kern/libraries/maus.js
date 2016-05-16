 var win = window, doc = win.document, gespeicherte_strings = {};

function get_store_str(key) { return gespeicherte_strings[key]; }
function set_store_str(key, val) { gespeicherte_strings[key] = val; }

function show(str_oder_obj) { // Hilfsfunktion
var k, keys, so = str_oder_obj, r = [];
if (typeof so === 'object') {
keys = Object.keys(so);
for (k = 0; k < keys.length; k += 1) { r.push(keys[k] + ":" + so[keys[k]]); }
win.alert(r.join('\n'));
} else { win.alert(so); }
}

function get_dom_str(id) {
var node = doc.getElementById(id), tn = node.tagName.toLowerCase(), r = "";
if (tn === 'input' || tn === 'textarea') { r = node.value; } else { r = node.innerHTML; }
return r;
}

function set_dom_str(id, str) {
var node = doc.getElementById(id), tn = node.tagName.toLowerCase();
if (tn === 'input' || tn === 'textarea') { node.value = str; } else { node.innerHTML = str; }
}

function test_func_get_split_obj(src) {
var i, j, k, v, t, av, ak, av_len, ak_len, a, r = {},
del_comments = /\/\/[^\n]*/g,
re_src = /\s*~\s*/,
re_keys = ":",
re_num1g = /[\;\,\|\s\/\(\)]+/g, //(1/1), (1|-0.1e1),
re_num2g = /[^ +-\.e\d]+/g,
re_num2 = /[^ +-\.e\d]/,
re_num3 = / +/;
src = src.replace(/\r/g, '').replace(del_comments, '').trim();
a = src.split(re_src); a.shift(1);
if ((a.length % 2)===1) { show(" keine gerade Anzahl von ~"); }
for (i = 0; i < a.length - 1; i += 2) {
k = a[i].replace(/\s+/g, "").trim();
v = a[i + 1].trim();
t = v.replace(re_num1g, " ").trim();
if (re_num2.test(t.replace(re_num1g, ""))) {
r[k] = v; // string
} else { // numbers
av = t.split(re_num3); av_len = av.length;
ak = k.split(re_keys); ak_len = ak.length;
if (ak_len && ak_len !== av_len) {
for (j = 0; j < av_len; j += 1) { av[j] = parseFloat(av[j]); } r[k] = av;
} else {
for (j = 0; j < ak_len; j += 1) { r[ak[j]] = parseFloat(av[j]); }
}
}
} return r;
}



function show(obj) {
var o, type, r = [], k, key, keys = Object.keys(obj);

//if (!keys.length) { keys = Object.getOwnPropertyNames(obj); }
//for (key in obj) { if (obj.hasOwnProperty(key)) {o = obj[key];type = typeof o;r.push(key + " (" + type + "):" + o);}
//} return r.join('\n');

for (k = 0; k < keys.length; k += 1) { key = keys[k]; o = obj[key];
type = Array.isArray(o) ? "array" : typeof o;
r.push(key + " (" + type + "):" + o );
} return r.join('\n');

}


///////////////////////////////////
/// maus-Bibliothek ( ein Anfang )
///////////////////////////////////
var maus = (function (win) {
    "use strict";
    var doc = win.document, 
    M = {
        ID: null, CANVAS: null, CTX: null, RECT: null,
        downs: [],
        ups: [],
        moves: [],
        A: 4, // Default-Circle-Marker-Radius
        B: 9 // Default-Quadrat-Marker-Länge
    }, MAX_MOVE_LEN = 1000, MAX_DOWN_LEN = 200, MAX_UP_LEN = 200, DEBUGGING = 1;  // Maus-Buffer

    function set_prop(obj, o) {// z.B. maus.set_prop(M, {inside:1, is_down:0} )
        var k, key, keys = Object.keys(o);
        for (k = 0; k < keys.length; k += 1) { key = keys[k]; obj[key] = o[key]; }
    }

    function get_ctx(id) { id = id || M.ID; return doc.getElementById(id).getContext('2d'); }
    function set_ctx(id) { M.ID = id; M.CTX = get_ctx(id); }

    //if(!el){el = doc.getElementById(M.id);} //M.ctx = cnv.getContext('2d');
    //cnv.style.padding = '0';
    //cnv.style.margin = '0';
    //cnv.style.cursor = 'pointer';

    function get_all() { return M; }
    function get_ij_downs() { return M.downs; }
    function get_ij_ups() { return M.ups; }
    function get_ij_moves() { return M.moves; }

    function loesche_alle_ij_arrays() { M.moves = []; M.downs = []; M.ups = []; }
    function loesche_die_canvas_flaeche() { M.CTX.clearRect(0, 0, M.CTX.canvas.width, M.CTX.canvas.height);}


    function add_event(evt_name, func_pre, func_post) { // global ist M = Mause-Objekt
        M.CANVAS = doc.getElementById(M.ID);// M global

        M.CANVAS.addEventListener(evt_name, function (event) { 
            event = event || win.event; if (func_pre) { func_pre(event); }
        // alert(show(event)); 
        M.CANVAS = event.target || event.srcElement; // M global
        if (M.CANVAS.id !== M.ID) { return; }
        M.CTX = M.CANVAS.getContext('2d');

        M.RECT = M.CANVAS.getBoundingClientRect();
        M.type = event.type;
        M.w = M.CANVAS.width;
        M.h = M.CANVAS.height;
        M.i = event.clientX - M.RECT.left; // M.i = parseInt(event.clientX - rect.left, 10);
        M.j = event.clientY - M.RECT.top;  // M.j = parseInt(event.clientY - rect.top, 10);
        M.inside = !((M.i < 0) || (M.j < 0) || (M.i > M.w) || (M.j > M.h));

        if (M.moves.length > MAX_MOVE_LEN) { M.moves.shift(); M.moves.shift(); }

        switch (M.type) {
            case "mousedown": M.mousedown = 1; M.mouseup = 0; M.downs.push(M.i); M.downs.push(M.j); M.moves = []; /* später ??? */break;
            case "mousemove": if (M.mousedown && !M.mouseup) { M.moves.push(M.i); M.moves.push(M.j); } break;
            case "mouseup": M.mouseup = 1; M.mousedown = 0; M.ups.push(M.i); M.ups.push(M.j);/* später???: M.moves = [];*/ break;
            default: alert("EVENT???");break;
        }
        if (func_post) { func_post(event); }

        if (DEBUGGING) { // automatische Kontroll-Anzeige
            set_dom_str("TA0", show(get_all()));
            switch (M.type) {
                case "mousedown": draw_ij_marker({ figur: "kreis", i: M.i, j: M.j, r: M.A, fillStyle: '#00f' }); break;
                case "mousemove": draw_ij_lines(M.moves); break;
                case "mouseup": draw_ij_marker({ figur: "qadrat", i: M.i, j: M.j, w: M.B, h: M.B, strokeStyle: '#0f0' }); break;
                default: break;
            }
        }

        }, false);

    }



    function draw_canvas_gitter(m,n) { // m = anz der Spalten, n = anz der Streifen 
        var ctx = get_ctx(M.ID), cnv = ctx.canvas, w = cnv.width, h = cnv.height, i0, j0, di, dj, t;
        m = m || 17;
        n = n || 17;
        
        di = Math.floor(w / m); i0 = Math.round((w - m * di) / 2);
        dj = Math.floor(h / n); j0 = Math.round((h - n * dj) / 2);
        
        ctx.beginPath();
        for (t = i0; t < w; t += di) { ctx.moveTo(t, j0); ctx.lineTo(t, h - j0); }
            for (t = j0; t < h; t += dj) { ctx.moveTo(i0, t); ctx.lineTo(w - i0, t); }
                ctx.strokeStyle = "#edf";
            ctx.stroke();
            ctx.strokeStyle = "#000";
        }


    function gerasterte_ij_maus_punkte(arr, m, n) { // m = anz der Spalten, n = anz der Streifen 
    //  i = di * Math.round((i-i0)/di);
    //  i = di * Math.round((i-i0)/di);
    }


    function draw_ij_marker(o) {
        // Bsp: o = {figur:"kreis", i:, j:, r:, strokeStyle:'#00f', fillStyle:'#f00'}
        // Bsp: o = {figur:"qadrat", i:, j:, w:, h: ,strokeStyle:'#00f', fillStyle:'#f00'}
        var ctx = get_ctx(M.ID), sav,  fig = 'kreis';  if (o["w"] && typeof o.w === "number") { fig = "qadrat"; }
        ctx.beginPath();
        if (fig === "kreis") { o.r = o.r || M.B; ctx.arc(o.i, o.j, o.r, 0, Math.PI * 2, true); }
        if (fig === "qadrat") { o.w = o.w || M.B; o.h = o.h || M.B; ctx.rect(o.i-o.w/2, o.j-o.h/2, o.w, o.h);  }
        if (o.fillStyle) { sav = ctx.fillStyle; ctx.fillStyle = o.fillStyle; ctx.fill(); ctx.fillStyle = sav; }
        if (o.strokeStyle) { sav = ctx.strokeStyle; ctx.strokeStyle = o.strokeStyle; ctx.stroke(); ctx.strokeStyle = sav; }
    }

    function draw_ij_lines(arr, id) {// arr = [i0,j0, i1,j1,...]
        var t, ctx, len = arr.length, ctx = get_ctx(M.ID);
        
        ctx.beginPath();
        for (t = 0; t < len-1; t += 2) {
            if (t === 0) {ctx.moveTo(arr[t], arr[t + 1]);} else {ctx.lineTo(arr[t], arr[t + 1]);}
        }
        ctx.closePath();
        ctx.stroke();
    }


    return { // maus-Objekt als Rückgabe

        add_event: add_event,

        get_ij_downs: get_ij_downs,
        get_ij_ups: get_ij_ups,
        get_ij_moves: get_ij_moves,

        set_prop: set_prop,
        get_all: get_all, // get_all gibt M-Objekt zurück


        set_ctx:set_ctx,

        draw_canvas_gitter:draw_canvas_gitter,
        draw_ij_lines:draw_ij_lines,

        loesche_alle_ij_arrays: loesche_alle_ij_arrays,
        loesche_die_canvas_flaeche: loesche_die_canvas_flaeche,
        version: '2016'
    };
    }(window));  // ende