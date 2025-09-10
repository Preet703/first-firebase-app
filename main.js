class ScientificCalculator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 450px; /* Increased width */
                    border-radius: 20px; /* Softer corners */
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .calculator {
                    font-family: 'Poppins', sans-serif;
                    color: white;
                }
                .expression-display {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 10px 20px;
                    text-align: right;
                    font-size: 1em;
                    min-height: 20px;
                    overflow-x: auto;
                    font-weight: 300;
                    color: #ccc;
                }
                .display {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 30px 20px;
                    text-align: right;
                    font-size: 2.5em;
                    min-height: 60px;
                    overflow-x: auto;
                    font-weight: 300;
                }
                .buttons {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 2px; /* Thinner gaps */
                }
                button {
                    background-color: rgba(255, 255, 255, 0.05);
                    border: none;
                    color: white;
                    padding: 20px;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 400;
                }
                button:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }
                button:active {
                    background-color: rgba(255, 255, 255, 0.3);
                }
                button.operator {
                    background-color: #ff9f43;
                }
                button.double {
                    grid-column: span 2;
                }
            </style>
            <div class="calculator">
                <div class="expression-display"></div>
                <div class="display">0</div>
                <div class="buttons">
                    <button>rad</button>
                    <button>deg</button>
                    <button>x!</button>
                    <button>(</button>
                    <button>)</button>
                    <button>%</button>
                    <button>AC</button>
                    <button>sin</button>
                    <button>ln</button>
                    <button>7</button>
                    <button>8</button>
                    <button>9</button>
                    <button class="operator">/</button>
                    <button>cos</button>
                    <button>log</button>
                    <button>4</button>
                    <button>5</button>
                    <button>6</button>
                    <button class="operator">*</button>
                    <button>tan</button>
                    <button>√</button>
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                    <button class="operator">-</button>
                    <button>EXP</button>
                    <button>x^y</button>
                    <button>0</button>
                    <button>.</button>
                    <button class="operator">=</button>
                    <button class="operator">+</button>
                </div>
            </div>
        `;

        this.display = this.shadowRoot.querySelector('.display');
        this.expressionDisplay = this.shadowRoot.querySelector('.expression-display');
        this.buttons = this.shadowRoot.querySelector('.buttons');
        this.currentInput = '';
        this.expression = '';
        this.isRadians = true;

        this.buttons.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleButtonClick(event) {
        const button = event.target;
        const value = button.textContent;

        if (!isNaN(value) || value === '.') {
            this.handleNumber(value);
        } else if (['+', '-', '*', '/'].includes(value)) {
            this.handleOperator(value);
        } else {
            this.handleFunction(value);
        }
    }

    handleNumber(value) {
        if (this.currentInput.includes('.') && value === '.') return;
        this.currentInput += value;
        this.expression += value;
        this.updateDisplay();
        this.updateExpressionDisplay();
    }

    handleOperator(value) {
        if (this.currentInput === '' && this.expression[this.expression.length-2] !== ')') return;
        this.currentInput = '';
        this.expression += ` ${value} `;
        this.updateExpressionDisplay();
    }

    handleFunction(value) {
        switch (value) {
            case 'AC':
                this.clear();
                break;
            case '=':
                this.calculate();
                break;
            case 'sin':
                this.expression = `sin(${this.expression}`;
                this.updateExpressionDisplay();
                break;
            case 'cos':
                 this.expression = `cos(${this.expression}`;
                this.updateExpressionDisplay();
                break;
            case 'tan':
                 this.expression = `tan(${this.expression}`;
                this.updateExpressionDisplay();
                break;
            case 'log':
                 this.expression = `log(${this.expression}`;
                this.updateExpressionDisplay();
                break;
            case 'ln':
                 this.expression = `ln(${this.expression}`;
                this.updateExpressionDisplay();
                break;
            case '√':
                 this.expression = `sqrt(${this.expression}`;
                this.updateExpressionDisplay();
                break;
            case 'x!':
                this.expression = `fact(${this.expression})`
                this.updateExpressionDisplay();
                break;
            case 'x^y':
                this.expression += `^`;
                this.currentInput = '';
                this.updateExpressionDisplay();
                break;
            case '%':
                this.expression += `%`;
                this.updateExpressionDisplay();
                break;
            case 'rad':
                this.isRadians = true;
                break;
            case 'deg':
                this.isRadians = false;
                break;
            case '(':
                this.expression += '(';
                this.updateExpressionDisplay();
                break;
            case ')':
                this.expression += ')';
                this.updateExpressionDisplay();
                break;
            case 'EXP':
                this.expression += 'e';
                this.updateExpressionDisplay();
                break;

        }
    }

    calculate() {
        try {
            let evalExpression = this.expression
                .replace(/\^/g, '**')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/log/g, 'Math.log10')
                .replace(/ln/g, 'Math.log')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/fact\(([^)]+)\)/g, '(t => { for (var i = 1, r = 1; i <= t; i++) r *= i; return r; })($1)')
                .replace(/%/g, '/100');

            // Handle radians/degrees for trig functions
            if (!this.isRadians) {
                evalExpression = evalExpression.replace(/(Math.sin|Math.cos|Math.tan)\(([^)]+)\)/g, '$1($2 * Math.PI / 180)');
            }

            const result = eval(evalExpression);
            this.display.textContent = result;
            this.expression = result.toString();
            this.currentInput = result.toString();

        } catch (error) {
            this.display.textContent = 'Error';
            this.expression = '';
            this.currentInput = '';
        }
    }

    clear() {
        this.currentInput = '';
        this.expression = '';
        this.updateDisplay('0');
        this.updateExpressionDisplay();
    }

    updateDisplay(value) {
        this.display.textContent = value || this.currentInput || '0';
    }

    updateExpressionDisplay() {
        this.expressionDisplay.textContent = this.expression;
    }
}

customElements.define('scientific-calculator', ScientificCalculator);
