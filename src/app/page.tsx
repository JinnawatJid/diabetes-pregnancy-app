import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #FDE7F0 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 28, boxShadow: '0 6px 32px rgba(0,0,0,0.07)', padding: '2.8rem 2.2rem', maxWidth: 390, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'box-shadow 0.2s' }}>
        <div style={{ background: 'linear-gradient(135deg, #E0F7FA 0%, #FDE7F0 100%)', borderRadius: '50%', padding: 12, marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Image src="/avatar.png" alt="NONG JAMSAI" width={140} height={140} style={{ borderRadius: '50%' }} />
        </div>
        <h1 style={{ color: '#1E88E5', fontWeight: 700, fontSize: 26, margin: '1rem 0 0.5rem', textAlign: 'center', letterSpacing: 1 }}>น้องใจใส</h1>
        <p style={{ textAlign: 'center', color: '#333', fontSize: 16, marginBottom: 8, lineHeight: 1.7 }}>
          ดูแลเบาหวานขณะตั้งครรภ์<br/>
          <span style={{ color: '#1E88E5', fontWeight: 500 }}>
          เครื่องมือช่วยเหลือคุณแม่
          ในการทำความเข้าใจและจัดการภาวะเบาหวานขณะตั้งครรภ์
          </span>
        </p>
        <p style={{ textAlign: 'center', color: '#7B8A9A', fontSize: 14, marginBottom: 28 }}>
        เพื่อให้คุณแม่และลูกน้อย <br/> มีสุขภาพที่ดีตลอดช่วงเวลาสำคัญ
        </p>
        <Link href="/patient-info" style={{ background: 'linear-gradient(90deg, #1DE9B6 0%, #1E88E5 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: '1rem 1.2rem', fontWeight: 600, fontSize: 16, textAlign: 'center', textDecoration: 'none', marginTop: 8, width: '100%', boxShadow: '0 2px 8px rgba(30,136,229,0.08)', letterSpacing: 0.5, transition: 'background 0.2s' }}>
        เริ่มต้น
        </Link>
      </div>
    </div>
  );
}
