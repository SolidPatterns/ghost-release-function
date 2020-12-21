import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//this is same as a component class, but shorthand way, called a "function component".
function Square(props) {
  return (
    <button className={props.highlight ? "square-highlight" : "square"} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let highlight = false;
    if (this.props.winningState) {
      highlight = this.props.winningState.winningSquares.includes(i);
    }

    return (
      <Square
        highlight={highlight}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {

    const boardRows = [];

    for (const [index, value] of this.props.squares.entries()) {
      if (index % 3 !== 0) {
        continue;
      }

      const squares = [];
      for (let i = index; i < index + 3; i++) {
        squares.push(this.renderSquare(i));
      }
      boardRows.push(<div className="board-row">{squares}</div>)
    }

    return (
      <div>
        {boardRows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        stepMove: null,
      }],
      stepNumber: 0,
      xIsNext: true,
    };

    this.moveSortingAsc = true;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        stepMove: { player: squares[i], position: i },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      history: this.state.history
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningState = calculateWinner(current.squares);
    const winner = winningState ? winningState.winner : null;

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' : Player '
        + step.stepMove.player + ' played row - '
        + parseInt(step.stepMove.position / 3 + 1) + ' col - '
        + (step.stepMove.position % 3 + 1) :
        'Go to game start';
      return (
        <div>
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
              {this.state.stepNumber === move
                ? <b>{desc}</b>
                : desc
              }
            </button>
          </li>
        </div>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    }
    else if (this.state.stepNumber === 9) {
      status = 'I\'s a draw!';
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            winningState={winningState}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningSquares: lines[i] };
    }
  }
  return null;
}