

import styles from './Board.module.css'
import Square from '../Square/Square'


function Board() {

    return (
        // Imprimir o Tabuleiro
        // Função que verifica o click em cada botão
        <>
            {Array.from({length : 9}).map((_, index) => (
                    <Square/>
                    {(index % 3 == 0 && <br/>)})
            <Square value={'X'} clickFunction={() =>  console.log("TEXTO")}/> 
        </>
        
    )
    
}

export default Board

