import { GoogleGenAI } from '@google/genai';
import { useState, useEffect, use } from 'react';

const IA = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6L1iA491n-sdP1D2RrETUsLCdp43-vpvTQByu8wYUBwkA' });




function Bot(squares, lines) {
    const [resposta, setResposta] = useState('Pensando...')

    
    async function getResponse(squares, lines) {
        const prompt = `
  Você é um jogador experiente de jogo da velha e está jogando com a pecinha 'O'.
  O estado atual do tabuleiro (posições de 0 a 8) é: [${squares}].
  Onde estiver 'null', a posição está livre. Você teve fazer uma linha sequêncial de 3 peças iguais sua, horizontal, vertical, e diagonal. 
  Ao mesmo tempo você deve impedir que o adversário vença,  bloqueando as possíveis combinações que ele pode fazer.
  As possibilidades de vitória são respresentados pelo array: ${lines}
  
  Escolha a melhor posição para jogar e retorne APENAS o número da posição (de 0 a 8).
  Não escreva nenhuma palavra, explicação ou texto adicional. Responda apenas com o número.
  `;
    try {
        const response = await IA.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });
        // Extrai apenas o texto retornado e salva no estado
        setResposta(response.text.trim());
      } catch (error) {
        console.error('Erro na requisição:', error);
        setResposta('Erro');
      }
    }
  
    useEffect(() => {
      getResponse(squares, lines);
    }, []);
   
return (<>
    <p>{resposta}</p>
</>)
} 


    

export default Bot