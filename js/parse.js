var file_contents;
var file_by_line;
var num_processes;
var current_line = 0;
var page_references = [];
var page_faults = [];
var process_space = [];
var pagination = 0;

$(function() {
  // Set up the buttons and initialize the processes.
  setUpButtons();
  setUpProcesses();

  // Create the list of processes and their address spaces.
  createProcessTable(num_processes);
  createProcessSpace(num_processes);

  // Hide everything that needs to be hidden.
  hide();
});

function getNumProcesses(contents) {
  // Counts the number of processes in the file.

  file_by_line = contents.split('\n'); // Split file into lines.

  var count = 0; // Initialize to 0.
  var process_count = [0]; // Initialize array to 0.

  // Loop through each line.
  $.each(file_by_line, function(index, value) {
    var line_contents = value.split(':'); // Splits the line by the colon.
    var process_number = line_contents[0].substring(1); // Gets the id of the process out of the line.

    if(!process_count[process_number]) {
      process_count[process_number] = 0; // If the process hasn't been recorded, add an entry to the array.
    }
    process_count[process_number] += 1; // Increment the process count.
  });

  $.each(process_count, function(index, value) {
    if(process_count[index] > 0) {
      // A process exists in the file if its count is greater than 0.

      count++;
    }
  });

  return count;
}

function createProcessTable(count) {
  // Creates all the necessary html for the process table.
  for(var i = 1; i <= count; i++) {
    $("#process_list").append("<input type=\"button\" name=\"process" + i +
     "\" id=\"process" + i + "\" value=\"Process " + i + "\" class=\"smallButton\" onclick=\"processClicked(" + i + ")\" />");
    $("#process_table").append("<div id=\"process_pcb_" + i + "\" class=\"pcb\"><h4>Process " + i + "</h4>" +
      "<div id=\"process" + i + "blah><p id=\"page_faults_" + i + "\">Page Faults: <span id=\"num_page_faults_" +
      i + "\">0</span></p><p id=\"page_references_" + i + "\">Page References: <span id=\"num_page_references_" +
      i + "\">0</span></p></div></div>");
  }

  hidePCB();
}

function createProcessSpace(count) {
  var my_tables = "";
  for(var i = 1; i <= count; i++) {
    process_space[i] = [];
    var page_count = 0;

    my_tables += "<div class=\"process_top\"><input type=\"button\" name=\"prev\" id=\"prev_" + i +
      "\" class=\"previous_button\" value=\"Prev\" onclick=\"prev(" + i + ")\" />";
    my_tables += "<h3 id=\"process_header_" + i + "\" class=\"process_header\">Process " + i + "</h3>";
    my_tables += "<input type=\"button\" name=\"next\" id=\"next_" + i +
      "\" class=\"next_button\" value=\"Next\"  onclick=\"next(" + i + ")\"/></div>";
    my_tables += "<table id=\"process_" + i + "_table\" class=\"process_table\"><tr><th>Address</th><th>Page Number</th></tr>";
    my_tables += "<tbody id=\"pagination_" + i + "_" + page_count + "\" class=\"pagination_page\">";

    for(var j = 0; j < 64; j++) {
      process_space[i][j] = -1;
      my_tables += "<tr><td>" + j + "</td><td id=\"process" + i + "_" + j + "\">-</td></tr>";
      if(j % 8 == 7) {
        page_count++;
        my_tables += "</tbody><tbody id=\"pagination_" + i + "_" + page_count + "\" class=\"pagination_page\">";
      }
    }

    my_tables += "</tbody></table>";
  }

  $("#address_space").append(my_tables);
}

// Reset all process tables to original state and show the clicked one.
function processClicked(index) {
  $(".smallButton").css('background', '#FFFFFF');

  hidePCB();
  hideAddressSpace();

  pagination = 0;
  showPCB(index); // Show the proper process table.
  showAddressSpace(index); // Show the proper address table.
}

function processLine(line) {
  hideStatusMessages(); // Hide statuses.

  current_line++;
  showLine(line);
  showLineNumber();

  var line_contents = line.split(':'); // Splits the line by the colon.
  var process_number = line_contents[0].substring(1); // Gets the id of the process out of the line.
  var page_reference = line_contents[1]; // Gets the page reference value out of the line.
  page_reference = parseInt(page_reference, 2);
  processClicked(process_number); // Show the correct process.

  addReference(process_number);
  checkForPageFault(process_number, page_reference);
}

function runToCompletion(file) {
  clearData(); // Clear all data before running this.

  for(var i = 0; i < file.length; i++) {
    processLine(file[i]);
  }
}

function checkForPageFault(pid, page) {
  var flag = true;
  $.each(process_space[pid], function(index, value) {
    if(process_space[pid][index] == page) {
      flag = false;
      return false;
    }
  });

  if(!flag) {
    $("#page_fault_status").hide();
    return;
  }

  $.each(process_space[pid], function(index, value) {
    if(process_space[pid][index] == -1) {
      process_space[pid][index] = page;
      $("#process" + pid + "_" + index).text(page);
      $("#reference_status").show();
      return false;
    }
  });

  $("#page_fault_status").show();
  page_faults[pid]++;
  $("#num_page_faults_" + pid).text(page_faults[pid]); // Display the number of page faults.

  // Implement logic to do LRU.
}

// Resets everything to the original state.
function clearData() {
  $.each(page_faults, function(index, value) {
    page_faults[index] = 0;
    $("#num_page_faults_" + index).text(page_faults[index]); // Display the number of page faults.
  });


  $.each(page_references, function(index, value) {
    page_references[index] = 0;
    $("#num_page_references_" + index).text(page_references[index]); // Display the number of page references.
  });

  $.each(process_space, function(i, value) {
    if(i == 0) {
      return; // No data in process_space[0].
    }

    for(var j = 0; j < 64; j++) {
      process_space[i][j] = -1;
    }
  });

  current_line = 0;

  hideStatus();

  $("#clear_status").show();
}

// Presents the previous set of addresses in the address space.
function prev(index) {
  hideAddressSpace();

  pagination--;

  if(pagination < 0) {
    pagination = 0;
  }

  showAddressSpace(index);
}

// Presents the next set of addresses in the address space.
function next(index) {
  hideAddressSpace();

  pagination++;

  if(pagination > 7) {
    pagination = 7;
  }

  showAddressSpace(index);
}

// HELPER FUNCTIONS

// Initializes all the processes to have 0 page faults and 0 page references.
function setUpProcesses() {
  file_contents = $("#file_contents").text();

  num_processes = getNumProcesses(file_contents);
  for(var i = 0; i <= num_processes; i++) {
    page_faults[i] = 0;
    page_references[i] = 0;
  }
}

// Wires up the correct function to each button click.
function setUpButtons() {
  $("#walkthrough").click(function() {
    if(current_line >= file_by_line.length) {
      clearData(); // Data needs to be cleared if a full run has been completed.
    }

    processLine(file_by_line[current_line]);
  });

  $("#runthrough").click(function() {
    runToCompletion(file_by_line);
  })

  $("#clear_button").click(function() {
    clearData();
  });
}

// Hides pretty much everything that would ever need to be hidden.
function hide() {
  hidePCB();
  hideAddressSpace();
  hideStatus();
}

// Hides everything in the status window.
function hideStatus() {
  hideStatusMessages();

  $("#line_number").hide();
  $("#current_line").hide();
}

// Hides all status messages.
function hideStatusMessages() {
  $(".status_message").hide();
}

// Hides the PCB content.
function hidePCB() {
  $(".pcb").hide();
}

// Hides everything in the process address space.
function hideAddressSpace() {
  $(".process_header").hide();
  $(".process_table").hide();
  $(".pagination_page").hide();

  $(".previous_button").hide();
  $(".next_button").hide();
}

// Shows the current line.
function showLine(line) {
  $("#current_line").text("Current line: " + line);
  $("#current_line").show();
}

// Show the current line number.
function showLineNumber() {
  $("#line_number").text("Lines Processed: " + current_line);
  $("#line_number").show();
}

// Shows the PCB.
function showPCB(index) {
  $("#process_pcb_" + index).show();
  $("#process" + index).css('background', '#94FF9B');
}

// Shows the process address space.
function showAddressSpace(index) {
  $("#process_header_" + index).show();
  $("#process_" + index + "_table").show();
  $("#pagination_" + index + "_" + pagination).show();

  $("#prev_" + index).show();
  $("#next_" + index).show();
}

// Adds a page reference to the process.
function addReference(process_number) {
  page_references[process_number]++;
  $("#num_page_references_" + process_number).text(page_references[process_number]);
}