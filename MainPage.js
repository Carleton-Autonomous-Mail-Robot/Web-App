$(document).ready(function(){
    function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
    $("#requestButton").click(async function () {
        
        // FETCH FORM INFO AND RESET FIELDS
			let source = document.querySelector('#source').value;
			let dest = document.querySelector('#destination').value;
			document.querySelector('#display').value = "";
			document.querySelector('#robotid').value = "";
			document.querySelector('#currentlocation').value = "";
        
        // CREATE NEW CLIENT ON WEBSERVER, RESPONSE HAS ID INFO
			var jsonnew = JSON.stringify({ 
				"status": "good",
				"clientID": "",
				"opperation": "new",
				"payload": {
					"sender": "",
					"receiver": "",
					"pickup": source,
					"destination": dest,
					"currentLocation": ""}});
					
			// Todo encrypt
			
			let request = new Request('http://localhost:5000', {
				method: 'POST',
				mode: 'no-cors',
				headers: {'Content-Type': 'application/json'},
				body: jsonnew});
				
			// Send message, await response. Store IDs
			let robotID = 0;
			let clientID = 0;
			let success = true;
			let response = await fetch(request)		// Todo decrypt
				.catch((error) => {console.error('Error: ', error);success = false;});
			
			if (success) {
				let jsonrec = await response.json()	// Todo decrypt
					.catch((error) => {console.error('Error: ', error);success = false;});
				if (success) {
					robotID = jsonrec.payload.receiver;
					clientID = jsonrec.payload.sender;
				} else {
					document.querySelector('#display').value = "Invalid Response";
					return "";
				}
				if (robotID == "") {
					document.querySelector('#display').value = "No active robots";
					return "";
				}
			} else {
				document.querySelector('#display').value = "Connection failed, server not found";
				return "";
			}
			
        // IF YOU FOUND SERVER AND GOT VALID RESPONSE, MAKE OFFICIAL REQUEST
			// Insert received data into json, make string for transit.
			var jsonLmsg = JSON.stringify({ 
				"status": "good",
				"clientID": robotID,
				"opperation": "leaveMessage",
				"payload": {
					"sender": clientID,
					"receiver": robotID,
					"pickup": source,
					"destination": dest,
					"currentLocation": ""}});
				
			// Todo encrypt
				
			request = new Request('http://localhost:5000', {
				method: 'POST',
				mode: 'no-cors',
				headers: {'Content-Type': 'application/json'},
				body: jsonLmsg});
				
			response = await fetch(request)		// Todo decrypt
				.catch((error) => {console.error('Error: ', error);success = false;});
				
			if (success) {
				let jsonrec = await response.json()	// Todo decrypt
					.catch((error) => {console.error('Error: ', error);success = false;});
				if (success == false) {
					document.querySelector('#display').value = "Invalid Response JSON";
					return "";
				}
			} else {
				document.querySelector('#display').value = "Server not found";
				return "";
			}
        
        // DISABLE INPUTS UNTIL TASK FINISHED
			document.querySelector('#source').disabled = true;
			document.querySelector('#destination').disabled = true;
			document.querySelector('#requestButton').disabled = true;
			
        // LOOP UNTIL currentLocation == destination
			var jsonloop = JSON.stringify({ 
				"status": "good",
				"clientID": robotID,
				"opperation": "getMessage",
				"payload": {
					"sender": clientID,
					"receiver": robotID,
					"pickup": source,
					"destination": dest}});
					
			// Todo encrypt
			
			request = new Request('http://localhost:5000', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: jsonloop});
				
			// Update display with the robotID
			document.querySelector('#robotid').value = robotID;
			
			// Loop until robot has reached destination
			let i = 0;
			var fetchNow = async function() {
				await sleep(1000);		// Get updates once per second to not overload system
				fetch(request)
					.then(function(response) {
						// Todo decrypt
						
						// Unpack payload from inside JSON
						let jsonrec = response.json();
						
						// Set innerHTML of currentlocation output box
						document.querySelector('#currentlocation').value = jsonrec.payload.currentLocation;
						
						// Loop if destination != current location
						if(jsonrec.payload.currentLocation == jsonrec.payload.destination) {
							;
						}
						else {
							fetchNow();
						}
					})
					.catch((error) => {console.error('Error: ', error);});
			};
        
        // RESET ALL FIELDS, DELETE ASSOCIATED CLIENT
			document.querySelector('#source').disabled = false;
			document.querySelector('#destination').disabled = false;
			document.querySelector('#requestButton').disabled = false;
			
			document.querySelector('#currentlocation').value = "";
			document.querySelector('#robotid').value = "";
			document.querySelector('#display').value = "";
			
			
			// Todo delete client
    });
});
