import Square from "../Square/Square";
import { GoogleGenAI } from '@google/genai';
import { useState, useEffect } from 'react';

// Inicializa a IA fora do componente para evitar recriação a cada render
const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6JSZDStW8YMJy-5Mex_OX7XtlAwQoSyvpm5Ugm2QBGJfQ' });

// Função normal assíncrona (fora do componente)
const getResponse = async (squares, setPensando, setResposta) => {
  setPensando(true);

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
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    const respostaIA = response.text.trim();
    setResposta(respostaIA);
    console.log(respostaIA)

  } catch (error) {
    console.error('Erro na requisição:', error);
    setResposta('Erro na requisição');
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

    // Jogada do Humano ('X')
    const nextSquares = squares.slice();
    nextSquares[i] = 'X';
    onPlay(nextSquares);
    setVezHumano(false);

    // Verifica se o jogo acabou antes da IA jogar
    if (calculateWinner(nextSquares) || nextSquares.every((square) => square !== null)) {
      return;
    }

    // Turno da IA ('O')
    const movimentoBot = await getResponse(nextSquares, setPensando, setResposta);
    
    if (movimentoBot !== null && !nextSquares[movimentoBot]) {
      console.log(movimentoBot)
      const jogadaFinalIA = nextSquares.slice();
      jogadaFinalIA[movimentoBot] = 'O';
      console.log(jogadaFinalIA)
      onPlay(jogadaFinalIA);
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