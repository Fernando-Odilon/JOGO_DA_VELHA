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
 Você é uma IA jogando jogo da velha como 'O'. O tabuleiro é um array de 9 posições (0 a 8). Posições null estão vazias. 'X' é o oponente. 'O' é você.
Tabuleiro atual: ${JSON.stringify(squares)}
Retorne APENAS o número do índice (0 a 8) onde você quer jogar. Não retorne texto, não retorne JSON, apenas o número.`;

  try {
    // Endpoint compatível com OpenAI fornecido pela DashScope para o Qwen
    const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-ws-H.DDILPLE.vGbN.MEYCIQDbc7avHatfa8zXsd5EUoeLdhEHWItARoSzid6Opkc_8AIhALrIwfzK3a8VXe2bte340isRrDaeQKdJUIdhaOqnCxmL`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
      }),
    });

    const dados = await response.json();
    
    // Extrai a resposta do formato compatível
    const textoResposta = dados.choices?.[0]?.message?.content || '';
    const respostaIA = parseInt(textoResposta.trim(), 10);

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
      setVezHumano(true);
      return;
    }
    
    const movimentoBot = await getResponse(nextSquares, setPensando, setResposta);
    console.log(movimentoBot)
    if (movimentoBot !== null && !nextSquares[movimentoBot]) {
      const jogadaFinalIA = nextSquares.slice();
      jogadaFinalIA[movimentoBot] = 'O';
      onPlay(jogadaFinalIA);
    } else {
      setResposta('Erro na jogada da IA, tente novamente');
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