import { GoogleGenAI } from '@google/genai';
import { useState, useEffect } from 'react';

const IA = new GoogleGenAI({ apiKey: 'SUA_API_KEY_AQUI' });

function Bot({ squares, lines }) {
    const [pensando, setPensando] = useState(false);
    const [resposta, setResposta] = useState('Aguardando jogada...');

    async function getResponse(squares, lines) {
        // Trava 1: Se já estiver pensando, ignora novas chamadas simultâneas
        if (pensando) return;

        setPensando(true);
        setResposta('Pensando...');

        const prompt = `
  Você é um jogador experiente de jogo da velha e está jogando com a pecinha 'O'.
  O estado atual do tabuleiro (posições de 0 a 8) é: [${squares}].
  Onde estiver 'null', a posição está livre.
  As possibilidades de vitória são: ${JSON.stringify(lines)}
  
  Escolha a melhor posição para jogar e retorne APENAS o número da posição (de 0 a 8).
  Não escreva nenhuma palavra, explicação ou texto adicional. Responda apenas com o número.
  `;

        try {
            const response = await IA.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setResposta(response.text.trim());
        } catch (error) {
            console.error('Erro na requisição:', error);
            setResposta('Erro na requisição');
        } finally {
            // Trava 2: Libera a trava apenas quando a requisição terminar
            setPensando(false);
        }
    }

    useEffect(() => {
        // Dispara a busca apenas se o tabuleiro estiver disponível
        if (squares) {
            getResponse(squares, lines);
        }
    }, [squares]); // Dispara novamente apenas se a prop 'squares' mudar

    return (
        <>
            <p>Status da IA: {resposta}</p>
        </>
    );
}

export default Bot;