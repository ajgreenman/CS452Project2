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
    <div id="container">

<?php

if($_SERVER["REQUEST_METHOD"] == "POST") {
  $errors = array();

  // Check that the user entered a file name.
  if(!empty($_POST["file_name"])) {
    $fn = trim($_POST["file_name"]);
  } else {
    $errors[] = "Please enter the file name.";
  }

  // Check that the file exists.
  if($fn) {
    if($file = file("$fn")) {
      header("Location: display.php?file_name=$fn");
    } else {
      $errors[] = "Invalid file name.";
    }
  }

  if(!empty($errors)) {
    // If errors occured, display error messages.

    foreach ($errors as $msg) {
      echo "<p class=\"php_error error\"><strong>$msg</strong></p>";
    }
  }
} else {

}

?>
      <div id="file_form">
        <p id="fnf_error" class="error"><strong>The file was not found.</strong></p>
        <p id="empty_error" class="error"><strong>Please enter a file name.</strong></p>
        <form id="input_file_form" name="input_file" action="index.php" method="POST">
          <input type="hidden" name="MAX_FILE_SIZE" value="1000" />
          <p>
            <label for="file_name"><strong>Input file:</strong></label>
            <input type="text" name="file_name" id="file_name" size="25" />
          </p>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>



  </body>
</html>