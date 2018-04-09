<?php
    include_once("/var/www/src/common.php");

    $site['pagename'] = "Exist Sense";
    $site['js'] = array(
        $site['bitsurl'] . "js/chart.bundle.min.js",
        $site['bitsurl'] . "js/jquery.timeago.js",
        "https://" . $_SERVER['SERVER_NAME'] . "/exist/exist.js"
    );
    if(!isset($_GET['print']) || $_GET['print'] != "1") {
        $site['css'] = array(
            "https://" . $_SERVER['SERVER_NAME'] . "/exist/exist.css"
        );
    }
    else {
        $site['css'] = array(
            "https://" . $_SERVER['SERVER_NAME'] . "/exist/print.css"
        );
    }

    include_once("header.php");
?>

<table id="exist-front" class="exist-left">
    <thead id="exist-link" class="exist-left">
        <tr id="exist-l-row" class="exist-left">
            <th id="exist-l-data" class="exist-left">
                <a id="exist-index" class="exist-left" href="#"><span class="fas fa-book"></span></a>
                | <a id="exist-logout" class="exist-left" href="#" onclick="exist.switch();"><span class="fas fa-user-times"></span></a>
                | <a id="exist-print" class="exist-left" href="?print=1" target="_blank"><span class="fas fa-print"></span></a>
                | <span id="exist-status"><span class="fas fa-cog fa-spin"></span> Loading..</span>
            </th>
            <th id="exist-l-login" class="exist-right">
                <a id="exist-login" class="exist-left" href="#" onclick="exist.auth();"><img src="https://exist.io/static/favicon.png" title="Login with Exist.io" /></a>
            </th>
        </tr>
    </thead>
    <tbody id="exist-information" class="exist-left"></tbody>
    <tfoot id="exist-extra" class="exist-left"></tbody>
</table>

<table id="exist-table" class="exist-left">
    <thead id="exist-header" class="exist-left"></thead>
    <tbody id="exist-body" class="exist-left"></tbody>
    <tfoot id="exist-post" class="exist-left"></tbody>
</table>

<?php include_once("footer.php"); ?>
