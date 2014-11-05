$(function() {
  $(".error").hide(); // Hide error messages when page loads for the first time.

  $("#input_file_form").submit(function() {
    var fn; // Create an empty variable to hold the file name.

    $(".error").hide(); // Hide error messages that a previous submission produced.

    // Check that a file name was entered.
    if(!$("#file_name").val()) {
      $("#empty_error").show(); // Show the error message.
    } else {
      $fn = $("#file_name").val(); // Put the file name into the fn variable.
    }

    if(!fn) {
      return false; // Don't submit the form if the file name wasn't entered.
    }
  })
})