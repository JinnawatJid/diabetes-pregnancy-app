"use client";
import { useState } from "react";
import Image from "next/image";
import styles from './page.module.css';

const topics = [
  {
    title: "อาหาร",
    icon: "/Food.png",
    details: `การเลือกอาหารมีผลต่อระดับน้ำตาลในเลือดโดยตรง\n \n ควรเลือก:\n• คาร์โบไฮเดรตเชิงซ้อน (ข้าวกล้อง, ขนมปังโฮลวีต)\n• ผักหลากสี (ควรได้ครึ่งหนึ่งของจาน)\n• โปรตีนไม่ติดมัน (ปลา, เต้าหู้, ไข่ขาว)\n• ผลไม้ที่มีน้ำตาลต่ำ (เช่น แอปเปิ้ล, ฝรั่ง)\n \n ควรหลีกเลี่ยง:\n• ของหวาน, น้ำตาล, น้ำอัดลม\n• ของทอด, อาหารมันจัด\n• คาร์โบไฮเดรง่าย (ข้าวขาว, ขนมปังขาว)`
  },
  {
    title: "ออกกำลังกาย",
    icon: "/Workout.png",
    details: `ช่วยควบคุมระดับน้ำตาลและน้ำหนัก\n \n แนะนำ:\n• เดินเร็ว, ปั่นจักรยาน, ว่ายน้ำ อย่างน้อยวันละ 30 นาที \n • อย่างน้อย 5 วัน/สัปดาห์ \n • ตรวจน้ำตาลก่อนและหลังออกกำลังกายหากใช้ยา/อินซูลิน`
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
    title: "อาการ hypo/hyper",
    icon: "/Hypo_Hyper.png",
    details: `อาการของ Hypoglycemia และ Hyperglycemia\n \n Hypoglycemia (น้ำตาลต่ำ <70 mg/dL):\n • เวียนหัว, มือสั่น, เหงื่อออก\n • หิวมาก, ใจสั่น, พูดไม่ชัด\n • สับสน, หมดสติ (รุนแรง)\n \n วิธีแก้: ดื่มน้ำหวาน/น้ำตาล 15 กรัม ทันที เช่น น้ำส้ม 1/2 แก้ว \n \n Hyperglycemia (น้ำตาลสูง >180 mg/dL):\n • กระหายน้ำมาก, ปัสสาวะบ่อย\n • อ่อนเพลีย, ปวดหัว\n • มองภาพไม่ชัด, หิวง่าย\n \n วิธีแก้: ควบคุมอาหาร, เพิ่มกิจกรรม, ปรึกษาแพทย์`
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