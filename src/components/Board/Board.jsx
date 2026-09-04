import Square from "../Square/Square";
import { useState } from 'react';




const getResponse = async (currentSquares, setPensando, setResposta) => {
  setPensando(true);
  setResposta('Pensando...');

  // Mapeia o tabuleiro visualmente para o Gemini entender a geometria
  const tabuleiroVisual = `
  0 | 1 | 2  -> ${currentSquares[0] || '[ ]'} | ${currentSquares[1] || '[ ]'} | ${currentSquares[2] || '[ ]'}
  ---------
  3 | 4 | 5  -> ${currentSquares[3] || '[ ]'} | ${currentSquares[4] || '[ ]'} | ${currentSquares[5] || '[ ]'}
  ---------
  6 | 7 | 8  -> ${currentSquares[6] || '[ ]'} | ${currentSquares[7] || '[ ]'} | ${currentSquares[8] || '[ ]'}
  `;

  const posicoesVazias = currentSquares
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);

  const prompt = `Você é uma IA especialista jogando Jogo da Velha como 'O'. O oponente é 'X'.
Analise o tabuleiro abaixo onde '[ ]' representa posições vazias, 'X' o oponente e 'O' você:

${tabuleiroVisual}

As únicas posições numéricas disponíveis para jogar são: ${JSON.stringify(posicoesVazias)}.

Instruções obrigatórias:
1. Analise se o oponente 'X' está prestes a vencer (tem 2 em linha) para bloqueá-lo.
2. Analise se você 'O' pode vencer na próxima jogada.
3. Escolha obrigatoriamente um índice numérico da lista de posições disponíveis.

Responda EXATAMENTE com um objeto JSON puro contendo apenas a chave "jogada" com o número do índice escolhido, por exemplo: {"jogada": 4}`;

  try {
    // Chave de API gerada gratuitamente no Google AI Studio
    const apiKey = 'AQ.Ab8RN6JzA8v78WMDPH_9jQYXOmYRHxuw6aviJGWeidTJx7LVgQ';
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Mantém a criatividade baixa para focar na lógica do jogo
          responseMimeType: "application/json" // Força o Gemini a responder estritamente em JSON válido
        }
      }),
    });

    const dados = await response.json();
    
    // Extrai o texto da resposta do Gemini
    const textoResposta = dados.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let respostaIA = null;
    try {
      const objResposta = JSON.parse(textoResposta);
      respostaIA = parseInt(objResposta.jogada, 10);
    } catch (e) {
      // Fallback extra caso venha fora do formato esperado
      const match = textoResposta.match(/\d/);
      if (match) respostaIA = parseInt(match[0], 10);
    }

    if (!isNaN(respostaIA) && posicoesVazias.includes(respostaIA)) {
      setResposta(`IA jogou na posição ${respostaIA}`);
      return respostaIA;
    }

    // Fallback de segurança se a resposta falhar
    const fallback = posicoesVazias[0];
    setResposta(`IA jogou na posição ${fallback}`);
    return fallback;

  } catch (error) {
    console.error('Erro na requisição ao Gemini:', error);
    setResposta('Erro ao conectar');
    return null;
  } finally {
    setPensando(false);
  }
};

function Board({ xIsNext, squares, onPlay, calculateWinner }) {
  const [isPlayrxPlayer, setIsPlayerxPlayer] = useState(null)
  const [pensando, setPensando] = useState(false);
  const [resposta, setResposta] = useState('Aguardando jogada...');
  const [vezHumano, setVezHumano] = useState(true);

  async function handleClick(i) {
   if (!isPlayrxPlayer) {
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
    
    setVezHumano(true);}
  

    else {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }
  
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
    <>  <button onClick={() => setIsPlayerxPlayer(false)} >JOGAR CONTRA IA</button>
        <button onClick={() => setIsPlayerxPlayer(true)}>JOGAR CONTRA PLAYER</button>
      {isPlayrxPlayer !== null && (
        <div className='teste'>
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
  </div>
      )
      }  
      
    </>
  );
}

export default Board;