'use strict';

//Misc. Hexadecimal to RGB functions
var hex = {
    //Hexadecimal regex
    reg: new RegExp('^([A-Fa-f0-9]{6})$'),
    toR(h) {
        return parseInt(h.substring(0, 2), 16)
    },
    toG(h) {
        return parseInt(h.substring(2, 4), 16)
    },
    toB(h) {
        return parseInt(h.substring(4, 6), 16)
    },
    //Compare argument to hex.reg
    test(h) {
        if (hex.reg.test(h)) {
            return true;
        }
        return false;
    }
    
}

//Array of palettes created during session
var colorObject = [];
//String to hold objectURL to revoke
var textFile = "";
//Bind hexadecimal events to relevant inputs

function init(defInput){
    for (let i = 0; i < defInput; i++){
        addColor();
    }
}

function addColor(){
    //Grab all current inputs and create necessary elements
    var items = document.querySelectorAll(".hexInput");
    var newInputDiv = document.createElement("div");
    var newInputH4 = document.createElement("h4");
    var newInput = document.createElement("INPUT");
    newInput.setAttribute("type", "text");
    newInput.setAttribute("placeholder","HEXADECIMAL");
    newInput.className = 'hexInput';
    //IIFE that assigns an event listener to newly created element
        (function () {
            var j = document.querySelectorAll(".hexInput").length;
            return function () {
                return newInput.addEventListener("keyup", function () {
                    var itemArr = document.querySelectorAll(".hexInput");
                    //If value is or exceeds the length of a hexadecimal, slice and update the styling
                    if (itemArr[j].value.length > 6) {
                        itemArr[j].value = itemArr[j].value.slice(0, 6);
                    }
                    //Test input for regex
                    if (hex.test(itemArr[j].value)) {
                        itemArr[j].style.backgroundColor = "#" + itemArr[j].value;
                        itemArr[j].blur;
                        //If not last hexadecimal input, focus onto the next one in the dom
                        if (j < itemArr.length - 1) {
                            itemArr[j + 1].focus();
                        } 
                    //If input doesn't pass regex, check if length exceeds 6 and display warning color
                    } else if (itemArr[j].value.length > 6) {
                        itemArr[j].style.backgroundColor = '#f00';
                    //Else set the color to default
                    } else {
                        itemArr[j].style.backgroundColor = '#fff';
                    }
                });
            }
        })()();
    newInputH4.appendChild(document.createTextNode(`Color ${items.length + 1}`));
    newInputDiv.appendChild(newInputH4);
    newInputDiv.appendChild(newInput);
    //Append previewButton element to dom
    var element = document.getElementById('inputArea');
    element.insertBefore(newInputDiv, document.querySelectorAll(".button")[0]);
    
}

function removeColor(){
    var items = document.querySelectorAll('.hexInput');
    if (items.length < 3) {
        alert('A palette must contain at least two colors!');
        return null;
    }
    items[items.length - 1].parentNode.remove();
}

//Calls create palette and maketextfile and sets the returned url into button
function addPalette() {
    document.getElementById('downloadlink').href = makeTextFile(createPalette());
}

//Creates an object url and resets the input
function makeTextFile(text) {
    //If there is no JSON passed in, return last file created.
    if (text === null) {
        console.log(null);
        return textFile;
    }
    else {
        //Revoke currently used object url
        window.URL.revokeObjectURL(textFile);
        //Create a new object url
        textFile = window.URL.createObjectURL(new Blob([text], {
            type: 'text/plain'
        }));
        //Make download button visible and reset inputs
        document.getElementById('downloadBox').style.display = 'block';
        document.getElementById('paletteName').value = "";
        var items = document.querySelectorAll(".hexInput");
        for (var i = 0; i < items.length; i++) {
            items[i].value = '';
            items[i].style.backgroundColor = '';
        }
        //Return the object url for use
        return textFile;
    }
};

//Grab data from input and create a palette object to add to array colorObject and return JSON string
function createPalette() {
    //Create empty object and return all hexadecimal inputs
    var palette = {}
        , items = document.querySelectorAll(".hexInput");
    palette.name = document.getElementById('paletteName').value.trim();
    if (!palette.name) {
        alert("Please provide a palette name!");
        return null;
    }
    //Create empty arrays to hold hexadecimal and rgb values
    palette.hex = [];
    palette.rgb = [];
    for (var i = 0; i < items.length; i++) {
        //Check if value is a valid hexadecimal
        if (!hex.test(items[i].value)) {
            alert("Please use valid hexadecimal values!");
            return null;
        }
        //Assign input data to palette object and create another array withing rgb to iterate through
        palette.hex[i] = items[i].value.trim();
        palette.rgb[i] = [];
        palette.rgb[i][0] = hex.toR(items[i].value.trim());
        palette.rgb[i][1] = hex.toG(items[i].value.trim());
        palette.rgb[i][2] = hex.toB(items[i].value.trim());
    }
    //Push palette object to global palette array
    colorObject.push(palette);
    //Create new button to preview newly created palette
    var previewButton = document.createElement("li");
    previewButton.className = 'button';
    previewButton.appendChild(document.createTextNode(palette.name));
    //IIFE that assigns an event listener to newly created element
    (function () {
        var j = colorObject.length - 1;
        return function () {
            return previewButton.addEventListener("click", function () {
                switchPreview(j);
            });
        }
    })()();
    //Append previewButton element to dom
    document.getElementById('listOfPalettes').appendChild(previewButton);
    switchPreview(colorObject.length - 1);
    return JSON.stringify(colorObject);
};

//Changes preview styling for selected palette
function switchPreview(switchTo) {
    //Add palette title.
    document.getElementById('previewName').innerHTML = colorObject[switchTo].name;
    //Select all preview divs
    var items = document.querySelectorAll(".palettePreview");
    //If there are less divs than colors in the given palette, add more
    if (items.length < colorObject[switchTo].hex.length) {
        for (var i = 0; i < colorObject[switchTo].hex.length - items.length; i++) {
            var previewDiv = document.createElement("div");
            previewDiv.className = 'palettePreview';
            document.getElementById('previewStage').appendChild(previewDiv);
        }
    }
    //Update preview selection to include any added divs
    items = document.querySelectorAll(".palettePreview");
    //For each div, update styling according to given palette. If end of palette has been reached, remove any extra divs
    for (var j = 0; j < items.length; j++) {
        if (j >= colorObject[switchTo].hex.length) {
            items[j].remove();
        }
        else {
            items[j].style.backgroundColor = `#${colorObject[switchTo].hex[j]}`;
        }
    }
}