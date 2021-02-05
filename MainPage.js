$(document).ready(function(){
    function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
    $("#requestButton").click(async function () {
        console.log("TEST!");
        
        // Fetch form info
        let source = document.querySelector('#source');
        let dest = document.querySelector('#destination');

        // Insert into json, make string for transit. Server will fill blank sections
        var jsondata = JSON.stringify({ 
			"status": "good",
			"clientID": "",
			"opperation": "leaveMessage",
			"payload": {
				"sender": "",
				"receiver": "",
				"pickup": source,
				"destination": dest}});
        
		// Encrypt jsondata
		
		
		// Construct initial request
		const request = new Request('http://localhost:5000', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: jsondata});
		
		
		// Send message, await response
		let success = true;
		let response = await fetch(request)
			.catch((error) => {console.error('Error: ', error);success = false;});
		let jsonrec = await response.json()
			.catch((error) => {console.error('Error: ', error);success = false;});
			
		// Decrypt jsonrec
		
		
		// Only run this if webserver is listening and responding
		if (success) {
			// Construct json message, encrypt, and request structure for loop
			var jsonloop = JSON.stringify({ 
				"status": "good",
				"clientID": jsonrec.payload.sender,
				"opperation": "getMessage",
				"payload": {
					"sender": jsonrec.payload.sender,
					"receiver": jsonrec.payload.receiver,
					"pickup": source,
					"destination": dest}});
			//ENCRYPT TODO
			const requestloop = new Request('http://localhost:5000', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: jsonloop});
			
			// Disable all inputs and button
			document.getElementById('source').disabled = true;
			document.getElementById('destination').disabled = true;
			document.getElementById('requestButton').disabled = true;
				
			// Update clientID with the robot's clientID
			document.getElementById('robotid').innerHTML = jsonrec.clientID;
			
			// Loop until robot has reached destination
			var fetchNow = async function() {
				await sleep(1000);		// Get updates once per second to not overload system
				fetch(requestloop)
					.then(function(response) {
						// Decrypt response
						
						
						// Unpack payload from inside JSON
						let jsonloc = response.json();
						
						// Set innerHTML of currentlocation output box
						document.getElementById('currentlocation').innerHTML = jsonloc.payload.currentLocation;
						
						// Loop if destination != current location
						if(jsonloc.payload.currentLocation == jsonloc.payload.destination) {
							;
						}
						else {
							fetchNow();
						}
					})
					.catch((error) => {console.error('Error: ', error);});
			};
			
			// Enable all inputs and button
			document.getElementById('source').disabled = false;
			document.getElementById('destination').disabled = false;
			document.getElementById('requestButton').disabled = false;
			
			// Clear relevant fields
			document.getElementById('currentlocation').innerHTML = "";
			document.getElementById('robotid').innerHTML = "";
		}
    });
});
