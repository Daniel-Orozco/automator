var txt = '';
var command = '';
var input = '';
var sectionbreak = '\n ------------------------------------------ \n';
var result = 0;
var prevState = '';
var hasPoint = false;
var saveOperation = '';

var numbers = new Stack();
var operators = new Stack();
var signs = new Stack();

var varA = 0.0;
var varB = 0.0;
var varC = 0.0;

var currentError = '';
function overlay() {
    el = document.getElementById("overlay");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}
function captureInput(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter
        numbers = new Stack();
        operators = new Stack();
        signs = new Stack();

        currentError = '';
        saveOperation = false;
        input = document.getElementById("input").value;
        command = input;
        characters = command.split('');
        prevState = '';

        if (isValid()) {
            command += "\n";
            for (i = 0; !hasError() && i < characters.length; i++) {
                if (characters[i] == ' ') {
                    continue;
                }
                if (characters[i] == '=') {
                    if(characters.length > 1 && i < characters.length - 2) {
                        errorOutput('Invalid Expression');
                        if(event.preventDefault) event.preventDefault();
                        return true;
                    }
                    if(characters.length > 1 && isVariable(characters[i+1])) {
                        saveOperation = characters[i+1];
                    }
                    else if(i != characters.length - 1)
                    {
                        errorOutput('Invalid Expression');
                        if(event.preventDefault) event.preventDefault();
                        return true;
                    }
                    break;
                }
                else if(!hasError()){
                    //Number
                    if (isNumber(characters[i])) {
                        if(prevState == 'Number') {
                            errorOutput('Invalid Expression');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        var numword = '';
                        while (!hasError() && i < characters.length && isNumber(characters[i])) {
                            numword += characters[i];
                            i++;
                        }
                        i--;
                        if(hasPoint && numword.length > 98 || !hasPoint && numword.length > 99) {
                            errorOutput('Overflow');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        hasPoint = false;
                        numbers.push(parseFloat(numword));
                        if(signs.getCount()!=0) {
                            switch(signs.pop()) {
                                case "-":
                                    numbers.push(numbers.pop()*-1);
                                    break;
                                case "–":
                                    numbers.push(numbers.pop()*-1);
                                    break;
                            }
                        }
                        prevState = 'Number';
                    }
                    //Parenthesis
                    else if (characters[i] == '(') {
                        operators.push(characters[i]);
                    }
                    else if (characters[i] == ')') {
                        while (!hasError() && operators.peek() != '(') {
                            if(!(pushNumber(applyOperation(operators.pop(), numbers.pop(), numbers.pop())))) {
                                if(event.preventDefault) event.preventDefault();
                                return true;
                            }
                        }
                        operators.pop();
                    }
                    //Sign
                    else if((characters[i] == "+" || characters[i] == "-")&&(i==0 || isOperator(characters[i-1]))) {
                        if(signs.getCount() > 0) {
                            errorOutput('Invalid Expression');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        if(signs.peek() == '+') {
                            errorOutput('Invalid Expression');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        signs.push(characters[i]);
                        prevState = 'Sign';
                    }
                    //Operations
                    else if (isOperator(characters[i])) {
                        while (!hasError() && operators.peek() != null && higherOrder(characters[i], operators.peek())) {
                             if(!(pushNumber(applyOperation(operators.pop(), numbers.pop(), numbers.pop())))) {
                                 if(event.preventDefault) event.preventDefault();
                                 return true;
                             }
                        }
                        operators.push(characters[i]);
                        prevState = 'Operator';
                    }
                    else {
                        errorOutput('Invalid Expression');
                        if(event.preventDefault) event.preventDefault();
                        return true;
                    }
                }
            }
            if (!hasError()) {
                while (operators.peek() != null) {
                    if(!(pushNumber(applyOperation(operators.pop(), numbers.pop(), numbers.pop())))) {
                        if(event.preventDefault) event.preventDefault();
                        return true;
                    }
                }
                validOutput();
            }

        }
        else {
            errorOutput('Invalid Expression');
            if(event.preventDefault) event.preventDefault();
            return false;
        }
        return false;
    }
}
//oplog: txt += input
function errorOutput(type) {
    currentError = type;
    txt = input + "\n"+type.toUpperCase()+" ERROR" + sectionbreak;
    document.getElementById("operations").innerHTML = txt;
    var errorMsg = type+" error. ";
    switch (type) {
        case 'Arithmetic':
            errorMsg+="Remove arithmetic errors (divide by 0, square root of negative, etc.)";
            break;
        case 'Operator':
            errorMsg+="Operators cannot be stacked unless to denote negative numbers once.";
            break;
        case 'Overflow':
            errorMsg+="A number has exceeded the max digit limit, which is 99.";
            break;
        case 'Invalid Expression':
            errorMsg+="Only numbers, variables, operators and equal sign are allowed.";
            break;
        default:
            break;
    }
    document.getElementById('message').innerHTML = errorMsg;
    document.getElementById('decimal').value = "";
    document.getElementById('hex').value = "";
    document.getElementById('binary').value = "";

    commonOutput();
}
function commonOutput() {
    document.getElementById('input').value = "";

    document.getElementById('varA').value = varA;
    document.getElementById('varB').value = varB;
    document.getElementById('varC').value = varC;

    var textArea = document.getElementById('operations');
    textArea.scrollTop = textArea.scrollHeight;

    if(event.preventDefault) event.preventDefault();
}
function validOutput() {
    result = numbers.pop();

    switch(saveOperation) {
        case 'A':
            document.getElementById('varA').value = result;
            varA = result;
            break;
        case 'B':
            document.getElementById('varB').value = result;
            varB = result;
            break;
        case 'C':
            document.getElementById('varC').value = result;
            varC = result;
            break;
        case '':
            break;
        default:
            break;
    }

    txt = command + "= " + result + sectionbreak;
    document.getElementById("operations").innerHTML = txt;
    document.getElementById('message').innerHTML = " ";
    document.getElementById('decimal').value = result;
    document.getElementById('hex').value = convertDecimal(parseInt(result), 16);
    document.getElementById('binary').value = convertDecimal(parseInt(result), 2);

    commonOutput();
}

function isValid() {
    var isValid = false;
    var re = /[0-9A-Ca-c+-/*^()= ]/g;
    //var re = /([ ]*[-+]?[0-9]{1,12})([ ]*[+-/*][ ]*[+-]?[0-9]{1,12})*([ ]*[=]{1}[ ]*)/g; //
    isValid = re.test(command);
    if(isValid)
        return true;
    errorOutput('Invalid Expression');
    return false;
}

function hasError() {
    if(currentError != '') {
        return true;
    }
    return false;
}

function pushNumber(num) {
    if(num != null) {
        numbers.push(num);
        return true;
    }
    return false;
}
function applyOperation(operator, b, a) {
    if(a == null || b == null)
    {
        errorOutput('Operator');
        return null;
    }
    var limit = 8;
    if(!inRange(a, limit) || !inRange(b, limit))
    {
        errorOutput('Overflow');
        return null;
    }
    var currOp = a + " " + operator + " " + b + " = ";
    switch (operator)
    {
        case '+':
            if(!inRange(a+b, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            command += currOp + (a+b) + "\n";
            return a + b;
            break;
        case '-':
            if(!inRange(a-b, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            if(command == input+"\n" && a == 0) {
                return a - b;
            }
            command += currOp + (a-b) + "\n";
            return a - b;
            break;
        case '–':
            if(!inRange(a-b, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            if(command == input+"\n" && a == 0) {
                return a - b;
            }
            command += currOp + (a-b) + "\n";
            return a - b;
            break;
            break;
        case '*':
            if(!inRange(a*b, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            command += currOp + (a*b) + "\n";
            return a * b;
            break;
        case '/':
            if (b == 0) {
                errorOutput('Arithmetic');
                return null;
            }
            else {
                if(!inRange(a/b, limit))
                {
                    errorOutput('Overflow');
                    return null;
                }
                command += currOp + (parseFloat(a/b)) + "\n";
                return parseFloat(a / b);
            }
            break;
        case '^':
            if(!inRange(Math.pow(a,b),limit))
            {
                errorOutput('Overflow');
                return null;
            }
            command += currOp + (parseFloat(Math.pow(a,b))) + "\n";
            return parseFloat(Math.pow(a,b));
            break;
    }
    return 0;
}
function countDigits(num) {
    return (num + '').replace('.','').length;
}
function inRange(num, limit) {
    if(countDigits(num) > limit)
        return false;
    return true;
}
function convertDecimal(num, base) {
    if(num <= 0) return 0;
    var remaining = num;
    var digits = '';
    var mod = 0;
    while(remaining > 0) {
        mod = parseFloat(remaining % base);
        switch(mod) {
            case 10: digits += ('A');
                break;
            case 11: digits += ('B');
                break;
            case 12: digits += ('C');
                break;
            case 13: digits += ('D');
                break;
            case 14: digits += ('E');
                break;
            case 15: digits += ('F');
                break;
            default: digits += (mod);
                break;    
        }
        remaining = parseFloat(remaining / base);
    }
    return reverseString(digits);
}

function reverseString(s) {
    return s.split("").reverse().join("");
}
function isOperator(chara) {
    if(chara == '+' || chara == '-' || chara == '–' || chara == '*' || chara == '/' || chara == '^')
        return true;
    return false;
}

function isVariable(chara) {
    if(chara == 'A' || chara == 'B' || chara == 'C')
        return true;
    return false;
}

function isNumber(num) {
    if (num >= '0' && num <= '9')
        return true;
    if(num == '.' && !hasPoint) {
        hasPoint = true;
        return true;
    }
    return false;
}

function higherOrder(op1, op2) {
    if (op2 == '(' || op2 == ')')
        return false;
    if ((op1 == '*' || op1 == '/') && (op2 == '+' || op2 == '-'))
        return false;
    return true;
}

function Stack(){
    this.top = null;
    this.count = 0;

    this.getCount = function(){
        return this.count;
    }

    this.getTop = function(){
        return this.top;
    }

    this.push = function(data){
        if(data !== null) {
            var node = {
                data : data,
                next : null
            }

            node.next = this.top;
            this.top = node;

            this.count++;
        }
    }

    this.peek = function(){
        if(this.top === null){
            return null;
        }else{
            return this.top.data;
        }
    }

    this.pop = function(){
        if(this.top === null){
            return null;
        }else{
            var out = this.top;
            this.top = this.top.next;
            if(this.count>0){
                this.count--;
            }

            return out.data;
        }
    }
}