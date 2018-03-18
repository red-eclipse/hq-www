<?php
    $pagename = "Index";
    include_once("/var/www/src/header.php");
?>
<p>Welcome to the Red Eclipse HQ. You might be looking for the:</p>
<p>
    <ul>
        <li>
            <b><a href="https://lists.redeclipse.net/">Mailing Lists</a></b>
            <ul>
                <li><a href="https://lists.redeclipse.net/listinfo/news">Newsletter</a></li>
            </ul>
        </li>
        <li>
            <b><a href="/admin">Administrator Interface</a></b>
            <ul>
                <li><a href="/admin/listusers.php">List Users</a></li>
                <li><a href="/admin/adduser.php">Add User</a></li>
                <li><a href="/admin/deluser.php">Delete User</a></li>
            </ul>
        </li>
    </ul>
</p>
<?php include_once("/var/www/src/footer.php"); ?>
