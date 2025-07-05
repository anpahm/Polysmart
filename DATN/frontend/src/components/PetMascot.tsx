import Image from 'next/image';
import styles from './PetMascot.module.css';

interface PetMascotProps {
  message?: string;
}

export default function PetMascot({ message }: PetMascotProps) {
  return (
    <div className={styles['pet-chat-wrapper']}>
      <Image
        src="/images/ga-con.png"
        alt="Gà Con"
        width={72}
        height={72}
        className={styles['pet-avatar']}
      />
      <div className={styles['pet-bubble']}>
        {message}
      </div>
    </div>
  );
} 