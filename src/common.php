<?php
    set_include_path(get_include_path() . ":/var/www/src");
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
      $client['ip'] = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
      $client['ip'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
      $client['ip'] = $_SERVER['REMOTE_ADDR'];
    }
    if (preg_match("/(10\.0|10\.1|10\.2|192\.168|127\.0)\.([0-9]*)\.([0-9]*)/", $client['ip'])) {
        $site['bitsurl'] = "https://" . $_SERVER['SERVER_NAME'] . "/bits/";
    } else {
        $site['bitsurl'] = "https://redeclipse.net/bits/";
    }
    $site['printview'] = isset($_GET['print']) && $_GET['print'] != 0 ? 1 : 0;
?>
