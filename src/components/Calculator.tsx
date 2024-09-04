import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);

  const handleNumberClick = (num: string) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperatorClick = (op: string) => {
    setOperator(op);
    setPrevValue(parseFloat(display));
    setDisplay('0');
  };

  const handleEqualsClick = () => {
    if (prevValue !== null && operator !== null) {
      const currentValue = parseFloat(display);
      let result: number;
      switch (operator) {
        case '+':
          result = prevValue + currentValue;
          break;
        case '-':
          result = prevValue - currentValue;
          break;
        case '*':
          result = prevValue * currentValue;
          break;
        case '/':
          result = prevValue / currentValue;
          break;
        default:
          return;
      }
      setDisplay(result.toString());
      setPrevValue(null);
      setOperator(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
  };

  return (
    <div className="w-64 mx-auto mt-8 bg-gray-200 p-4 rounded-lg">
      <div className="bg-white p-2 mb-4 text-right text-2xl rounded">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '/'].map((btn) => (
          <button
            key={btn}
            className="bg-blue-500 text-white p-2 rounded"
            onClick={() => (btn === '/' ? handleOperatorClick(btn) : handleNumberClick(btn))}
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '*'].map((btn) => (
          <button
            key={btn}
            className="bg-blue-500 text-white p-2 rounded"
            onClick={() => (btn === '*' ? handleOperatorClick(btn) : handleNumberClick(btn))}
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map((btn) => (
          <button
            key={btn}
            className="bg-blue-500 text-white p-2 rounded"
            onClick={() => (btn === '-' ? handleOperatorClick(btn) : handleNumberClick(btn))}
          >
            {btn}
          </button>
        ))}
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => handleNumberClick('0')}
        >
          0
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => handleNumberClick('.')}
        >
          .
        </button>
        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={handleEqualsClick}
        >
          =
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => handleOperatorClick('+')}
        >
          +
        </button>
        <button
          className="bg-red-500 text-white p-2 rounded col-span-4"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Calculator;