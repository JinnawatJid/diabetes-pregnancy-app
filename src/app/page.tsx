import Image from "next/image";
import Link from "next/link";
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
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
        <h1 className={styles.title}>น้องใจใส</h1>
        <p className={styles.description}>
          ดูแลเบาหวานขณะตั้งครรภ์<br/>
          <span className={styles.highlight}>
            เครื่องมือช่วยเหลือคุณแม่
            ในการทำความเข้าใจและจัดการภาวะเบาหวานขณะตั้งครรภ์
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
