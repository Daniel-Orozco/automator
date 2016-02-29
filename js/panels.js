var txt = '';
var command = '';
var input = '';
var sectionbreak = '\n ------------------------------------------ \n';
var result = 0;

var numbers = new Stack();
var operators = new Stack();

var arithmeticError = false;
var operatorError = false;

function captureInput(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 32) {
        if(event.preventDefault) event.preventDefault();
        return false;
    }
    if (code == 13) { //Enter keycode
        input = document.getElementById("input").value;
        command = input;
        characters = command.split('');

        arithmeticError = false;
        operatorError = false;

        if (isValid()) {
            command += "\n";

            for (i = 0; !hasError() && i < characters.length; i++) {
                if (characters[i] == ' ') {
                    continue;
                }
                if (characters[i] == '=') {
                    break;
                }
                else if(!hasError()){
                    //Number
                    if (isNumber(characters[i])) {
                        var numword = '';
                        while (!hasError() && i < characters.length && isNumber(characters[i]))
                            numword += characters[i++];
                        numbers.push(parseInt(numword));
                    }
                    //Parenthesis
                    else if (characters[i] == '(') {
                        operators.push(characters[i]);
                    }
                    else if (characters[i] == ')') {
                        while (!hasError() && operators.peek() != '(') {
                            if(!(pushNumber(applyOperation(operators.pop(), numbers.pop(), numbers.pop())))) {
                                errorOutput();
                                if(event.preventDefault) event.preventDefault();
                                return true;
                            }
                        }
                        operators.pop();
                    }
                    //Operations
                     if (isOperator(characters[i])) {
                         while (!hasError() && operators.peek() != null && higherOrder(characters[i], operators.peek())) {
                             if(!(pushNumber(applyOperation(operators.pop(), numbers.pop(), numbers.pop())))) {
                                 errorOutput();
                                 if(event.preventDefault) event.preventDefault();
                                 return true;
                             }
                        }
                        operators.push(characters[i]);
                    }
                }
            }
            if (!hasError()) {
                while (operators.peek() != null) {
                    if(!(pushNumber(applyOperation(operators.pop(), numbers.pop(), numbers.pop())))) {
                        errorOutput();
                        if(event.preventDefault) event.preventDefault();
                        return true;
                    }
                }
                result = numbers.pop();
                //
                txt += command + "= " + result + sectionbreak;
                document.getElementById("operations").innerHTML = txt;

                document.getElementById('message').innerHTML = " ";
                //
            }

        }
        else {
            document.getElementById('message').innerHTML = "Error: Invalid expression";
        }

        document.getElementById('input').value = "";
        if(event.preventDefault) event.preventDefault();
        return false;
    }
}

function errorOutput() {
    txt += input + "\nERROR" + sectionbreak;
    document.getElementById("operations").innerHTML = txt;
    document.getElementById('message').innerHTML = arithmeticError ? "Error: Arithmetic error" : "Error: Operator error";
    document.getElementById('input').value = "";
}

function isValid() {

    var isValid = false;
    var re = /([-+]?[0-9]*\.?[0-9]+[\/\+\-\*])+([-+]?[0-9]*\.?[0-9]+)(?=.*=$)/g;
    // positivo/negativo; 0-9 .; /+-*; =;

    isValid = re.test(command);

    for (i = 0; i < characters.length; i++) {
        var opword = '';
        while (i < characters.length && isOperator(characters[i]))
            opword += characters[i++];
        if(opword.length > 2)
            return false;
    }

    return isValid;
}

function hasError() {
    if(arithmeticError == true || operatorError == true) {
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
        operatorError = true;
        return null;
    }
    var currOp = a + " " + operator + " " + b + " = ";
    switch (operator)
    {
        case '+':
            command += currOp + (a+b) + "\n";
            return a + b;
            break;
        case '-':
            command += currOp + (a-b) + "\n";
            return a - b;
            break;
        case '*':
            command += currOp + (a*b) + "\n";
            return a * b;
            break;
        case '/':
            if (b == 0) {
                arithmeticError = true;
                return null;
            }
            else {
                command += currOp + (parseInt(a/b)) + "\n";
                return parseInt(a / b);
            }
            break;
    }
    return 0;
}

function isOperator(chara) {
    if(chara == '+' || chara == '-' || chara == '*' || chara == '/')
        return true;
    return false;
}

function isNumber(num) {
    if (num >= '0' && num <= '9')
        return true;
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