import { useState } from 'react';
import styles from './NavigationMenu.module.css';
import { NavigationItem } from './NavigationItem';

export function NavigationMenu() {
    const [isOpen, setOpen] = useState(false);
    return <>
        <div className={styles.hamburger} onClick={() => setOpen(true)}>
            <div className={styles.flower}>
                Flower
            </div>
        </div>

        <div 
            className={styles.menu} 
            style={{ display: isOpen ? 'block' : 'none' }}
            onClick={() => setOpen(false)}
            >
                <NavigationItem />
                <NavigationItem />
                <NavigationItem />
                <NavigationItem />
        </div>
    </>;
}