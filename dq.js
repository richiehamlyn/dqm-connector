//Slider code
function openNav() {
  loadUI(); // Load the UI in the pages body
}

function closeNav() {
  clearAsset(); // Clear the asset from DQ - a new asset will be created if we open the modal again
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
  document.getElementById("floatingDQButton").style.display = "block"; // Switch DQ button on again
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
	          data: [activeCpErrors.getCpErrors(),1,activeSpellCount.getSpellCount()] // Test data needs to be replaced with DQ feedback
	        }
	      ]
	    },
	    options: {
	      legend: { display: false },
	      title: {
	        display: true,
	        text: 'Digital Quality Report for ' + activeTotalCheckpoints.getTotalCheckpoints() +' checkpoints.'
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
//apiKey in closure
var apiKeyAccess = function(){
   var apiKey= "<add_your_dqm_apikey_here>"; //Enter your API key for Crownpeak DQ from support@crownpeak.com
   return {
       getApiKey: function(){return apiKey},
       setApiKey: function(newApiKey){apiKey = newApiKey; return apiKey;}
   };
};
//assetId in closure
var assetIdAccess = function(){
   var assetId= ""; //Enter your API key for Crownpeak DQ from support@crownpeak.com
   return {
       getAssetId: function(){return assetId},
       setAssetId: function(newAssetId){assetId = newAssetId; return assetId;}
   };
};
//websiteId in closure
var websiteIdAccess = function(){
   var websiteId= "<add_your_website_id_here>"; //Enter your DQ site address (you can get this through the API or from Support)
   return {
       getWebsiteId: function(){return websiteId},
   };
};
//SpellCount Variables in closure
var spellCountAccess = function(){
  var spellCount = 0; //Set count to zero and increment when called from DQM
   return {
       getSpellCount: function(){return spellCount},
       setSpellCount: function(newSpellCount){spellCount = newSpellCount; return spellCount;}
   };
};
//Checkpoint Errors count in closure
var cpErrorsAccess = function(){
  var cpErrors = 0; //Set count to zero and increment when called from DQM
   return {
       getCpErrors: function(){return cpErrors},
       setCpErrors: function(newCpErrors){cpErrors = newCpErrors; return cpErrors;}
   };
};
//Count checkpoints from DQM for the website
var totalCheckpointsAccess = function(){
  var totalCheckpoints = 0; //Set count to zero and increment when called from DQM
   return {
       getTotalCheckpoints: function(){return totalCheckpoints},
       setTotalCheckpoints: function(newTotalCheckpoints){totalCheckpoints = newTotalCheckpoints; return totalCheckpoints;}
   };
};
//Active Issue needs to be known to set the current highlighted view
var activeIssueIdAccess = function(){
  var activeIssueId;
   return {
       getActiveIssueId: function(){return activeIssueId},
       setActiveIssueId: function(newActiveIssueId){activeIssueId = newActiveIssueId; return activeIssueId;}
   };
};
var activeApiKey = apiKeyAccess(); // Access to closures
var activeAssetId = assetIdAccess();
var activeWebsiteId = websiteIdAccess();
var activeSpellCount = spellCountAccess();
var activeCpErrors = cpErrorsAccess();
var activeTotalCheckpoints = totalCheckpointsAccess();
var activeActiveIssueId = activeIssueIdAccess();

//Digital Quality API ******
    var headContent = document.head.innerHTML;
    var markup = document.body.innerHTML;

function runDQ() {
	console.log("Running runDQ()");
    var apiKey = activeApiKey.getApiKey(); // Get closed apiKey variable
    var websiteId = activeWebsiteId.getWebsiteId(); // Get closed websiteId variable
    console.log("Api Key is: " + apiKey);
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
      activeAssetId.setAssetId(response.id); // Set to current assetId that was just created

      console.log("About to run checkDQ");
      //checkDq(); // Run the DQ check only run to highlight ALL issues
      checkSpellings(); //Run spell checker on DQ Server
      checkCheckpoints(); //Run checkpoint checker on DQ server
    })
    //Inform user if request fails
  .fail(function (xhr, textStatus, errorThrown){
    alert('DQM did not respond when running initial DQ upload (error 1011)');
    closeNav(); // Close the UI
  });
}
function checkDq(){ // **** Not currently in use *****
  var apiKey = activeApiKey.getApiKey(); // Get closed apiKey variable
  var assetId = activeAssetId.getAssetId(); // Get closed assetId variable
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
})
  //Inform user if request fails
  .fail(function (xhr, textStatus, errorThrown){
    alert('DQM did not respond when running initial DQ check (error 1016)');
    closeNav(); // Close the UI
  });
}

function checkDqSingle(checkpointId){
  console.log("checkDqSingle checkpoint id: " + checkpointId);
  var apiKey = activeApiKey.getApiKey(); // Get closed apiKey variable
  var assetId = activeAssetId.getAssetId(); // Get closed assetId variable
  var activeIssueId = activeActiveIssueId.getActiveIssueId(); // Get the current issue id
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
      document.getElementById(activeIssueId).style.color = "black";  // Reset icon if set
    }
    document.getElementById(checkpointId).style.color = "red";  // Change icon colour to show active
    activeActiveIssueId.setActiveIssueId(checkpointId); // Set active issue - set after reset so it clears the previous issue colour from green
  })
  //Inform user if request fails
  .fail(function (xhr, textStatus, errorThrown){
    alert('DQM did not respond when running single checkpoint (error 1012)');
    closeNav(); // Close the UI
  });
}

//Query DQ to get all spelling issues
function checkSpellings(){
  var apiKey = activeApiKey.getApiKey(); // Get closed apiKey variable
  var assetId = activeAssetId.getAssetId(); // Get closed assetId variable
  console.log("CheckSpelling asset id: " + assetId);
  //var spellingCount = activeSpellCount.getSpellCount(); // Get the number of spelling mistakes
	var settings = {
  	"url": "https://api.crownpeak.net/dqm-cms/v1/assets/"+assetId+"/spellcheck?apiKey="+apiKey,
  	"method": "GET",
  "timeout": 0,
  "headers": {
    "Accept": "application/json; charset=UTF-8",
    "x-api-key": apiKey
  },
};
console.log("Current asset on SpellCheck: " + assetId + " current Api: " + apiKey)
$.ajax(settings).done(function (response) {
	if (response.misspellings.length != 0){
		activeSpellCount.setSpellCount(response.misspellings.length);
			var i;
			for (i = 0; i < response.misspellings.length; i++) {
  				console.log("Number of spelling mistakes is: "+ activeSpellCount.getSpellCount());
				document.getElementById("spellingCheck").innerHTML += "<p id='errors'> -" + response.misspellings[i].word + "</p>";
				}
	}

})
//Inform user if request fails
  .fail(function (xhr, textStatus, errorThrown){
    alert('DQM did not respond when running spellcheck (error 1013)');
    closeNav(); // Close the UI
  });
}
function checkCheckpoints(){
  var assetId = activeAssetId.getAssetId(); // Get closed assetId variable
  var apiKey = activeApiKey.getApiKey(); // Get closed apiKey variable
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
	  activeCpErrors.setCpErrors(response.totalErrors); //Set total Checkpoint errors
	  activeTotalCheckpoints.setTotalCheckpoints(response.totalCheckpoints); //Set Total checkpoints on website
	  console.log("Total number of checkpoints: " + response.checkpoints.length) // Report to console
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
	})
  //Inform user if request fails
  .fail(function (xhr, textStatus, errorThrown){
    alert('DQM did not respond when running checkpoints (error 1014)');
    closeNav(); // Close the UI
  });
}

  //Kill the current asset to DQ clean.
  function clearAsset(){
    var apiKey = activeApiKey.getApiKey(); // Get closed apiKey variable
    var assetId = activeAssetId.getAssetId(); // Get closed assetId variable
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
  })
  //Inform user if request fails
  .fail(function (xhr, textStatus, errorThrown){
    alert('DQM did not respond when cleaning up (error 1015)');
      reloadMain();
  })
  .always(function (xhr, textStatus, errorThrown){
    //alert('ClearAsset() always() fired');
  });
  }
  function reloadMain(){
    location.reload(); // Reload to rest HTML on page
  }
