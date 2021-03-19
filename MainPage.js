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
			$('#display').val("");
			$('#clientid').val("");
			$('#currentlocation').val("");
			document.querySelector('#display').style.backgroundColor = "white";
			
		// ENSURE THAT DEST != SRC
		if (dest == source) {
			$('#display').val("Invaid because destination = source");
			return "";
		};
        
        // CREATE NEW CLIENT ON WEBSERVER, RESPONSE HAS ID INFO			
			let request = new Request('https://web-services-mail.herokuapp.com/newClient', {
				method: 'GET',
				headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true}});
				
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
					$('#clientid').val(clientID);
				} else {
					$('#display').val("Server returned status = bad");
					return ""
				}
			} else {
				$('#display').val("Connection failed, server not found");
				return "";
			}
			
			
			
        // IF YOU FOUND SERVER AND GOT VALID RESPONSE, MAKE OFFICIAL REQUEST
			// Insert received data into json, make string for transit.
			var url = 'https://web-services-mail.herokuapp.com/rawLeaveMessage?clientID=' + clientID.toString();
			let pay = source + dest
			
			request = new Request(url, {
				method: 'POST',
				headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
				body: JSON.stringify({'payload': pay})});
				
			jsonrec = await fetch(request)
				.then(response => response.json())
				.catch((error) => {console.error('Error: ', error);success = false;});
			
			console.log(jsonrec);
			
			if (success == false) {
				$('#display').val("Server didn't respond");
				return "";
			}
			if (jsonrec.status == 'bad') {
				$('#display').val("No robots to service");
				return "";
			}
			
        
        // DISABLE INPUTS UNTIL TASK FINISHED
			document.querySelector('#source').disabled = true;
			document.querySelector('#destination').disabled = true;
			document.querySelector('#requestButton').disabled = true;
			
        // LOOP UNTIL currentLocation == destination
			//var jsonloop = JSON.stringify({ 
				//"status": "good",
				//"clientID": clientID,
				//"opperation": "getMessage",
				//"payload": ""});
			
			//request = new Request('http://localhost:8000', {
				//method: 'POST',
				//headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
				//body: jsonloop});
				
			//// Update display with the robotID
			//document.querySelector('#clientid').value = clientID;
			
			//// Loop until robot has reached destination
			//timeout = 0;
			//var fetchNow = await new Promise(resolve => async function() {
				//if (timeout < 60){
					//if (timeout == 30) {
						//document.querySelector('#display').style.backgroundColor = "yellow";
					//} else if (timeout == 45) {
						//document.querySelector('#display').style.backgroundColor = "orange";
					//} else if (timeout == 55) {
						//document.querySelector('#display').style.backgroundColor = "red";
					//}
					//await sleep(1000);		// Get updates once per second to not overload system
					//fetch(request)
						//.then(function(response) {
							//// Unpack payload from inside JSON
							//jsonrec = response.json();
							
							//// Check if the getmessage succeeded
							//if (jsonrec.status == "done") {
								//// reset timeout
								//timeout = 0;
								//document.querySelector('#display').style.backgroundColor = "white";
								
								//// Set innerHTML of currentlocation output box
								//document.querySelector('#currentlocation').value = jsonrec.payload.currentLocation;
								
								//// Loop if destination != current location
								//if(jsonrec.payload.currentLocation == jsonrec.payload.destination) {;}
								//else {
									//fetchNow();
								//}
							//} else {
								//fetchNow();
								//timeout = timeout + 1;
							//}
						//})
						//.catch((error) => {
							//console.error('Error: ', error);
							//timeout = timeout + 1;
							//fetchNow();
						//});
				//}
			//});
			
			//if (timeout == 60) {
				//document.querySelector('#display').value = "TIMEOUT: Too long since robot sent location, robot is lost";
			//} else {
				//document.querySelector('#display').value = "";
			//}
        
        // RESET ALL FIELDS, DELETE ASSOCIATED CLIENT
			document.querySelector('#source').disabled = false;
			document.querySelector('#destination').disabled = false;
			document.querySelector('#requestButton').disabled = false;
			
			//document.querySelector('#currentlocation').val("");
			//document.querySelector('#clientid').val("");
			
			//var jsondel = JSON.stringify({ 
				//"status": "good",
				//"clientID": clientID,
				//"opperation": "delete",
				//"payload": ""});
				
			//request = new Request('http://localhost:8000', {
			//method: 'POST',
			//headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
			//body: jsondel});
			
			//jsonrec = await fetch(request)
				//.catch((error) => {console.error('Error: ', error);});
    });
    
    // send test message
    $("#testButton").click(async function () {
		// Get information to be sent
		let sentID = document.querySelector('#sentID').value;
		let opperation = document.querySelector('#opperation').value;
		
		// Get payload, info
		let payload = document.querySelector('#payload').value;
		let pickup = document.querySelector('#pickup').value;
		let dropoff = document.querySelector('#dropoff').value;
		
		// set value depending on opperation
		url = 'https://web-services-mail.herokuapp.com/';
		meth = '';
		pay = '';
		head = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true};
		
		
		if (opperation == 'leaveMessage'){
			url += 'rawLeaveMessage?clientID=' + sentID;
			meth = 'POST';
			pay = {'payload':payload};
			
			// Make Request
			request = new Request(url, {
			method: meth,
			headers: head,
			body: pay});
		}
		else {
			if (opperation == 'delete'){
				url += 'delete?clientID=' + sentID;
				meth = 'GET';}
			else if (opperation == 'getMessage'){
				url += 'getMessage?clientID=' + sentID;
				meth = 'GET';}
			else if (opperation == 'newClient'){
				url += 'newClient';
				meth = 'GET';}
			
			// Make Request
			request = new Request(url, {
			method: meth,
			headers: head});
		}
			
		
		// Send message
		success = true;
		let jsonrec = await fetch(request)
			.then(response => response.json())
			.catch((error) => {console.error('Error: ', error);success = false;});
			
		// Log response
		if (success) {
			$("#output").val(JSON.stringify(jsonrec));
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
