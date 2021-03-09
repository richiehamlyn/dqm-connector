//Slider code
function openNav() {
  document.getElementById("floatingDQButton").style.display = "none"; //Switch DQ button off
  
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  
  runDQ();
  //loadChart(); //Load the chart for the widget
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
  document.getElementById("floatingDQButton").style.display = "block"; // Switch DQ button on again
  location.reload(); // Reload to rest HTML on page
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
    var apiKey = "pE9tUxSzHYXAC63G26EkaJDmwtP62QJ9j8lWXOXh"; //Enter your API key for Crownpeak DQ from support@crownpeak.com
    var websiteId = "990e142732508455348a95ffd31e4efd"; //Enter your DQ site address (you can get this through the API or from Support)
    var spellingCount = 0;
    var cpErrors = 0;
    var totalCheckpoints = 0;
    //Pass all html from the page in to a variable to pass to DQ
    //var markup = document.documentElement.innerHTML;
    var markup = document.getElementById("main").innerHTML; // Copy all html inside the main div tag...
    console.log(markup);
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
        "content": markup,
        "contentType": "text/html; charset=UTF-8"
      }
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      console.log("Asset ID: " + response.id); //test
      assetId = response.id; //test
      console.log("Asset ID set to: " + assetId); //test
      console.log("About to run checkDQ");
      checkDq(); // Run the DQ check
      checkSpellings(); //Run spell checker on DQ Server
      checkCheckpoints(); //Run checkpoint checker on DQ server
    });

}
function checkDq(){
  //Gets the assets highlighted html from DQ
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
    console.log(response);
    //document.querySelector('html').innerHTML = response; 
    document.getElementById('main').innerHTML = response; //Replace the main div with the htnl from DQ
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
  console.log(response);
  console.log(response.misspellings[0].word);
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
	  console.log(response);
	  console.log(response.totalErrors);
	  cpErrors = response.totalErrors;
	  totalCheckpoints = response.totalCheckpoints;
	  console.log("Total number of checkpoints: " + response.checkpoints.length)
    var pageIcon;
    var sourceIcon;
	  	var i;
			for (i = 0; i < response.checkpoints.length; i++) { 
        //Is the error source code
        if (response.checkpoints[i].canHighlight.source){
          sourceIcon = "<i class='fas fa-code' title='source'></i>";
        }
        //Is the error source code
        if (response.checkpoints[i].canHighlight.page){
          pageIcon = "<i class='fas fa-file-alt' title='page'></i>";
        }
				if (response.checkpoints[i].failed){
					var topics = "";  //Store topics of error
					var c;
					for (c = 0; c < response.checkpoints[i].topics.length; c++) { 
						topics += response.checkpoints[i].topics[c] +" | ";
					}
  				console.log("Error found! #"+ i);
				document.getElementById("errorList").innerHTML += "<p><b>" + topics + "</b>" + pageIcon + " " + sourceIcon + "</p><p>"+ response.checkpoints[i].name +"</p><a href='#' id='expander' data-toggle='collapse' data-target='#demo" + [i] + "'> more details...</a><div id='demo" + [i] + "' class='collapse'>" + response.checkpoints[i].description + "</div><hr>";
				}
			}
	  loadChart(); //Load the chart for the widget
	});
}