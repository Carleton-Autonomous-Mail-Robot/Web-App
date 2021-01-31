$(document).ready(function(){
    
    $("#requestButton").click(function () {
        console.log("TEST!");
        
        // Fetch form info
        let source = document.querySelector('#source');
        let dest = document.querySelector('#destination');

        // Insert into json, make string for transit
        var jsondata = JSON.stringify({ "status": "good", "clientID": "", "opperation": "leaveMessage", "payload": [source, dest]});
        
        // Send message
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5000/", true);
        xhr.setRequestHeader("Content-Type", "json")
        
        // Create a state change callback for getting response
        /*
        xhr.onreadystatechange = function () { 
            if (xhr.readyState === 4 && xhr.status === 200) { 
				// Print received data from server 
				result.innerHTML = this.responseText; 
			} 
		};
        */
        xhr.send(jsondata);
        
    });
});
