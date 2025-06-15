"use client";
import { useState } from "react";
import Image from "next/image";
import styles from './page.module.css';

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
    <div className={styles.container}>
      <h2 className={styles.title}>หัวข้อความรู้สำหรับคุณแม่</h2>
      <div className={styles.grid}>
        {topics.map((topic, idx) => (
          <button key={topic.title} onClick={() => setOpen(idx)} className={styles.card}>
            <div className={styles.cardContent}>
              <Image 
                src={topic.icon} 
                alt={topic.title} 
                width={48} 
                height={48} 
                className={styles.icon}
              />
              <span className={styles.cardTitle}>{topic.title}</span>
            </div>
          </button>
        ))}
      </div>
      {open !== null && (
        <div className={styles.modalOverlay} onClick={() => setOpen(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{topics[open].title}</h3>
            <pre className={styles.modalContent}>{topics[open].details}</pre>
            <button onClick={() => setOpen(null)} className={styles.button}>
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 