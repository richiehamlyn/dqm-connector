//Build UI in to variable ready to pass in to DOM
//This has been added incrementally for readability
var websiteHtml = function(){
	// Build the UI for DQ Checker
   var html = '<div id="mySidebar" class="sidebar">';
   html += '<div class="topBar">';
   html += '<div id="head">';
   html += '<img src="imagery/cp_logo_colour.png" alt="Crownpeak logo" width="150">';
   html += '<a href="javascript:void(0)" class="closebtn" onclick="closeNav()"><i class="far fa-window-close"></i></a>';
   html += '</div>';
   html += '<div id="chart">';
   html += '<br />';
   html += '<canvas id="bar-chart-horizontal" width="70" height="45"></canvas>';
   html += '</div>';
   html += '<hr>';
   html += '</div> <!-- Close topBar -->';
   html += '<div id="checkpoints">';
   html += '<span>';
   html += '<i class="fas fa-exclamation-triangle"></i>';
   html += '</span>';
   html += '<div id="errorList">';
   html += '<h6>Errors found:</h6>';
   html += '</div>';
   html += '</div> <!-- Close errorList -->';
   html += '<br />';
   html += '<div id="spellingCheck">';
   html += '<i class="fas fa-spell-check"></i>';
   html += '</div>';
   html += '</div>';
   return {
       getWebsiteHtml: function(){return html},
   };
};
function loadUI(){
	var newUI = websiteHtml(); //Load the UI from above
	console.log('HTML for UI loaded' + newUI.getWebsiteHtml());
	let uiDiv = document.createElement('div');
    uiDiv.innerHTML = newUI.getWebsiteHtml();  //Add the UI to the new div
    document.body.appendChild(uiDiv); //Append to end of Body
    document.getElementById("floatingDQButton").style.display = "none"; //Switch DQ button off
  	document.getElementById("mySidebar").style.width = "250px";
  	document.getElementById("main").style.marginLeft = "250px";
  	runDQ(); // Start the DQ scan sequence
}