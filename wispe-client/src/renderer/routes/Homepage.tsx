import { ClockHeader } from '../components/ClockHeader';
import { NavigationMenu } from '../components/NavigationMenu';
import { WeatherInformation } from '../components/WeatherInformation';
import styles from './Homepage.module.css';

export function Homepage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <NavigationMenu />
        </div>
        <div>
          <WeatherInformation />
        </div>
      </div>

      <div className={styles.mainTextContainer}>
        <div className={styles.mainText}>
          <ClockHeader />
        </div>
      </div>
    </div>
  );
}