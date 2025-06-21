"use client";
import { useState } from "react";
import Image from "next/image";
import { usePatient } from "../context/PatientContext";
import styles from './page.module.css';
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const bmiDetails: { [key: string]: { title: string; description: string; image: string; } } = {
  'น้ำหนักต่ำกว่าเกณฑ์': {
    title: "น้ำหนักต่ำกว่าเกณฑ์",
    description: "น้ำหนักที่เพิ่มได้ตลอดการตั้งครรภ์ 12.5 - 18 kg",
    image: "/Underweight.png",
  },
  'น้ำหนักตามเกณฑ์': {
    title: "น้ำหนักตามเกณฑ์",
    description: "น้ำหนักที่เพิ่มได้ตลอดการตั้งครรภ์ 11.5 - 16 kg",
    image: "/Normal.png",
  },
  'น้ำหนักสูงกว่าเกณฑ์': {
    title: "น้ำหนักสูงกว่าเกณฑ์",
    description: "น้ำหนักที่เพิ่มได้ตลอดการตั้งครรภ์ 7 - 11.5 kg",
    image: "/Overweight.png",
  },
  'อ้วน': {
    title: "อ้วน",
    description: "น้ำหนักที่เพิ่มได้ตลอดการตั้งครรภ์ 5 - 9 kg",
    image: "/Obese.png",
  },
};

const foodDetails = {
  'น้ำหนักต่ำกว่าเกณฑ์': { // Underweight
    pages: [
      {
        type: 'text',
        title: 'อาหารที่แนะนำให้รับประทาน',
        subtitle: 'น้ำหนักต่ำกว่าเกณฑ์',
        content: [
          'เน้นการรับประทานที่มีโปรตีนสูง เช่น อกไก่ ไข่ ปลาทะเล นมวัว/นมถั่วเหลือง เป็นต้น',
          'รับประทานคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ข้าวโอ๊ต ฟักทอง เป็นต้น',
          'รับประทานผลไม้ที่มีน้ำตาลต่ำ เช่น แอปเปิ้ล ฝรั่ง ชมพู่ เป็นต้น',
          'รับประทานไขมันดี เช่น น้ำมันรำข้าว น้ำมันมะกอก เป็นต้น',
          'หลีกเลี่ยง ชา กาแฟ น้ำอัดลม ขนมหวานจัด เป็นต้น',
        ],
      },
      {
        type: 'image',
        title: 'ตัวอย่างอาหารที่แนะนำ',
        subtitle: 'น้ำหนักต่ำกว่าเกณฑ์',
        content: [
          { image: '/chickenBreast.png', description: 'เน้นการรับประทานที่มีโปรตีนสูง เช่น อกไก่' },
          { image: '/brownRice.png', description: 'รับประทานคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง' },
          { image: '/apple1.png', description: 'รับประทานผลไม้ที่มีน้ำตาลต่ำ เช่น แอปเปิ้ล' },
          { image: '/oliveOil.png', description: 'รับประทานไขมันดี เช่น น้ำมันมะกอก' },
        ],
      },
    ],
  },
  // Other BMI categories can be added here later
};

const topics = [
  {
    title: "bmi. แปลผล",
    icon: "/BMI.png",
    details: `BMI = น้ำหนัก(กก.) / ส่วนสูง(ม.)^2\nBMI ก่อนตั้งครรภ์ช่วยประเมินความเสี่ยง\nควรปรึกษาแพทย์เพื่อแปลผลที่เหมาะสม`
  },
  {
    title: "อาหาร",
    icon: "/Food.png",
    details: `การเลือกอาหารมีผลต่อระดับน้ำตาลในเลือดโดยตรง\n \n ควรเลือก:\n• คาร์โบไฮเดรตเชิงซ้อน (ข้าวกล้อง, ขนมปังโฮลวีต)\n• ผักหลากสี (ควรได้ครึ่งหนึ่งของจาน)\n• โปรตีนไม่ติดมัน (ปลา, เต้าหู้, ไข่ขาว)\n• ผลไม้ที่มีน้ำตาลต่ำ (เช่น แอปเปิ้ล, ฝรั่ง)\n \n ควรหลีกเลี่ยง:\n• ของหวาน, น้ำตาล, น้ำอัดลม\n• ของทอด, อาหารมันจัด\n• คาร์โบไฮเดรง่าย (ข้าวขาว, ขนมปังขาว)`
  },
  {
    title: "ค่าระดับน้ำตาล และวิธีการจัดการ",
    icon: "/Sugar_level.png",
    details: `ควรตรวจระดับน้ำตาลในเลือดอย่างสม่ำเสมอ\nเป้าหมายระดับน้ำตาลควรอยู่ในช่วงที่แพทย์แนะนำ\nหากสูงหรือต่ำเกินไปควรปรึกษาแพทย์`
  },
  {
    title: "หญิงตั้งครรภ์ที่ฉีดอินซูลิน",
    icon: "/Insuline.png",
    details: `ใช้อินซูลินตามคำแนะนำของแพทย์\nควรฉีดในเวลาที่กำหนด\nผลข้างเคียงที่อาจพบ: น้ำตาลต่ำ, อาการแพ้บริเวณฉีด`
  },
  {
    title: "ออกกำลังกาย",
    icon: "/Workout.png",
    details: `ช่วยควบคุมระดับน้ำตาลและน้ำหนัก\n \n แนะนำ:\n• เดินเร็ว, ปั่นจักรยาน, ว่ายน้ำ อย่างน้อยวันละ 30 นาที \n • อย่างน้อย 5 วัน/สัปดาห์ \n • ตรวจน้ำตาลก่อนและหลังออกกำลังกายหากใช้ยา/อินซูลิน`
  },
  {
    title: "ภาวะแทรกซ้อน",
    icon: "/Complications.png",
    details: `ภาวะแทรกซ้อนที่อาจเกิดขึ้น เช่น ความดันสูง, โปรตีนในปัสสาวะ\nควรพบแพทย์ตามนัดและดูแลสุขภาพอย่างใกล้ชิด`
  },
];

export default function Topics() {
  const [open, setOpen] = useState<number | null>(null);
  const { patientData } = usePatient();
  const [downloading, setDownloading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [foodModalPage, setFoodModalPage] = useState(0); // For food modal pagination
  const bmiTopicIndex = topics.findIndex(t => t.title === 'bmi. แปลผล');
  const foodTopicIndex = topics.findIndex(t => t.title === 'อาหาร');
  const activeFoodDetails = patientData?.bmiCategory ? foodDetails[patientData.bmiCategory as keyof typeof foodDetails] : null;

  // Download handler
  const handleDownload = async () => {
    const password = window.prompt("กรุณาใส่รหัสผ่านเพื่อดาวน์โหลดข้อมูล (Password):");
    if (password !== "เบาใจ") {
      alert("รหัสผ่านไม่ถูกต้อง");
      return;
    }
    setDownloading(true);
    try {
      // Fetch all patient data
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      if (!data || data.length === 0) {
        alert("ไม่พบข้อมูลผู้ป่วย");
        setDownloading(false);
        return;
      }
      // Remove UUID and move patient_number to first column, format dates to Thailand time
      const exportData = data.map((row) => {
        const {
          patient_number,
          username,
          age,
          gestational_age,
          weight_before,
          height,
          bmi,
          bmi_category,
          created_at,
          updated_at,
        } = row;
        const formatThai = (dateStr: string | null | undefined) => dateStr ? dayjs.utc(dateStr).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss') : '';
        return {
          'รหัสผู้ป่วย': patient_number,
          'ชื่อผู้ใช้': username,
          'อายุ': age,
          'อายุครรภ์': gestational_age,
          'น้ำหนักก่อนตั้งครรภ์': weight_before,
          'ส่วนสูง': height,
          'BMI': bmi,
          'หมวด BMI': bmi_category,
          'สร้างเมื่อ': formatThai(created_at),
          'อัปเดตเมื่อ': formatThai(updated_at),
        };
      });
      // Convert to worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Patients");
      // Export to file
      XLSX.writeFile(wb, "patients.xlsx");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleModalClose = () => {
    setOpen(null);
    setFoodModalPage(0); // Reset food modal page on close
  };

  return (
    <div className={styles.container}>
      {/* Patient Info Display */}
      {patientData && (
        <div className={styles.patientInfoSection}>
          <div className={styles.patientInfoTitleRow}>
            <h3 className={styles.patientInfoTitle}>ข้อมูลคุณแม่</h3>
            <button
              className={styles.downloadIconButton}
              onClick={() => setShowDownload((v) => !v)}
              title="แสดงปุ่มดาวน์โหลดข้อมูล"
              type="button"
            >
              {/* Download SVG icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
          {showDownload && (
            <button
              className={styles.downloadButton}
              onClick={handleDownload}
              disabled={downloading}
              style={{ margin: '0 auto 1rem auto', display: 'block' }}
            >
              {downloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลดข้อมูล Excel"}
            </button>
          )}
          <div className={styles.patientInfoGrid}>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>ชื่อ:</span>
              <span className={styles.patientInfoValue}>{patientData.username}</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>อายุ:</span>
              <span className={styles.patientInfoValue}>{patientData.age} ปี</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>อายุครรภ์:</span>
              <span className={styles.patientInfoValue}>{patientData.gestationalAge} สัปดาห์</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>น้ำหนักก่อนตั้งครรภ์:</span>
              <span className={styles.patientInfoValue}>{patientData.weightBefore} กก.</span>
            </div>
            <div className={styles.patientInfoItem}>
              <span className={styles.patientInfoLabel}>ส่วนสูง:</span>
              <span className={styles.patientInfoValue}>{patientData.height} ซม.</span>
            </div>
            {patientData.bmi && (
              <div className={styles.patientInfoItem}>
                <span className={styles.patientInfoLabel}>BMI:</span>
                <span className={styles.patientInfoValue}>
                  {patientData.bmi} ({patientData.bmiCategory})
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
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
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {open === bmiTopicIndex ? (
              <div className={styles.bmiModalContent}>
                <h3 className={styles.modalTitle}>ค่า BMI</h3>
                <div className={styles.bmiResultValue}>
                  {patientData?.bmi ? patientData.bmi : '-'}
                </div>
                
                <h3 className={styles.modalTitle} style={{ marginTop: '1rem' }}>แปลผล</h3>

                {patientData?.bmiCategory && bmiDetails[patientData.bmiCategory] ? (
                  <>
                    <div className={styles.bmiCategoryTitle}>
                      {bmiDetails[patientData.bmiCategory].title}
                    </div>
                    <div className={styles.bmiCategoryDescription}>
                      {bmiDetails[patientData.bmiCategory].description}
                    </div>
                    <Image 
                      src={bmiDetails[patientData.bmiCategory].image}
                      alt={bmiDetails[patientData.bmiCategory].title}
                      width={250}
                      height={150}
                      className={styles.bmiCategoryImage}
                      priority
                    />
                  </>
                ) : (
                  <div className={styles.bmiPlaceholder}>กรุณากรอกข้อมูลเพื่อดูผล BMI ของคุณ</div>
                )}
              </div>
            ) : open === foodTopicIndex ? (
              <div className={styles.foodModalContent}>
                {activeFoodDetails && activeFoodDetails.pages[foodModalPage] ? (
                  <>
                    <h3 className={styles.modalTitle}>{activeFoodDetails.pages[foodModalPage].title}</h3>
                    <div className={styles.foodCategorySubtitle}>{activeFoodDetails.pages[foodModalPage].subtitle}</div>

                    {activeFoodDetails.pages[foodModalPage].type === 'text' && (
                      <ul className={styles.foodTextList}>
                        {(activeFoodDetails.pages[foodModalPage].content as string[]).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}

                    {activeFoodDetails.pages[foodModalPage].type === 'image' && (
                      <div className={styles.foodImageGrid}>
                        {(activeFoodDetails.pages[foodModalPage].content as { image: string; description: string }[]).map((item, i) => (
                          <div key={i} className={styles.foodImageItem}>
                            <Image src={item.image} alt={item.description} width={150} height={100} className={styles.foodImage} />
                            <p>{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.bmiPlaceholder}>กรุณากรอกข้อมูลเพื่อดูคำแนะนำด้านอาหาร</div>
                )}
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>{topics[open].title}</h3>
                <pre className={styles.modalContent}>{topics[open].details}</pre>
              </>
            )}

            <div className={styles.modalButtonRow}>
              {open === foodTopicIndex && activeFoodDetails && foodModalPage < activeFoodDetails.pages.length - 1 && (
                <button onClick={() => setFoodModalPage(p => p + 1)} className={styles.button}>
                  ถัดไป
                </button>
              )}
              <button onClick={handleModalClose} className={styles.button}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 