$(document).ready(function(){
	
    function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	// initally hidden
	$("#basicPayload").hide();
	
	// send standard delivery request
    $("#requestButton").click(async function () {
        
        // FETCH FORM INFO AND RESET FIELDS
			let source = document.querySelector('#source').value;
			let dest = document.querySelector('#destination').value;
			document.querySelector('#display').value = "";
			document.querySelector('#clientid').value = "";
			document.querySelector('#currentlocation').value = "";
			document.querySelector('#display').style.backgroundColor = "white";
			
		// ENSURE THAT DEST != SRC
		if (dest == source) {
			document.querySelector('#display').value = "Invaid because destination = source";
			return "";
		}
        
        // CREATE NEW CLIENT ON WEBSERVER, RESPONSE HAS ID INFO
			var jsonnew = JSON.stringify({ 
				"status": "good",
				"clientID": "",
				"opperation": "newClient",
				"payload": "user"});
			
			let request = new Request('http://localhost:5000', {
				method: 'POST',
				headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
				body: jsonnew});
				
			// Send message, await response. Store IDs
			let clientID = 0;
			let success = true;
			let jsonrec = await fetch(request)
				.then(response => response.json())
				.catch((error) => {console.error('Error: ', error);success = false;});
			
			console.log(jsonrec);
			
			if (success) {
				if (jsonrec.status == "done") {
					clientID = jsonrec.clientID;
				}
			} else {
				document.querySelector('#display').value = "Connection failed, server not found";
				return "";
			}
			
			
			
        // IF YOU FOUND SERVER AND GOT VALID RESPONSE, MAKE OFFICIAL REQUEST
			// Insert received data into json, make string for transit.
			var jsonLmsg = JSON.stringify({ 
				"status": "good",
				"clientID": clientID,
				"opperation": "leaveMessage",
				"payload": {
					"pickup": source,
					"destination": dest,
					"currentLocation": ""
					}});
				
			request = new Request('http://localhost:5000', {
				method: 'POST',
				headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
				body: jsonLmsg});
				
			jsonrec = await fetch(request)
				.then(response => response.json())
				.catch((error) => {console.error('Error: ', error);success = false;});
				
			if (success == false) {
				document.querySelector('#display').value = "Server didn't respond";
				return "";
			}
			if (jsonrec.status == 'bad') {
				document.querySelector('#display').value = "No robots to service";
				return ""
			}
			
        
        // DISABLE INPUTS UNTIL TASK FINISHED
			document.querySelector('#source').disabled = true;
			document.querySelector('#destination').disabled = true;
			document.querySelector('#requestButton').disabled = true;
			
        // LOOP UNTIL currentLocation == destination
			var jsonloop = JSON.stringify({ 
				"status": "good",
				"clientID": clientID,
				"opperation": "getMessage",
				"payload": ""});
			
			request = new Request('http://localhost:5000', {
				method: 'POST',
				headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
				body: jsonloop});
				
			// Update display with the robotID
			document.querySelector('#clientid').value = clientID;
			
			// Loop until robot has reached destination
			timeout = 0;
			var fetchNow = await new Promise(resolve => async function() {
				if (timeout < 60){
					if (timeout == 30) {
						document.querySelector('#display').style.backgroundColor = "yellow";
					} else if (timeout == 45) {
						document.querySelector('#display').style.backgroundColor = "orange";
					} else if (timeout == 55) {
						document.querySelector('#display').style.backgroundColor = "red";
					}
					await sleep(1000);		// Get updates once per second to not overload system
					fetch(request)
						.then(function(response) {
							// Unpack payload from inside JSON
							jsonrec = response.json();
							
							// Check if the getmessage succeeded
							if (jsonrec.status == "done") {
								// reset timeout
								timeout = 0;
								document.querySelector('#display').style.backgroundColor = "white";
								
								// Set innerHTML of currentlocation output box
								document.querySelector('#currentlocation').value = jsonrec.payload.currentLocation;
								
								// Loop if destination != current location
								if(jsonrec.payload.currentLocation == jsonrec.payload.destination) {;}
								else {
									fetchNow();
								}
							} else {
								fetchNow();
								timeout = timeout + 1;
							}
						})
						.catch((error) => {
							console.error('Error: ', error);
							timeout = timeout + 1;
							fetchNow();
						});
				}
			});
			
			if (timeout == 60) {
				document.querySelector('#display').value = "TIMEOUT: Too long since robot sent location, robot is lost";
			} else {
				document.querySelector('#display').value = "";
			}
        
        // RESET ALL FIELDS, DELETE ASSOCIATED CLIENT
			document.querySelector('#source').disabled = false;
			document.querySelector('#destination').disabled = false;
			document.querySelector('#requestButton').disabled = false;
			
			document.querySelector('#currentlocation').value = "";
			document.querySelector('#clientid').value = "";
			
			var jsondel = JSON.stringify({ 
				"status": "good",
				"clientID": clientID,
				"opperation": "delete",
				"payload": ""});
				
			request = new Request('http://localhost:5000', {
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
			body: jsondel});
			
			jsonrec = await fetch(request)
				.catch((error) => {console.error('Error: ', error);});
    });
    
    // send test message
    $("#testButton").click(async function () {
		// Get information to be sent
		let status = document.querySelector('#status').value;
		let sentID = document.querySelector('#sentID').value;
		let opperation = document.querySelector('#opperation').value;
		
		// Get payload, either basic or other
		if ($("#paytype").is(':checked')) {
			let payload = document.querySelector('#payload').value
		} else {
			let pickup = document.querySelector('#pickup').value;
			let dropoff = document.querySelector('#dropoff').value;
			let location = document.querySelector('#location').value;
			let payload = {"pickup":pickup,"destination":dropoff,"currentLocation":location}
		}
		
		// Make message and request
		var json = JSON.stringify({ 
				"status": status,
				"clientID": sentID,
				"opperation": opperation,
				"payload": payload});
			
		let request = new Request('http://localhost:5000', {
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
			body: json});
		
		// Send message
		let jsonrec = await fetch(request)
			.then(response => response.json())
			.catch((error) => {console.error('Error: ', error);success = false;});
			
		// Log msg and response
		$("#output").value += "\n" + json;
		$("#output").value += "\n" + jsonrec + "\n";
	});
	
	// change type of message you're trying to send
	$("#paytype").click(function () {
		if($(this).is(':checked')){
			$("#basicPayload").show();
			$("#otherPayload").hide();
		} else {
			$("#basicPayload").hide();
			$("#otherPayload").show();
		}
	});
	
	// show request tab when clicked
	$("#pills-request-tab").click(function () {
		$("#pills-request").show();
		$("#pills-test").hide();
	});
	
	// show test tab when clicked
	$("#pills-test-tab").click(function () {
		$("#pills-test").show();
		$("#pills-request").hide();
	});
});
