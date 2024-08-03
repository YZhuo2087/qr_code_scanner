// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

let gCtx = null;
let gCanvas = null;
let c = 0;
let stype = 0;
let gUM = false;
let webkit = false;
let moz = false;
let v = null;

const imghtml = '<div id="qrfile"><canvas id="out-canvas" width="320" height="240"></canvas>' +
    '<div id="imghelp">drag and drop a QRCode here' +
    '<br>or select a file' +
    '<input type="file" onchange="handleFiles(this.files)"/>' +
    '</div>' +
    '</div>';

const vidhtml = '<video id="v" autoplay></video>';

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var files = dt.files;
    if (files.length > 0) {
        handleFiles(files);
    } else if (dt.getData('URL')) {
        qrcode.decode(dt.getData('URL'));
    }
}

function handleFiles(f) {
    const o = [];

    for (let i = 0; i < f.length; i++) {
        const reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

                qrcode.decode(e.target.result);
            };
        })(f[i]);
        reader.readAsDataURL(f[i]);
    }
}

function initCanvas(w, h) {
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-btn');
    const saveButtons = document.querySelectorAll('.save-btn');

    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = btn.closest('tr');
            row.querySelectorAll('span').forEach(span => {
                span.style.display = 'none';
            });
            row.querySelectorAll('input').forEach(input => {
                input.style.display = 'block';
            });
            btn.style.display = 'none';
            row.querySelector('.save-btn').style.display = 'inline-block';
        });
    });

    saveButtons.forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            const row = btn.closest('tr');
            const formData = new FormData();
            row.querySelectorAll('input').forEach(input => {
                formData.append(input.name, input.value);
            });
            formData.append('id', row.dataset.id);
            const action = `/${row.closest('table').dataset.table}/edit`;
            fetch(action, {
                method: 'POST',
                body: new URLSearchParams(formData)
            }).then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    console.error('Failed to save changes.');
                }
            }).catch(error => {
                console.error('Error:', error);
            });
        });
    });
});

function read(a) {
    let html = "<br>";
    if (a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html += "<a target='_blank' href='" + a + "'>" + a + "</a><br>";
    html += "<b>" + htmlEntities(a) + "</b><br><br>";
    document.getElementById("result").innerHTML = html;

    const dataString = { send: true, credential: htmlEntities(a) };

    $.ajax({
        type: "POST",
        url: "authenticate.php",
        data: dataString,
        dataType: "json",
        cache: false,
        success: function(data) {
            if (data.success) {
                alert("The Door has opened!");
                self.location.replace('home.php');
            } else {
                alert("You Don't have access to the building!");
                self.location.replace('index.php');
            }

            setwebcam();

        }, error: function(xhr, status, error) {
            alert(error);
        },
    });

}

function captureToCanvas() {
    if (stype != 1) return;
    if (gUM) {
        try {
            gCtx.drawImage(v, 0, 0);
            try {
                qrcode.decode();
            } catch (e) {
                console.log(e);
                setTimeout(captureToCanvas, 500);
            }
        } catch (e) {
            console.log(e);
            setTimeout(captureToCanvas, 500);
        }
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// function read(a) {
//     let html = "<br>";
//     if (a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
//         html += "<a target='_blank' href='" + a + "'>" + a + "</a><br>";
//     html += "<b>" + htmlEntities(a) + "</b><br><br>";
//     document.getElementById("result").innerHTML = html;
//
//     const dataString = {send: true, credential: htmlEntities(a)};
//
//     $.ajax({
//
//         type: "POST",
//         url: "authenticate.php",
//         data: dataString,
//         dataType: "json",
//         cache: false,
//         success: function (data) {
//
//             if (data.success == true) {
//                 alert("The Door has opened!");
//                 self.location.replace('home.php');
//             } else {
//                 alert("No residential information!");
//                 self.location.replace('index.php');
//             }
//
//             setwebcam();
//
//
//         }, error: function (xhr, status, error) {
//             alert(error);
//         },
//     });
//
// }

function isCanvasSupported() {
    const elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    if (webkit)
        v.src = window.webkitURL.createObjectURL(stream);
    else if (moz) {
        v.mozSrcObject = stream;
        v.play();
    } else
        v.srcObject = stream;
    window.stream = stream;
    gUM = true;
    setTimeout(captureToCanvas, 500);
}

function error(error) {
    gUM = false;
    return;
}

function load() {
    if (isCanvasSupported() && window.File && window.FileReader) {
        initCanvas(800, 800);
        qrcode.callback = read;
        document.getElementById("mainbody").style.display = "inline";
        setwebcam();
    } else {
        document.getElementById("mainbody").style.display = "inline";
        document.getElementById("mainbody").innerHTML = '<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>' +
            '<br><p id="mp2">sorry your browser is not supported</p><br><br>' +
            '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
    }
}

function setwebcam() {
    document.getElementById("result").innerHTML = "- scanning -";
    if (stype == 1) {
        setTimeout(captureToCanvas, 500);
        return;
    }
    let n = navigator.mediaDevices;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v = document.getElementById("v");

    if (n.getUserMedia)
        n.getUserMedia({video: true}).then(success).catch(error)
    else if (n.webkitGetUserMedia) {
        webkit = true;
        n.webkitGetUserMedia({video: true, audio: false}, success, error);
    } else if (n.mozGetUserMedia) {
        moz = true;
        n.mozGetUserMedia({video: true, audio: false}, success, error);
    }

    //document.getElementById("qrimg").src="qrimg2.png";
    //document.getElementById("webcamimg").src="webcam.png";
    document.getElementById("qrimg").style.opacity = 0.2;
    document.getElementById("webcamimg").style.opacity = 1.0;

    stype = 1;
    setTimeout(captureToCanvas, 500);
}

function setimg() {
    document.getElementById("result").innerHTML = "";
    if (stype == 2)
        return;
    document.getElementById("outdiv").innerHTML = imghtml;
    //document.getElementById("qrimg").src="qrimg.png";
    //document.getElementById("webcamimg").src="webcam2.png";
    document.getElementById("qrimg").style.opacity = 1.0;
    document.getElementById("webcamimg").style.opacity = 0.2;
    let qrfile = document.getElementById("qrfile");
    qrfile.addEventListener("dragenter", dragenter, false);
    qrfile.addEventListener("dragover", dragover, false);
    qrfile.addEventListener("drop", drop, false);
    stype = 2;
}
