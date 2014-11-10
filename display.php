<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Project 2 - Page Replacement</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="css/main.css" />
    <script type="text/javascript" src="js/jquery.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="js/validate.js" charset="utf-8"></script>
  </head>
  <body>
    <div id="header">
      <h1>Project 2 - Page Replacement</h1>
      <h2 id="author">Written by Andrew Greenman</h2>
    </div>

<?php

if(!isset($_GET["file_name"])) {
  // If the user reaches this page incorrectly.

  echo "<p id=\"header\">An error occured. <a href=\"index.php\">Please try again.</a></p>";
} else {
  if($file = file($_GET["file_name"])) {
    echo "<div id=\"process_table\">";

    // Process file line by line.
    foreach ($file as $line) {
      $line = explode(":", $line); // Split file into process and page number.

      page_reference(trim($line[0]), trim($line[1]));
    }

    echo "</div>";
  } else {
    // If the passed file was invalid somehow.

    echo "<p id=\"header\">An error occured. <a href=\"index.php\">Please try again.</a></p>";
  }
}

function page_reference($process, $page_number) {

}

?>

  </body>
</html>