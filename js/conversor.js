const parse = require('csv-parse');
const $ = require('jquery');

let csvEditor;
let kmlEditor;


/**
 * Toma el valor del editor de CSV y genera el KML correspondiente.
 * Establece el valor del editor de KML con el generado.
 */
function csvtokml() {

    const input = csvEditor.getValue();
    //Parseamos el CSV a Array
    parse(input, {
        comment: '#'
    }, function(err, output) {
        if (err) {
            console.log(err);
        } else {
            let kml = generarKML(output);
            kmlEditor.setValue(kml);
        }

    })
}

function generarKML(parsedcsv) {
    //Buscar el índice de los términos clave
    let headers = parsedcsv[0];
    let latitude_index = headers.indexOf("latitude");
    let longitude_index = headers.indexOf("longitude");
    let altitude_index = headers.indexOf("altitude_above_seaLevel(feet)");
    let speed_index = headers.indexOf("speed(mph)");

    let position = "";

    for (let i = 1; i < parsedcsv.length; i++) {
        let latitude = parsedcsv[i][latitude_index];
        let longitude = parsedcsv[i][longitude_index];
        let altitude = parsedcsv[i][altitude_index] * 0.3048; // De pies a metros
        let speed = parsedcsv[i][speed_index] * 1.609344; //De mph a kmh

        position += longitude + "," + latitude + "," + altitude + "\n";
    }

    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
        '<Document id="KMLDron">\n' +
        '<Placemark>\n' +
        '<name>RutaDron</name>\n' +
        '<description>KML generado a partir del registro de vuelo.</description>\n' +
        '<LineString>\n' +
        '<tessellate>1</tessellate>\n' +
        '<coordinates>\n' +
        position +
        '\n</coordinates>\n' +
        '<altitudeMode>absolute</altitudeMode>\n' +
        '</LineString>\n' +
        '<Style>' +
        '  <LineStyle>' +
        '   <color>#ff0000ff</color>' +
        '  <width>5</width>' +
        '  </LineStyle>' +
        ' </Style>' +
        '</Placemark>\n' +
        '<Placemark>\n' +
        '<name>SombraRuta</name>\n' +
        '<description>Sombra de la ruta.</description>\n' +
        '<LineString>\n' +
        '<tessellate>1</tessellate>\n' +
        '<coordinates>\n' +
        position +
        '\n</coordinates>\n' +
        '<altitudeMode>clampToGround</altitudeMode>\n' +
        '</LineString>\n' +
        '<Style>' +
        '  <LineStyle>' +
        '   <color>#ff000000</color>' +
        '  <width>5</width>' +
        '  </LineStyle>' +
        ' </Style>' +
        '</Placemark>\n' +
        '</Document>\n' +
        '</kml>';
    return kml;
}

// INTERFAZ //

/**
 * Creamos el editor de CSV
 */
if (document.getElementById("csvtext") !== null) {
    csvEditor = CodeMirror.fromTextArea(document.getElementById("csvtext"), {
        mode: "mathematica",
        lineNumbers: true
    });
    csvEditor.setOption("theme", "ayu-mirage");
}

/**
 * Creamos el editor de KML
 */
if (document.getElementById("kmltext") !== null) {
    kmlEditor = CodeMirror.fromTextArea(document.getElementById("kmltext"), {
        mode: "xml",
        lineNumbers: true
    });
    kmlEditor.setOption("theme", "ayu-mirage");
}

$('#csvtokml').click(csvtokml);

/**
 * Borrar el contenido del editor de CSV
 */
function borrarCsv() {
    csvEditor.setValue("");
}

$('#borrarcsv').click(borrarCsv);

/**
 * Borrar el contenido del editor de KML
 */
function borrarKml() {
    kmlEditor.setValue("");
}

$('#borrarkml').click(borrarKml);

//DESCARGA

/**
 * Genera un archivo dado un texto y lo descarga
 * @param filename  Nombre del archivo
 * @param text  Contenido
 */
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * Descarga el contenido del editor de KML.
 */
if (document.getElementById("dwnkml-btn")) {
    document.getElementById("dwnkml-btn").addEventListener("click", function() {
        let text = kmlEditor.getValue();
        let filename = "dron.kml";

        download(filename, text);
    }, false);
}

//CARGA
window.onload = function() {
    let fileInput = document.getElementById('fileInput');

    fileInput.addEventListener('change', function(e) {
        let file = fileInput.files[0];
        var regex = /^(.)+(.csv|.txt)$/;

        if (regex.test(file.name)) {
            let reader = new FileReader();

            reader.onload = function(e) {
                csvEditor.setValue(reader.result);
            }
            reader.readAsText(file)

        } else {
            alert("Por favor, cargue un archivo CSV válido.");
        }
    });
}