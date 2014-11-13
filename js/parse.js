var file_contents;
var file_by_line;
var num_processes;
var current_line = 0;
var page_references = [];
var page_faults = [];
var process_space = [];
var physical = [];
var pagination = 0;
var lru_physical = [];
var PHYSICAL_MEMORY = 16;
var LOGICAL_ADDRESS_SPACE = 64;
var victim = -1;

$(function() {
  // Set up the buttons and initialize the processes.
  setUpButtons();
  setUpProcesses();

  // Create the list of processes and their address spaces.
  createProcessTable(num_processes);
  createProcessSpace(num_processes);
  createPhysicalMemory();

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

// Creates all the necessary html for the PCB.
function createProcessTable(count) {
  for(var i = 1; i <= count; i++) {
    $("#process_list").append("<input type=\"button\" name=\"process" + i +
     "\" id=\"process" + i + "\" value=\"Process " + i + "\" class=\"smallButton\" onclick=\"processClicked(" + i + ")\" />");
    $("#process_table").append("<div id=\"process_pcb_" + i + "\" class=\"pcb\"><h4>Process " + i + "</h4>" +
      "<div id=\"process" + i + "blah><p id=\"page_faults_" + i + "\">Page Faults: <span id=\"num_page_faults_" +
      i + "\">0</span></p><p id=\"page_references_" + i + "\">Page References: <span id=\"num_page_references_" +
      i + "\">0</span></p><p id=\"rate_" + i + "\">Fault Rate: 0.00%</p></div></div>");
  }

  hidePCB();
}

// Creates all the necessary html for the process address space.
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

    for(var j = 0; j < LOGICAL_ADDRESS_SPACE; j++) {
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

function createPhysicalMemory() {
  var physical_html = "<h3>Physical Memory</h3>";
  physical_html += "<table id=\"physical_memory_table\"><tr><th>Address</th><th>Page</th></tr>";
  for(var i = 0; i < PHYSICAL_MEMORY; i++) {
    physical[i] = -1;
    physical_html += "<tr><td>" + i + "</td><td id=\"physical_memory_" + i + "\">-</td></tr>";
  }
  physical_html += "</table>";

  $("#physical").append(physical_html);
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
  checkPhysicalFault(process_number, page_reference);
  calculateFaultRate(process_number);
  updateLogicalSpace(process_number, page_reference);
  updatePhysicalMemory();
  updateLRU();
}

function runToCompletion(file) {
  clearData(); // Clear all data before running this.

  for(var i = 0; i < file.length; i++) {
    processLine(file[i]);
  }
}

function checkPhysicalFault(pid, page) {
  var flag = true;
  var pf = false;
  var victim_flag = false;
  var entry = "Process  " + pid + ": Page " + page;
  $.each(physical, function(index, value) {
    if(physical[index] == entry) {
      flag = false;
      var lru_index = -1;
      $.each(lru_physical, function(i, v) {
        if(lru_physical[i] == entry) {
          lru_index = i;
          return;
        }
      });

      // If we find the value in our table, we remove it and push it back on to the end of the array.
      lru_physical.splice(lru_index, 1);
      lru_physical.push(entry);

      return;
    }
  });

  if(flag) {
    $.each(physical, function(index, value) {
      if(physical[index] == -1) {
        physical[index] = entry;
        lru_physical.push(entry);
        flag = false;
        pf = true;
        return false;
      }
    });
  }


  if(flag) {
    var toReplace = lru_physical.shift();
    victim = toReplace;
    victim_flag = true;
    $.each(physical, function(index, value) {
      if(physical[index] == toReplace) {
        physical[index] = entry;
        lru_physical.push(entry);
        pf = true;
        return;
      }
    });
  }

  if(victim != -1 && victim_flag) {
    $("#victim_status").text("Victim: " + victim);
    $("#victim_status").show();
  }

  if(pf) {
    $("#page_fault_status").show();
    page_faults[pid]++;
    $("#num_page_faults_" + pid).text(page_faults[pid]); // Display the number of page faults.
  }
}

function updateLogicalSpace(pid, page) {
  var flag = false;

  index = 0;
  while(process_space[pid][index] != -1) {
    if(process_space[pid][index] == page) {
      flag = true;
    }
    index++;
  }

  if(!flag) {
    process_space[pid][index] = page;
    $("#process" + pid + "_" + index).text(page);
  }
}

// Calculates the fault rate for a particular process.
function calculateFaultRate(pid) {
  var faults = page_faults[pid];
  var references = page_references[pid];
  var percentage = faults / references * 100;
  if(references == 0) {
    percentage = 0.00;
  }

  $("#rate_" + pid).text("Fault rate: " + percentage.toFixed(2) + "%");
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
    calculateFaultRate(index);
  });

  $.each(process_space, function(i, value) {
    if(i == 0) {
      return; // No data in process_space[0].
    }

    for(var j = 0; j < 64; j++) {
      process_space[i][j] = -1;
      $("#process" + i + "_" + j).text("-");
    }
  });

  lru_physical = [];

  for(var i = 0; i < PHYSICAL_MEMORY; i++) {
    physical[i] = -1;
  }

  current_line = 0;

  hideStatus();
  updatePhysicalMemory();

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

  if(pagination > (LOGICAL_ADDRESS_SPACE / 8 - 1)) {
    pagination = (LOGICAL_ADDRESS_SPACE / 8 - 1);
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

// Updates the physical memory table.
function updatePhysicalMemory() {
  for(var i = 0; i < PHYSICAL_MEMORY; i++) {
    if(physical[i] == "-1") {
      $("#physical_memory_" + i).text("-");
    } else {
      $("#physical_memory_" + i).text(physical[i]);
    }
  }
}

function updateLRU() {
  var lru_text = "<h5>LRU</h5>";
  $.each(lru_physical, function(index, value) {
    lru_text += "<p>" + lru_physical[index] + "</p>";
  });

  $("#lru").html(lru_text);
}