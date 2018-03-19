<?php
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
      $client['ip'] = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
      $client['ip'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
      $client['ip'] = $_SERVER['REMOTE_ADDR'];
    }
    if (preg_match("/(10\.0|10\.1|10\.2|192\.168|127\.0)\.([0-9]*)\.([0-9]*)/", $client['ip'])) {
        $site['bitsurl'] = "https://hq.redeclipse.net/bits/";
    } else {
        $site['bitsurl'] = "https://redeclipse.net/bits/";
    }
?>
