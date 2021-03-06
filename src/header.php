<!DOCTYPE html>
<html lang="en" dir="ltr">
    <head>
        <title><?php echo $site['pagename']; ?></title>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="msapplication-TileColor" content="#440000" />
        <meta name="msapplication-TileImage" content="<?php echo $site['bitsurl']; ?>icons/mstile-144x144.png" />
        <meta name="msapplication-navbutton-color" content="#440000" />
        <meta name="msapplication-config" content="<?php echo $site['bitsurl']; ?>browserconfig.xml" />
        <meta name="theme-color" content="#440000" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="<?php echo $site['bitsurl']; ?>manifest.json" />
        <link rel="apple-touch-icon" type="image/png" sizes="57x57" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="60x60" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="72x72" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="76x76" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="114x114" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="120x120" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="144x144" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="152x152" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="<?php echo $site['bitsurl']; ?>icons/apple-touch-icon-180x180.png" />
        <link rel="icon" type="image/png" href="<?php echo $site['bitsurl']; ?>icons/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="<?php echo $site['bitsurl']; ?>icons/favicon-194x194.png" sizes="194x194" />
        <link rel="icon" type="image/png" href="<?php echo $site['bitsurl']; ?>icons/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="<?php echo $site['bitsurl']; ?>icons/android-chrome-192x192.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="<?php echo $site['bitsurl']; ?>icons/favicon-16x16.png" sizes="16x16" />
        <link rel="stylesheet" type="text/css" href="/bits/css/orbitron.css" />
        <script type="text/javascript" src="<?php echo $site['bitsurl']; ?>js/fontawesome-5.0.2.js"></script>
        <script type="text/javascript" src="<?php echo $site['bitsurl']; ?>js/jquery-3.2.1.min.js"></script>
        <script type="text/javascript" src="<?php echo $site['bitsurl']; ?>js/bootstrap.min.js"></script>
        <script type="text/javascript" src="<?php echo $site['bitsurl']; ?>js/ekko-lightbox.min.js"></script>
        <?php
            if(isset($site['js'])) for($i = 0, $size = count($site['js']); $i < $size; ++$i) {
                ?> <script type="text/javascript" src="<?php echo $site['js'][$i]; ?>"></script> <?php
            }
        ?>
        <script type="text/javascript">
            var sitedata = { <?php echo "bits: '" . $site['bitsurl'] . "', print: " . $site['printview']; ?> };
        </script>
        <link rel="stylesheet" type="text/css" href="<?php echo $site['bitsurl']; ?>css/normalize.css" />
        <link rel="stylesheet" type="text/css" href="<?php echo $site['bitsurl']; ?>css/bootstrap.min.css" />
        <?php if($site['printview'] == 0) { ?>
        <link rel="stylesheet" type="text/css" href="<?php echo $site['bitsurl']; ?>css/rouge-base16-dark.css" />
        <link rel="stylesheet" type="text/css" href="<?php echo $site['bitsurl']; ?>css/ekko-lightbox.min.css" />
        <link rel="stylesheet" type="text/css" href="<?php echo $site['bitsurl']; ?>css/default.css" />
        <link rel="stylesheet" type="text/css" href="<?php echo $site['bitsurl']; ?>css/common.css" />
        <?php
            }
            if(isset($site['css'])) for($i = 0, $size = count($site['css']); $i < $size; ++$i) {
                ?> <link rel="stylesheet" type="text/css" href="<?php echo $site['css'][$i]; ?>" /> <?php
            }
        ?>
    </head>
    <body>
        <nav class="navbar navbar-inverse navbar-static-top">
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-sm" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle Navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="/"><img src="<?php echo $site['bitsurl']; ?>redeclipse-hq.png" alt="Red Eclipse HQ" /></a>
                </div>
                <div id="navbar-sm" class="navbar-collapse collapse">
                    <ul class="nav navbar-nav navbar-right">
                        <li class="navitem"><a href="/" title="HQ Index"><span class="fas fa-building fa-fw" aria-hidden="true"></span><div class="navtext">HQ Index</div></a></li>
                        <li class="navitem"><a href="/exist" title="Exist Sense"><span class="fas fa-chart-bar fa-fw" aria-hidden="true"></span><div class="navtext">Exist Sense</div></a></li>
                        <li class="navitem"><a href="/admin" title="Admin Index"><span class="fas fa-user-secret fa-fw" aria-hidden="true"></span><div class="navtext">Admin Index</div></a></li>
                        <li class="navitem"><a href="https://lists.redeclipse.net/" title="Mailing Lists"><span class="fas fa-envelope fa-fw" aria-hidden="true"></span><div class="navtext">Mailing Lists</div></a></li>
                        <li class="navitem"><a href="https://hq.redeclipse.net/" title="Red Eclipse"><span class="fas fa-home fa-fw" aria-hidden="true"></span><div class="navtext">Red Eclipse</div></a></li>
                    </ul>
                </div>
            </div>
        </nav>
        <div class="container pagecontent">
            <div id="content-area" class="main pagecontainer">
                <h1><?php echo $site['pagename']; ?></h1>
