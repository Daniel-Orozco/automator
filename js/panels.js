var txt = '';
var command = '';
var result = 0;

var numbers = new Stack();
var operators = new Stack();

function captureInput(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        command = document.getElementById("input").value;
        characters = command.split('');


        if (isValid()) {

            var arithmeticError = false;

            for (i = 0; i < characters.length; i++) {
                if (characters[i] == ' ') {
                    continue;
                }
                if (characters[i] == '=') {
                    break;
                }
                else {
                    //Number
                    if (characters[i] >= '0' && characters[i] <= '9') {
                        var numword = '';
                        while (i < characters.length && characters[i] >= '0' && characters[i] <= '9')
                            numword += characters[i++];
                        numbers.push(parseInt(numword));
                    }
                    //Parenthesis
                    else if (characters[i] == '(') {
                        operators.push(characters[i]);
                    }
                    else if (characters[i] == ')') {
                        while (operators.peek() != '(')
                            numbers.push(applyOperation(operators.pop(), numbers.pop(), numbers.pop()));
                        operators.pop();
                    }
                    //Operations
                    if (characters[i] == '+' || characters[i] == '-' || characters[i] == '*' || characters[i] == '/') {
                        while (operators.peek() != null && higherOrder(characters[i], operators.peek()))
                            numbers.push(applyOperation(operators.pop(), numbers.pop(), numbers.pop()));
                        operators.push(characters[i]);
                    }
                }
            }

            if (arithmeticError == false) {
                while (operators.peek() != null) {
                    numbers.push(applyOperation(operators.pop(), numbers.pop(), numbers.pop()));
                }
            }
            result = numbers.pop();
        }
        else {
            document.getElementById('message').innerHTML = "Error: Invalid expression";
        }

        //
        txt += result + "=====\n";
        document.getElementById("operations").innerHTML = txt;

        document.getElementById('message').innerHTML = " ";
        //

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
        var node = {
            data : data,
            next : null
        }

        node.next = this.top;
        this.top = node;

        this.count++;
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