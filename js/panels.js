var txt = '';
var command = '';

var numbers = new Array();
var operators = new Array();

function captureInput(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        command = document.getElementById("input").value;
        characters = command.split('');

        if (isValid()) {
            command = '';
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

function isValid() {

    var isValid = false;
    var re = /([-+]?[0-9]*\.?[0-9]+[\/\+\-\*])+([-+]?[0-9]*\.?[0-9]+)(?=.*=$)/g;
    // positivo/negativo; 0-9 .; /+-*; =;

    isValid = re.test(command);

    return isValid;
}

function applyOperation(operator, b, a) {
    switch (operator)
    {
        case '+':
            return a + b;
            break;
        case '-':
            return a - b;
            break;
        case '*':
            return a * b;
            break;
        case '/':
            if (b == 0) {
                arithmeticError = true;
            }
            else {
                return parseInt(a / b);
            }
            break;
    }
    return 0;
}


function higherOrder(op1, op2) {
    if (op2 == '(' || op2 == ')')
        return false;
    if ((op1 == '*' || op1 == '/') && (op2 == '+' || op2 == '-'))
        return false;
    return true;
}