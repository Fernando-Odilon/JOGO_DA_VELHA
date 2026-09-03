import Square from "../Square/Square";
import { useState } from 'react';


const getResponse = async (squares, setPensando, setResposta) => {
  setPensando(true);
  setResposta('Pensando...');

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

  const prompt = `
  Você é um jogador experiente de jogo da velha e está jogando com a pecinha 'O'.
  O estado atual do tabuleiro (posições de 0 a 8) é: [${squares}].
  Onde estiver 'null', a posição está livre.
  As possibilidades de vitória são: ${lines}
  
  Escolha a melhor posição para jogar e retorne APENAS o número da posição (de 0 a 8).
  Não escreva nenhuma palavra, explicação ou texto adicional. Responda apenas com o número.
  `;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
      }),
    });

    const dados = await response.json();
    const respostaIA = parseInt(dados.response.trim(), 10);

    if (!isNaN(respostaIA) && respostaIA >= 0 && respostaIA <= 8) {
      setResposta(`IA jogou na posição ${respostaIA}`);
      return respostaIA;
    }

    setResposta('Resposta inválida da IA');
    return null;

  } catch (error) {
    console.error('Erro na requisição:', error);
    setResposta('Erro ao conectar');
    return null;

  } finally {
    setPensando(false);
  }
};

function Board({ xIsNext, squares, onPlay, calculateWinner }) {
  const [pensando, setPensando] = useState(false);
  const [resposta, setResposta] = useState('Aguardando jogada...');
  const [vezHumano, setVezHumano] = useState(true);

  async function handleClick(i) {
    if (!vezHumano || pensando) return;
    
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = 'X';
    onPlay(nextSquares);
    setVezHumano(false);

    if (calculateWinner(nextSquares) || nextSquares.every((square) => square !== null)) {
      return;
    }
    const movimentoBot = await getResponse(nextSquares, setPensando, setResposta);
    if (movimentoBot !== null && !nextSquares[movimentoBot]) {
      const jogadaFinalIA = nextSquares.slice();
      jogadaFinalIA[movimentoBot] = 'O';
      onPlay(jogadaFinalIA);
    }
    else {
      handleClick(i)
    }
    
    setVezHumano(true);
  }

  const winner = calculateWinner(squares);
  const isDraw = squares.every((square) => square !== null);
  
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (isDraw) {
    status = 'Empate';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <p>Status da IA: {resposta}</p>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default Board;