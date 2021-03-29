//Slider code
function openNav() {
  document.getElementById("floatingDQButton").style.display = "none"; //Switch DQ button off

  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";

  runDQ();
  //loadChart(); //Load the chart for the widget
}

function closeNav() {
  clearAsset(); // Clear the asset from DQ - a new asset will be created if we open the modal again
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
  document.getElementById("floatingDQButton").style.display = "block"; // Switch DQ button on again
  //location.reload(); // Reload to rest HTML on page
}

//Chart.js code
function loadChart() {
	// Horizontal bar chart
	var barChartHorizontal = new Chart(document.getElementById("bar-chart-horizontal"), {
	    type: 'horizontalBar',
      yAxisID: 0,
      xAxisID: 0,
	    data: {
	      labels: ["Checkpoint Errors", "Broken Links", "Spellings"],
	      datasets: [
	        {
	          label: "Digital Quality Check",
	          backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
	          data: [cpErrors,1,spellingCount] // Test data needs to be replaced with DQ feedback
	        }
	      ]
	    },
	    options: {
	      legend: { display: false },
	      title: {
	        display: true,
	        text: 'Digital Quality Report for ' + totalCheckpoints +' checkpoints.'
	      },
        scales:{
          xAxes:[{
            ticks:{
              min: 0
            }
          }]
        }
	    }
	});
	//charts.push(barChartHorizontal);
}

//Digital Quality API ******
    //DQ Variables
    var assetId = ""; //Will be set after the asset is sent to DQ
    var apiKey = "<enter_your_crownpeak_dq_apikey_here>"; //Enter your API key for Crownpeak DQ from support@crownpeak.com
    var websiteId = "<enter_your_crownpeak_dq_websiteid_here>"; //Enter your DQ site address (you can get this through the API or from Support)
    var spellingCount = 0;
    var cpErrors = 0;
    var totalCheckpoints = 0;
    var activeIssueId; //Set to the id of the active issue so we can reset colour just before updating to new issue
    //Pass all html from the page in to a variable to pass to DQ
    //var markup = document.documentElement.innerHTML;
    var headContent = document.head.innerHTML;
    var markup = document.body.innerHTML;
    //var markup = document.getElementById("main").innerHTML; // Copy all html inside the main div tag...
    //console.log(markup);
function runDQ() {
	console.log("Running runDQ()");
    //Create a new asset in DQ so that it can be scanned - returns an id for the asset
    var settings = {
      "url": "https://api.crownpeak.net/dqm-cms/v1/assets?apiKey=" + apiKey,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json; charset=UTF-8",
        "x-api-key": apiKey
      },
      "data": {
        "websiteId": websiteId,
        "content": "<head>"+headContent+"</head><body>"+markup+"</body>", //Send head and body to DQM as an asset
        "contentType": "text/html; charset=UTF-8"
      }
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      console.log("Asset ID: " + response.id); //test
      assetId = response.id; //test
      console.log("Asset ID set to: " + assetId); //test
      console.log("About to run checkDQ");
      //checkDq(); // Run the DQ check only run to highlight ALL issues
      checkSpellings(); //Run spell checker on DQ Server
      checkCheckpoints(); //Run checkpoint checker on DQ server
    });

}
function checkDq(){
  //Gets the assets highlighted html from DQ - Highlight ALL - ** Example only do not use this
    var settings = {
    "url": "https://api.crownpeak.net/dqm-cms/v1/assets/"+assetId+"/pagehighlight/all?apiKey="+apiKey+"&visibility=public",
    "method": "GET",
    "timeout": 0,
    "headers": {
      "Accept": "text/html; charset=UTF-8",
      "x-api-key": apiKey
    },
  };

  $.ajax(settings).done(function (response) {
    //console.log(response);
    console.log("Running checkDQ");
    document.getElementById('main').innerHTML = response; //Replace the main div with the htnl from DQ
});
}

function checkDqSingle(checkpointId){
  //Get the highlighted HTML back from DQ by issue id - only one isse will show
  var settings = {
    "url": "https://api.crownpeak.net/dqm-cms/v1/assets/"+assetId+"/errors/"+checkpointId+"/?apiKey="+apiKey+"&visibility=public",
    "method": "GET",
    "timeout": 0,
    "headers": {
      "Accept": "text/html; charset=UTF-8",
      "x-api-key": apiKey
    },
  };

  $.ajax(settings).done(function (response) {
    //console.log(response);
    //Return HTML with single issue highlighted
    document.getElementById('main').innerHTML = response; //Replace the main div with the htnl from DQ
    if(activeIssueId != null){
      document.getElementById(activeIssueId).style.color = "black";  // Rest icon if set
    }
    document.getElementById(checkpointId).style.color = "red";  // Change icon colour to show active
    activeIssueId = checkpointId; // Set active issue - set after reset so it clears the previous issue colour from green
  });
}

//Query DQ to get all spelling issues
function checkSpellings(){
	var settings = {
  	"url": "https://api.crownpeak.net/dqm-cms/v1/assets/"+assetId+"/spellcheck?apiKey="+apiKey,
  	"method": "GET",
  "timeout": 0,
  "headers": {
    "Accept": "application/json; charset=UTF-8",
    "x-api-key": apiKey
  },
};

$.ajax(settings).done(function (response) {
	if (response.misspellings.length != 0){
		spellingCount = response.misspellings.length;
			var i;
			for (i = 0; i < response.misspellings.length; i++) {
  				console.log("Number of spelling mistakes is: "+ spellingCount);
				document.getElementById("spellingCheck").innerHTML += "<p id='errors'> -" + response.misspellings[i].word + "</p>";
				}
	}
  //console.log(response);
  //console.log(response.misspellings[0].word);
  //Collect spelling mistakes and count

})
}
function checkCheckpoints(){
	//Query DQ to get all checkpoint failures
	var settings = {
	  "url": "https://api.crownpeak.net/dqm-cms/v1/assets/"+assetId+"/status?apiKey="+apiKey+"&visibility=public",
	  "method": "GET",
	  "timeout": 0,
	  "headers": {
	    "Accept": "application/json; charset=UTF-8",
	    "x-api-key": apiKey
	  },
	};

	$.ajax(settings).done(function (response) {
	  //console.log(response);
	  //console.log(response.totalErrors);
	  cpErrors = response.totalErrors;
	  totalCheckpoints = response.totalCheckpoints;
	  console.log("Total number of checkpoints: " + response.checkpoints.length)
    var pageIcon; // cosmetic
    var sourceIcon; // cosmetic
    var viewButton;  // Contains id of issue for onclick fetch
	  	var i;
			for (i = 0; i < response.checkpoints.length; i++) {
        //Is the error source code
        if (response.checkpoints[i].canHighlight.source){
          sourceIcon = "<i class='fas fa-code' title='source'></i>";
        }else{sourceIcon="";} //Clear icon if false
        //Is the error source code
        if (response.checkpoints[i].canHighlight.page){
          pageIcon = "<i class='fas fa-file-alt' title='page'></i>";
          //Only show option to highlight if possible
          //Id set to checkpoint id so we can change colour on html fetch
          viewButton = "<button onclick='checkDqSingle(\""+response.checkpoints[i].id+"\")' class='btn'><i id='"+response.checkpoints[i].id+"' class='fas fa-eye'></i></button>";
        } else{pageIcon=""; viewButton="";}// Clear Icons if false}
				if (response.checkpoints[i].failed){
					var topics = "";  //Store topics of error
					var c;
					for (c = 0; c < response.checkpoints[i].topics.length; c++) {

						topics += response.checkpoints[i].topics[c] +" | ";
					}
  				console.log("Error found! #"+ i);
				document.getElementById("errorList").innerHTML += "<p><b>" + topics + "</b>" + pageIcon + " " + sourceIcon + " " + viewButton + "</p><p>"+ response.checkpoints[i].name +"</p><a href='#' id='expander' data-toggle='collapse' data-target='#demo" + [i] + "'> more details...</a><div id='demo" + [i] + "' class='collapse'>" + response.checkpoints[i].description + "</div><hr>";
				}
			}
	  loadChart(); //Load the chart for the widget
	});
}

  //Kill the current asset to DQ clean.
  function clearAsset(){
    console.log('Running clearAsset');
    console.log("Killing asset: " + assetId);
    var settings = {
    "url": "https://api.crownpeak.net/dqm-cms/v1/assets/"+assetId+"?apiKey="+apiKey+"",
    "method": "DELETE",
    "timeout": 0,
    "headers": {
      "x-api-key": apiKey
    },
  };

  $.ajax(settings).done(function (response) {
    console.log(response);
    console.log("Asset deleted!");
  });
  }
