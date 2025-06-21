import Image from "next/image";
import Link from "next/link";
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
      <h1 className={styles.titleHead}>
          สวัสดีค่ะ คุณแม่
        </h1>
        <div className={styles.avatarContainer}>
          <Image 
            src="/avatar.png" 
            alt="NONG JAMSAI" 
            width={140} 
            height={140} 
            className={styles.avatar}
            priority
          />
        </div>
        <h1 className={styles.title}>น้องเบาใจ</h1>
        <p className={styles.description}>
          <span className={styles.highlight}>
            เป็นเครื่องมือช่วยเหลือคุณแม่
            ในการทำความเข้าใจและจัดการภาวะเบาหวานขณะตั้งครรภ์นะคะ
          </span>
        </p>
        <p className={styles.subDescription}>
          เพื่อให้คุณแม่และลูกน้อย <br/> มีสุขภาพที่ดีตลอดช่วงเวลาสำคัญ
        </p>
        <Link href="/patient-info" className={styles.button}>
          เริ่มต้น
        </Link>
      </div>
    </div>
  );
}
