<?php

if (!session_id()) {
    session_start();
}

if (@$_SESSION['opened'] == true) {
    header("Location: home.php");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Scanner</title>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script type="text/javascript" src="./main.js"></script>
    <script type="text/javascript" src="./llqrcode.js"></script>
</head>
<body>
<div class="container">
    <h1>QR Code Scanner</h1>
    <div id="scanner">
        <div style="display:none" id="result"></div>
        <div class="selector" id="webcamimg" onclick="setwebcam()" align="left"></div>
        <div class="selector" id="qrimg" onclick="setimg()" align="right"></div>
        <div id="mainbody" style="text-align: center;">
            <div id="outdiv"></div>
        </div>
        <canvas id="qr-canvas" width="800" height="800"></canvas>
    </div>
</div>
<script type="text/javascript">load();</script>
<script src="./jquery-1.11.2.min.js"></script>
</body>
</html>
