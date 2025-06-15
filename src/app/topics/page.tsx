"use client";
import { useState } from "react";
import Image from "next/image";

const topics = [
  {
    title: "อาหาร",
    icon: "/Food.png",
    details: `การเลือกอาหารมีผลต่อระดับน้ำตาลในเลือดโดยตรง\nควรเลือก:\n• คาร์โบไฮเดรตเชิงซ้อน (ข้าวกล้อง, ขนมปังโฮลวีต)\n• ผักหลากสี (ควรได้ครึ่งหนึ่งของจาน)\n• โปรตีนไม่ติดมัน (ปลา, เต้าหู้, ไข่ขาว)\n• ผลไม้ที่มีน้ำตาลต่ำ (เช่น แอปเปิ้ล, ฝรั่ง)\nควรหลีกเลี่ยง:\n• ของหวาน, น้ำตาล, น้ำอัดลม\n• ของทอด, อาหารมันจัด\n• คาร์โบไฮเดรง่าย (ข้าวขาว, ขนมปังขาว)`
  },
  {
    title: "ออกกำลังกาย",
    icon: "/Workout.png",
    details: `การออกกำลังกายช่วยควบคุมระดับน้ำตาลในเลือด\nควรเลือกกิจกรรมที่เหมาะสม เช่น เดิน, ว่ายน้ำ, โยคะ\nหลีกเลี่ยงกิจกรรมที่เสี่ยงต่อการหกล้มหรือบาดเจ็บ`
  },
  {
    title: "ค่าระดับน้ำตาลต่างๆ และวิธีการจัดการ",
    icon: "/Sugar_level.png",
    details: `ควรตรวจระดับน้ำตาลในเลือดอย่างสม่ำเสมอ\nเป้าหมายระดับน้ำตาลควรอยู่ในช่วงที่แพทย์แนะนำ\nหากสูงหรือต่ำเกินไปควรปรึกษาแพทย์`
  },
  {
    title: "การใช้อินซูนลิน ใช้ยังไง ผลข้างเคียง",
    icon: "/Insuline.png",
    details: `ใช้อินซูลินตามคำแนะนำของแพทย์\nควรฉีดในเวลาที่กำหนด\nผลข้างเคียงที่อาจพบ: น้ำตาลต่ำ, อาการแพ้บริเวณฉีด`
  },
  {
    title: "ภาวะแทรกซ้อน",
    icon: "/Complications.png",
    details: `ภาวะแทรกซ้อนที่อาจเกิดขึ้น เช่น ความดันสูง, โปรตีนในปัสสาวะ\nควรพบแพทย์ตามนัดและดูแลสุขภาพอย่างใกล้ชิด`
  },
  {
    title: "bmi. แปลผล",
    icon: "/BMI.png",
    details: `BMI = น้ำหนัก(กก.) / ส่วนสูง(ม.)^2\nBMI ก่อนตั้งครรภ์ช่วยประเมินความเสี่ยง\nควรปรึกษาแพทย์เพื่อแปลผลที่เหมาะสม`
  },
  {
    title: "น้ำหนักควรเพิ่มตามbmiเท่าไหร่",
    icon: "/Weight_Scale.png",
    details: `น้ำหนักที่ควรเพิ่มขึ้นขึ้นกับ BMI ก่อนตั้งครรภ์\nควรปรึกษาแพทย์เพื่อเป้าหมายที่เหมาะสมกับแต่ละบุคคล`
  },
  {
    title: "อาการhypo/hyper",
    icon: "/Hypo_Hyper.png",
    details: `Hypo: เหงื่อออก มือสั่น ใจสั่น หิวมาก\nHyper: กระหายน้ำ ปัสสาวะบ่อย อ่อนเพลีย\nหากมีอาการควรตรวจน้ำตาลและปฏิบัติตามคำแนะนำแพทย์`
  },
];

export default function Topics() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #FDE7F0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <h2 style={{ color: '#1E88E5', fontWeight: 700, fontSize: 24, marginBottom: 32, letterSpacing: 1 }}>หัวข้อความรู้สำหรับคุณแม่</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 700, width: '100%' }}>
        {topics.map((topic, idx) => (
          <button key={topic.title} onClick={() => setOpen(idx)} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Image src={topic.icon} alt={topic.title} width={48} height={48} style={{ marginRight: 18, borderRadius: 12, background: '#F8FAFF' }} />
              <span style={{ fontWeight: 600, fontSize: 18, color: '#1E88E5', textAlign: 'left' }}>{topic.title}</span>
            </div>
          </button>
        ))}
      </div>
      {open !== null && (
        <div style={modalOverlayStyle} onClick={() => setOpen(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#1E88E5', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{topics[open].title}</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 16, color: '#333', margin: 0 }}>{topics[open].details}</pre>
            <button onClick={() => setOpen(null)} style={{ ...buttonStyle, marginTop: 24 }}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 2px 12px rgba(30,136,229,0.07)',
  padding: '1.2rem 1.2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: 90,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  transition: 'box-shadow 0.2s, transform 0.2s',
  fontFamily: 'inherit',
  fontSize: 18,
  fontWeight: 500,
  letterSpacing: 0.2,
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(30,136,229,0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(30,136,229,0.13)',
  padding: '2rem 1.5rem',
  maxWidth: 400,
  width: '90vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1DE9B6 0%, #1E88E5 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '0.9rem 1.2rem',
  fontWeight: 600,
  fontSize: 16,
  textAlign: 'center',
  textDecoration: 'none',
  width: '100%',
  boxShadow: '0 2px 8px rgba(30,136,229,0.08)',
  letterSpacing: 0.5,
  transition: 'background 0.2s',
  cursor: 'pointer',
}; 