import styles from './WeatherInformation.module.css';

export function WeatherInformation() {
    return <div className={styles.container}>
        <h3 className={styles.title}>15°C Rain</h3>
        <h4 className={styles.subtitle}>Raining later today</h4>
    </div>;
}