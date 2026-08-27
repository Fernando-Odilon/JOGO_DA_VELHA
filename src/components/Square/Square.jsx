import styles from './Square.module.css'

function Square({value, clickFunction}) {
    return(
        
        <button className={styles.square} onClick={clickFunction}>{value}</button>
    )
}

export default Square