var txt = '';
var command = '';

var numbers = new Array();
var operators = new Array();

function process(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        command = document.getElementById("input").value;
        characters = command.split('');
        command = '';

        var isValid = false;

        for (i = 0; i < characters.length; i++) {
            if(characters[i] == '=') {
                isValid = true;
                break;
            }
        }

        if (isValid) {
            for (i = 0; i < characters.length; i++) {
                if(characters[i] != ' ')
                    command += characters[i] + "\n";
            }

            txt += command + "=====\n";
            document.getElementById("operations").innerHTML = txt;

            document.getElementById('message').innerHTML = "";
        }
        else {
            document.getElementById('message').innerHTML = "Error: Invalid expression";
        }

        document.getElementById('input').value = "";
        if(event.preventDefault) event.preventDefault();
        return false;
    }
}

/*
for(cleft = characters.length; cleft >= 0; cleft--) {
    if (characters[cleft] == '=') {
        isValid = true;
        break;
    }
    if (characters[cleft] != ' ')
        break;
}*/

/*
for (i = 0; i < characters.length; i++) {
    if (characters[i] == ' ')
        continue;

    if (characters[i] >= '0' && characters[i] <= '9') {
        var numword = '';
        while (i < characters.length && characters[i] >= '0' && characters[i] <= '9')
            numword += characters[i++];
        numbers.push(parseInt())
    }
}
command = numbers.pop();
*/
