// x-coordinate of the left edge, the y-coordinate of the top edge, width, and height
// Just returns the x,y of the top edge
function calcBoxCentroid(boxStr) {
    var str_coords = boxStr.split(",");
    var int_coords = [];

    for(var c in str_coords) {
        int_coords.push(parseInt(str_coords[c]));
    }
    
    console.log(int_coords);
    
    return [int_coords[0], int_coords[1]];
    
    
}

// Parse JSON and return a list of box objects in following form:
// { coords:{x,y}, text: "" }

function generateBoxObjects(wordAr) {
    var boxAr = [];
    
    for(var w in wordAr) {
        var centroid = calcBoxCentroid(wordAr[w].boundingBox);
        var coords = {"X": centroid[0], "Y": centroid[1]};
        
        var boxObj = {"coords": coords, text: wordAr[w].text};
        
        boxAr.push(boxObj);
    }
    
    return boxAr;
}


// Extract all word objects from the JSON
// returns [ {boundingBox: "", text: ""} .... ]
function extractAllWords(JSON) {
    var allWords = [];
    if(JSON.hasOwnProperty("regions")) {
        for(var r in JSON.regions)
        {
            for(var l in JSON.regions[r].lines) { // each box in each line
                for(var w in JSON.regions[r].lines[l].words) { // each word in each box
                    allWords.push(JSON.regions[r].lines[l].words[w]);
                }
                
            }
        }
    } else {
        console.log("JSON does not have regions property");
    }

    for(var z in allWords) {
        console.log(allWords[z]);
    }
    
    return allWords
}

// Return ordered lines based on the coords of each box
// [[{coords:{X:int, Y:int}, text: ""}].... ]
function calculateAlignments(boxes) {
    var VERTICAL_DIFFERENCE_THRESHOLD = 40; // Number of pixels to accept boxes are on the same line
    var lines = []
    for(var i = 0; i < boxes.length; i++) {
        var line = [];
        line.push(boxes[i]);
        
        for(var ii = i+1; ii < boxes.length && (Math.abs(boxes[i].coords.Y - boxes[ii].coords.Y) < VERTICAL_DIFFERENCE_THRESHOLD); ii++) {

            console.log("HIT");
            line.push(boxes[ii]);
        }
        i = ii-1;
        line = sortByX(line);
        lines.push(line);
    }
    
    return lines;
}

function sortByY(values) {
  var length = values.length;
  for(var i = 1; i < length; ++i) {
    var temp = values[i];
    var j = i - 1;
    for(; j >= 0 && values[j].coords.Y > temp.coords.Y; --j) {
      values[j+1] = values[j];
    }
    values[j+1] = temp;
  }
  
  return values;
}

function sortByX(values) {
  var length = values.length;
  for(var i = 1; i < length; ++i) {
    var temp = values[i];
    var j = i - 1;
    for(; j >= 0 && values[j].coords.X > temp.coords.X; --j) {
      values[j+1] = values[j];
    }
    values[j+1] = temp;
  }
  
  return values;
}

// Squashes all lines from double array into constituent strings
// returns [str...]
function squash(input) {
    var lines = [];
    // console.log(input);
    
    for(var i = 0; i < input.length; i++) {
        var line = "";
        console.log(input[i].length);
        
        for(var ii = 0; ii < input[i].length; ii++) {
            line = line.concat((input[i][ii]).text, " ");
            console.log(input[i][ii].text);
        }
        
        lines.push(line);
    }
    
    return lines;
}



function callFuckingAPI(imageData) {
    var params = {
        // Request parameters
        "language": "unk",
        "detectOrientation ": "true",
    };
  
    $.ajax({
        url: "https://api.projectoxford.ai/vision/v1.0/ocr?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","dbe555d1130540c3895bab329405b236");
        },
        type: "POST",
        // Request body
        data: imageData,
    })
    .done(function(data) {
        alert("success");
        var words = extractAllWords(data);
        var boxes = generateBoxObjects(words);
        var sorted = sortByY(boxes);
        var aligned = calculateAlignments(sorted);
        var lines = squash(aligned);

        document.body.innerHTML = lines;
    })
    .fail(function(jqXHR, textStatus) {
        alert("error" + textStatus);
    });
}

function filterLines() {

}
// calcBoxCentroid("4360,1696,544,192");

// Main entry point to get lines of text
function ocrRoutine(imageData) {
  var ocrResults = callFuckingAPI(imageData);
  var words = extractAllWords(ocrResults);
  var boxes = generateBoxObjects(words);
  var sorted = sortByY(boxes);
  var aligned = calculateAlignments(sorted);
  var lines = squash(aligned);

  return lines;
}

// Parse lines into a usable JSON (OCR is done at this point)
// returns [{item: "", price: float}... ]

function parseLines(s) {
  var filteredLines = [];
  for(var i = 0; i < s.length; i++) {
    if(s[i].indexOf("$") > -1) {
      filteredLines.push(s[i]);
    }
  }
  
  parsedLines = [];
  re = /(.*\s*)\s\$(.*)/
  for(var i = 0; i < filteredLines.length; i++) {
    match = re.exec(filteredLines[i]);
    if(match[1] === null || match[2] === null) {
      console.log("Error ocurred in parseLines");
    }
    
    p = {"item": match[1], "price": parseFloat(match[2])};
    
    parsedLines.push(p);
  }
  
  return parsedLines;
}

(function () {
    var takePicture = document.querySelector("#take-picture"),
        showPicture = document.querySelector("#show-picture");

    if (takePicture && showPicture) {
        // Set events
        takePicture.onchange = function (event) {
            // Get a reference to the taken picture or chosen file
            var files = event.target.files,
                file;
            if (files && files.length > 0) {
                file = files[0];
                try {
        /*            // Create ObjectURL
                    var imgURL = window.URL.createObjectURL(file);

                    // Set img src to ObjectURL
                    showPicture.src = imgURL;

                    // Revoke ObjectURL
                    URL.revokeObjectURL(imgURL);


                      */
                      var fileReader = new FileReader();
                      fileReader.onload = function (event) {
                          showPicture.src = event.target.result;
                      };
                      fileReader.readAsDataURL(file);
                }
                catch (e) {
                    try {
                        // Fallback if createObjectURL is not supported
                        var fileReader = new FileReader();
                        fileReader.onload = function (event) {
                            showPicture.src = event.target.result;
                        };
                        fileReader.readAsDataURL(file);
                    }
                    catch (e) {
                        //
                        var error = document.querySelector("#error");
                        if (error) {
                            error.innerHTML = "Neither createObjectURL or FileReader are supported";
                        }
                    }
                }
            }
        };
    }
})();
