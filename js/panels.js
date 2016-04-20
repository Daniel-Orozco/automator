var txt = '';
var command = '';
var input = '';
var sectionbreak = '\n ------------------------------------------ \n';
var result = 0;
var prevState = '';
var hasPoint = false;
var hasExp = false;
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
                    i++;
                    var endword = '';
                    while (!hasError() && i < characters.length) {
                        alert("i = " + i + "\ncharlength = " + characters.length + "\ncurrChar = " + characters[i])
                        if(!isVariable(characters[i]) && characters[i] != ' ') {
                            errorOutput('Invalid Expression');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        else if(isVariable(characters[i])) {
                            i++;
                            while(i < characters.length) {
                                if(characters[i] != ' ') {
                                    errorOutput('Invalid Expression');
                                    if(event.preventDefault) event.preventDefault();
                                    return true;
                                }
                                i++;
                            }
                            i--;
                            saveOperation = characters[i];
                        }
                        endword += characters[i];
                        i++;
                    }
                    i--;

                    //
                    break;
                }
                else if(!hasError()){
                    //Variable
                    if(isVariable(characters[i])) {
                        if(prevState == 'Number') {
                            errorOutput('Invalid Expression');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        var savedNum = loadNum(characters[i]);
                        if(!isExponential(savedNum) && countDigits(savedNum)>8) {
                            numbers.push(savedNum.toPrecision(8));
                        }
                        else {
                            numbers.push(savedNum);
                        }
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
                        hasPoint = false;
                        hasExp = false;
                        prevState = 'Number';
                    }
                    //Number
                    else if (isNumber(characters[i])) {
                        if(prevState == 'Number') {
                            errorOutput('Invalid Expression');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        var numword = '';
                        while (!hasError() && i < characters.length && isNumber(characters[i]) || (hasExp && (characters[i] == '-' || characters[i] == '–'))) {
                            numword += characters[i];
                            i++;
                        }
                        i--;
                        var input_limit = 8;
                        if(hasPoint) input_limit += 1;
                        if(hasExp) input_limit += 4;
                        if(numword.length > input_limit) {
                            errorOutput('Overflow');
                            if(event.preventDefault) event.preventDefault();
                            return true;
                        }
                        if(!isExponential(numword) && countDigits(parseFloat(numword))>8) {
                            numbers.push(parseFloat(numword).toExponential(8))
                        }
                        else {
                            numbers.push(parseFloat(numword));
                        }
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
                        hasPoint = false;
                        hasExp = false;
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
function isExponential(num) {
    if((num+'').indexOf('e') === -1)
        return false;
    return true;
}
function isValid() {
    var isValid = false;
    var re = /[0-9A-Ca-ceE+-/*^()= ]/g;
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
    var limit = 99;
    if(!inRange(a, limit) || !inRange(b, limit))
    {
        errorOutput('Overflow');
        return null;
    }
    var currOp = a + " " + operator + " " + b + " = ";
    var tempOp = 0;
    switch (operator)
    {
        case '+':
            tempOp = Math.a(a,b);
            if(!inRange(tempOp, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            if(!inRange(tempOp, 8))
            {
                tempOp = tempOp.toPrecision(8);
            }
            command += currOp + (tempOp) + "\n";
            return tempOp;
            break;
        case '–': //long dash
            operator = '-';
        case '-':
            tempOp = Math.s(a,b);
            if(!inRange(tempOp, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            if(command == input+"\n" && a == 0) {
                if(!inRange(tempOp, 8))
                {
                    tempOp = tempOp.toPrecision(8);
                }
                return tempOp;
            }
            if(!inRange(tempOp, 8))
            {
                tempOp = tempOp.toPrecision(8);
            }
            command += currOp + (tempOp) + "\n";
            return tempOp;
            break;
        case '*':
            tempOp = Math.m(a,b);
            if(!inRange(tempOp, limit))
            {
                errorOutput('Overflow');
                return null;
            }
            if(!inRange(tempOp, 8))
            {
                tempOp = tempOp.toPrecision(8);
            }
            command += currOp + (tempOp) + "\n";
            return tempOp;
            break;
        case '/':
            if (b == 0) {
                errorOutput('Arithmetic');
                return null;
            }
            else {
                tempOp = Math.d(a,b);
                if(!inRange(tempOp, limit))
                {
                    errorOutput('Overflow');
                    return null;
                }
                if(!inRange(tempOp, 8))
                {
                    tempOp = tempOp.toPrecision(8);
                }
                command += currOp + (tempOp) + "\n";
                return tempOp;
            }
            break;
        case '^':
            tempOp = Math.pow(a,b)
            if(!inRange(tempOp,limit) && !inRange(b,2))
            {
                errorOutput('Overflow');
                return null;
            };
            if(!inRange(tempOp, 8))
            {
                tempOp = tempOp.toPrecision(8);
            }
            command += currOp + (tempOp) + "\n";
            return tempOp;
            break;
    }
    return 0;
}
function countDigits(num) {
    return str = ((((num + '').replace('.','')).replace('-','')).replace('e','')).replace('+','').length;
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
    if(chara >= 'A' && chara <= 'C')
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
    if((num == 'e' || num == 'E') && !hasExp) {
        hasExp = true;
        return true;
    }
    return false;
}

function higherOrder(op1, op2) {
    var rank = [-1, -1];
    var ops = [op1, op2];
    for(var i = 0; i < ops.length; i++){
        switch (ops[i]) {
            case '(':
                rank[i] = 1;
                break;
            case ')':
                rank[i] = 1;
                break;
            case '^':
                rank[i] = 2;
                break;
            case '*':
                rank[i] = 3;
                break;
            case '/':
                rank[i] = 3;
                break;
            case '+':
                rank[i] = 4;
                break;
            case '-':
                rank[i] = 4;
                break;
            default:
                rank[i] = null;
                break;
        }
    }
    if (rank[1] == 1)
        return false;
    if (rank[0] < rank[1])
        return false;
    return true;
}

function loadNum(variable) {
    switch(variable) {
        case 'A':
            return varA;
            break;
        case 'B':
            return varB;
            break;
        case 'C':
            return varC;
            break;
        default:
            return null;
            break;
    }
}
var _cf = (function() {
    function _shift(x) {
        var parts = x.toString().split('.');
        return (parts.length < 2) ? 1 : Math.pow(10, parts[1].length);
    }
    return function() {
        console.log(arguments);
        return Array.prototype.reduce.call(arguments, function (prev, next) { return prev === undefined || next === undefined ? undefined : Math.max(prev, _shift (next)); }, -Infinity);
    };
})();

Math.a = function () {
    var f = _cf.apply(null, arguments); if(f === undefined) return undefined;
    function cb(x, y, i, o) {
        return x + ~~(f*y); //f * y; //
    }
    return Array.prototype.reduce.call(arguments, cb, 0) / f;
};

Math.s = function (l,r) { var f = _cf(l,r); return (~~(l * f) - ~~(r * f)) / f; };

Math.m = function () {
    var f = _cf.apply(null, arguments);
    function cb(x, y, i, o) {
        return ~~(x*f) * ~~(y*f) / (f * f);
    }
    return Array.prototype.reduce.call(arguments, cb, 1);
};

Math.d = function (l,r) {
    var f = _cf(l,r);
    return ~~(l * f) / ~~(r * f);
};

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
Number.prototype.todigits= function(){
    var tem='', z, d, s= this.toString(),
        x= s.match(/^(\d+)\.(\d+)[eE]([-+]?)(\d+)$/);
    if(x){
        d= x[2];
        z= (x[3]== '-')? x[4]-1: x[4]-d.length;
        while(z--)tem+='0';
        if(x[3]== '-'){
            return '0.'+tem+x[1]+d;
        }
        return x[1]+d+tem;
    }
    return s;
}