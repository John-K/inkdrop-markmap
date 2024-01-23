"use strict";

const ink = require('inkdrop')
const BrowserWindow = ink.remote.BrowserWindow
const mm = require('markmap-lib/dist/transform.js')
module.exports = {
  renderDoc
}

function renderDoc() {
    const { editingNote } = inkdrop.store.getState()
    if (editingNote == null) {
        console.log("MarkMap->renderDoc: cannot access current note")
        return
    }
    var error = null
    var root_node = null
    console.log(mm)
    try {
        const { root, features } = mm.transform(editingNote.body)
        root_node = root
        console.log(root)
    } catch (e) {
        error = e
    }

    const document1 = `<html><head>
    <title>${editingNote.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-view"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.15"></script>
    <script src="https://cdn.jsdelivr.net/npm/markmap-toolbar"></script>
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> -->
    <script>
    const { Transformer } = window.markmap;
    const { Markmap, loadCSS, loadJS } = markmap;
    const { Toolbar } = markmap;

    var aspectRatio = null;

    function render() {
        console.log("in render");
        const doc = \`${editingNote.body.replaceAll('`', '\\\`')}\`;
        t = new Transformer();
        const { root, features } = t.transform(doc);
        const { styles, scripts } = t.getUsedAssets(features);

        if (styles) loadCSS(styles);
        if (scripts) loadJS(scripts, { getMarkmap: () => markmap });

        el_svg = document.getElementById('markmap-svg');
        mm = Markmap.create(el_svg, null, root);
        aspectRatio = mm.state.maxY / mm.state.maxX;
        mm.fit()
        const { el } = Toolbar.create(mm);
        el.style.position = 'absolute';
        el.style.bottom = '0.5rem';
        el.style.right = '0.5rem';
        el_div = document.getElementById('svg_inner');
        el_div.append(el);
    }
    function resizeSVG() {
        const el_svg = document.getElementById('markmap-svg');
        //console.log("Resizing svg from" + el_svg.style.width + " x " + el_svg.style.height);
        var width = Math.ceil(window.innerWidth * 0.98)
        el_svg.style.width = width+"px";
        el_svg.style.height = Math.ceil(width / aspectRatio * 2)+"px"
        //console.log("Resized svg to" + el_svg.style.width + " x " + el_svg.style.height);
    }
    </script></head><body onload="render();" onresize="resizeSVG()">
    <div className="markmap-diagram" style="width: 100%; height: 100%">
    <div id='svg_inner' style="width: 100%; height: 100%">
        <svg id="markmap-svg" style="width: 100%; height: 100%"></svg>
    </div>`
    var document3 = ""
    if (error) {
        document3 += `<div className="ui error message">
            <div className="header">Failed to render Markmap</div>
            <div><pre>${error.message}</pre></div>
           </div>`
    }
    const document4 = `</div>
    </body></html>`

    const win = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true })
    // uncomment to view script errors in new window
    //win.openDevTools();
    const content = document1+document3+document4;
    win.loadURL("data:text/html;charset=utf-8,"+encodeURIComponent(content),
    { baseURLForDataURL: `file://${__dirname}/app/`})
}

