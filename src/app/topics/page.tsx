"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { PieChart } from '@mui/x-charts/PieChart';
import { usePatient } from "../context/PatientContext";
import styles from './page.module.css';
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Link from 'next/link';

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
  underweight: {
    title: "อาหารสำหรับน้ำหนักต่ำกว่าเกณฑ์",
    content: [
      "• เพิ่มการรับประทานอาหารที่มีแคลอรี่สูง",
      "• รับประทานอาหาร 5-6 มื้อต่อวัน",
      "• เพิ่มโปรตีนจากเนื้อสัตว์ ไข่ และนม",
      "• รับประทานไขมันดี เช่น น้ำมันมะกอก อะโวคาโด",
      "• หลีกเลี่ยงอาหารที่มีน้ำตาลสูง"
    ]
  },
  normal: {
    title: "อาหารสำหรับน้ำหนักปกติ",
    content: [
      "• รับประทานอาหารให้ครบ 5 หมู่",
      "• เน้นผักผลไม้และธัญพืช",
      "• จำกัดอาหารที่มีน้ำตาลและไขมันสูง",
      "• รับประทานอาหาร 3 มื้อต่อวัน",
      "• ดื่มน้ำให้เพียงพอ"
    ]
  },
  overweight: {
    title: "อาหารสำหรับน้ำหนักเกิน",
    content: [
      "• ลดการรับประทานอาหารที่มีแคลอรี่สูง",
      "• เพิ่มการรับประทานผักและผลไม้",
      "• จำกัดอาหารที่มีน้ำตาลและไขมันสูง",
      "• รับประทานอาหาร 3 มื้อต่อวัน",
      "• ออกกำลังกายควบคู่กับการควบคุมอาหาร"
    ]
  },
  obese: {
    title: "อาหารสำหรับโรคอ้วน",
    content: [
      "• ควบคุมแคลอรี่อย่างเข้มงวด",
      "• เพิ่มการรับประทานผักและผลไม้",
      "• หลีกเลี่ยงอาหารที่มีน้ำตาลและไขมันสูง",
      "• รับประทานอาหาร 3 มื้อต่อวัน",
      "• ปรึกษาแพทย์หรือนักโภชนาการ"
    ]
  }
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
    details: `This will be handled by a custom modal.` // Placeholder details
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
  {
    title: "ช่องทางการติดต่อ",
    icon: "/Contact.png",
  },
];

type StructuredContentItem = 
  | { type: 'heading'; value: string }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'image-with-reference' };

type InsulinContentValue = {
  title: string;
  content: string[];
  structuredContent?: StructuredContentItem[];
  image?: string;
};

const insulinSubTopics = [
  { title: "ข้อควรระวังในการฉีดอินซูลิน" },
  { title: "ตำแหน่งการฉีดอินซูลิน" },
  { title: "วีดีโอ" },
];

const insulinContent: { [key: string]: InsulinContentValue } = {
  "ข้อควรระวังในการฉีดอินซูลิน": {
    title: "ข้อควรระวังในการฉีดอินซูลิน",
    content: [
      '<b>ข้อควรระวัง</b>',
      '<ul style="margin: 0 0 1rem 1.5rem; padding: 0; text-align: left;">',
      '<li>ห้ามเขย่าขวดยา เพราะจะทำให้ยาเกิดฟองและทำให้ได้ปริมาณยาไม่ครบตามจำนวน</li>',
      '<li>ห้ามฉีดซ้ำที่เดิมมากกว่า 1 ครั้งในระยะเวลา 1-2 เดือน เนื่องจากอาจทำให้บริเวณที่ฉีดเกิดเป็นก้อนไตแข็งได้</li>',
      '<li>ห้ามนวดบริเวณที่ฉีด เพราะอาจทำให้ยาดุดซึมเร็วเกินไปจนเกิดภาวะน้ำตาลในเลือดต่ำ</li>',
      '<li>ก่อนทำการฉีด ให้ตรวจสอบอีกก่อนว่าเป็นอินซูลินที่ใช้อยู่เป็นประจำหรือไม่</li>',
      '</ul>'
    ],
    image: "/insulin.jpg",
  },
  "ตำแหน่งการฉีดอินซูลิน": {
    title: "ตำแหน่งการฉีดอินซูลิน",
    structuredContent: [
      { type: 'heading', value: 'ขั้นตอนการฉีดอินซูลิน' },
      { type: 'ordered-list', items: [
        'ล้างมือให้สะอาด',
        'เตรียมอุปกรณ์การฉีด',
        'เลือกตำแหน่งที่เหมาะสม',
        'ทำความสะอาดผิวหนัง',
        'ฉีดอินซูลินตามที่แพทย์แนะนำ'
      ]},
      { type: 'heading', value: 'ตำแหน่งที่แนะนำในการฉีด' },
      { type: 'unordered-list', items: [
        'หน้าท้อง (ห่างจากสะดือ 2 นิ้ว)',
        'ต้นแขนด้านนอก',
        'ต้นขาด้านนอก',
        'ก้น'
      ]},
      { type: 'image-with-reference' },
      { type: 'heading', value: 'ข้อควรระวัง' },
      { type: 'unordered-list', items: [
        'เปลี่ยนตำแหน่งการฉีดทุกครั้ง',
        'ไม่ฉีดในบริเวณที่มีรอยแผลหรือการอักเสบ',
        'เก็บอินซูลินในตู้เย็น',
        'ตรวจสอบวันหมดอายุก่อนใช้'
      ]}
    ],
    content: [], // Now empty, will be rendered by structuredContent
    image: "/insulin2.jpg",
  },
  "วีดีโอ": {
    title: "วีดีโอ",
    content: [
      '<div style="margin-bottom:2rem;">'
        + '<div id="needle-video-container" style="position:relative;margin-bottom:1.5rem;display:flex;justify-content:center;">'
        + '<video id="needle-video" controls width="100%" style="max-width:400px;border-radius:16px;box-shadow:0 2px 8px rgba(30,136,229,0.08);" preload="metadata">'
        + '<source src="/Insulin.mp4" type="video/mp4" />'
        + 'ขออภัย ไม่สามารถเล่นวิดีโอนี้ได้'
        + '</video>'
        + '<div id="needle-loading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:white;padding:1rem;border-radius:8px;display:none;">กำลังโหลดวิดีโอ...</div>'
        + '</div>'
      + '</div>'
    ]
  },
};

const yogaPoses = [
  {
    image: "/Extended_triangle_pose.JPG",
    title: "ท่าที่ 1.Utthita Trikonasana (Extended triangle pose)",
    description: "ช่วยเสริมสร้างกล้ามเนื้ออุ้งเชิงกราน ต้นขา และน่อง เพิ่มความยืดหยุ่นของกระดูกสันหลังและช่วยปรับปรุงการย่อยอาหาร"
  },
  {
    image: "/Warrior_pose.JPG",
    title: "ท่าที่ 2.Virbhadrasan (Warrior pose)",
    description: "ช่วยยืดกล้ามเนื้อบริเวณขาหนีบ เสริมสร้างความแข็งแรงให้กล้ามเนื้อร่างกายและหลัง กระชับกล้ามเนื้อส่วนล่าง เพิ่มความแข็งแรงและความยืดหยุ่น และบรรเทาอาการปวดหลัง"
  },
  {
    image: "/Tree_pose.JPG",
    title: "ท่าที่ 3.Vrikshasan (Tree pose)",
    description: "ช่วยยืดกล้ามเนื้อขา หลัง และแขน ช่วยให้ร่างกายแข็งแรงและเพิ่มสมาธิ"
  },
  {
    image: "/Thunderbolt_pose.JPG",
    title: "ท่าที่ 4.Vajrasan (Thunderbolt pose)",
    description: "ช่วยเพิ่มประสิทธิภาพระบบย่อยอาหาร ปรับเปลี่ยนการไหลเวียนโลหิตและแรงกระตุ้นของระบบประสาทในบริเวณอุ้งเชิงกราน บรรเทาอาการเจ็บป่วยในกระเพาะอาหาร เช่น ภาวะกรดเกิน และเป็นอาสนะเดียวที่สามารถฝึกได้หลังรับประทานอาหารได้"
  },
  {
    image: "/Cat_stretch_pose.JPG",
    title: "ท่าที่ 5.Marjariasan (Cat stretch pose)",
    description: "อาสนะนี้ช่วยเพิ่มความยืดหยุ่นของกล้ามเนื้อคอ กระดูกสันหลัง และไหล่ ซึ่งจำเป็นต่อการออกแรงขณะคลอดบุตร และลดอาการปวดหลัง"
  },
];

const exerciseSubTopics = [
  { title: "การเดิน" },
  { title: "โยคะ" },
  { title: "การว่ายน้ำ" },
];

const exerciseContent = {
  "การเดิน": {
    title: "การเดิน",
    content: [
      "สตรีตั้งครรภ์ควรเดินอย่างน้อย 3 วันต่อสัปดาห์ ระยะเวลาในการออกกําลังกายครั้งละ 30 นาที"
    ],
    images: ["/Walk1.PNG", "/Walk2.PNG"]
  },
  "โยคะ": {
    title: "โยคะ",
    content: [
      "โดยระยะเวลาการเล่นโยคะต่อท่า โดยทั่วไปจะค้างค่าแรง 30 วินาทีถึง 1 วินาที และทำซ้ำ 3 -5 รอบ"
    ],
    poses: yogaPoses
  },
  "การว่ายน้ำ": {
    title: "การว่ายน้ำ",
    activities: [
      {
        image: "/Swimming1.JPG",
        title: "เดินช้าๆ ในนํ้า ยืนบิดตัวซ้ายขวา",
        description: "การบิดตัวแบบนี้จะไม่เป็นอันตรายเพราะน้ำจะช่วยต้านแรงการบิดไว้ได้ ทำให้เป็นการบิดตัวที่ช้าและนุ่มนวลมากขึ้น"
      },
      {
        image: "/Swimming2.JPG",
        title: "ลอยตัวเหนือน้ำ",
        description: "ช่วยให้แม่ท้องได้ลอยอึ้งๆ และสร้างสมาธิ มีความเย็นของน้ำช่วยให้จิตใจสงบ"
      },
    ]
  }
};

const complicationsContent = [
  {
    title: "ความดันโลหิตสูงขณะตั้งครรภ์ (PIH / preeclampsia)",
    description: "เกิดจากรกได้รับเลือดไม่พอ ทําให้ปล่อยสาร sFlt-1 ทําให้หลอดเลือดหดตัว แข็งตัว ความดันสูงขึ้น มารดาจะมีอาการปวดหัว ตาพร่า จุกลิ้นปี่ ปัสสาวะมีโปรตีน ถ้ารุนแรงมากเสี่ยงชัก (eclampsia) ซึ่งอันตรายต่อชีวิตทั้งมารดาและทารก"
  },
  {
    title: "ครรภ์เป็นพิษ (Eclampsia)",
    description: "หากควบคุมน้ำตาลไม่ดี อาจพัฒนาเป็นภาวะรุนแรงได้ โดยมีความดันโลหิตสูงร่วมกับโปรตีนในปัสสาวะ อาจมีอาการปวดหัว ตาพร่า บวมตามร่างกาย และเจ็บชายโครงขวา หากรุนแรงอาจเกิดภาวะชัก (Eclampsia), ตับวาย, ไตวาย หรือรกลอกตัวก่อนกำหนด อันตรายถึงชีวิตทั้งมารดาและทารก"
  },
  {
    title: "ติดเชื้อทางเดินปัสสาวะ",
    description: "เกิดได้ง่ายขึ้นในหญิงตั้งครรภ์ที่มีน้ำตาลสูงเนื่องจากการเผาผลาญคาร์โบไฮเดรตที่ผิดปกติ มีผลให้เกิดการเปลี่ยนแปลงภาวะความเป็นกรดด่างในช่องคลอด เกิดการอักเสบและติดเชื้อได้ง่าย"
  },
  {
    title: "น้ำคร่ำมาก (Polyhydramnios)",
    description: "น้ำตาลสูงกระตุ้นการปัสสาวะของทารก ทำให้มีน้ำคร่ำมาก มักพบในหญิงตั้งครรภ์ที่เป็นเบาหวาน หรือทารกในครรภ์มีความผิดปกติ เช่น กลืนหรือดูดซึมน้ำคร่ำไม่ได้ ภาวะนี้อาจทำให้มดลูกขยายเร็ว เสี่ยงต่อการคลอดก่อนกำหนด ทารกอยู่ในท่าผิดปกติ หรือเกิดภาวะรกลอกตัวก่อนกำหนด"
  },
  {
    title: "คลอดยาก/ต้องผ่าคลอด",
    description: "เพราะทารกตัวโตผิดปกติ (macrosomia) ทำให้เกิดการคลอดยาก มีโอกาสไหล่ติดขณะคลอดได้สูง เพิ่มอุบัติการณ์การช่วยคลอดด้วยสูติศาสตร์หัตถการและอัตราผ่าตัดคลอด ทารกได้รับบาดเจ็บขณะคลอด เช่น เกิดอันตรายต่อเส้นประสาทบริเวณแขน เป็นอัมพาตบริเวณใบหน้า"
  },
  {
    title: "เสี่ยงเบาหวานชนิดที่ 2 หลังคลอด",
    description: "โดยเฉพาะหากไม่ได้ควบคุมอย่างเหมาะสมในระหว่างตั้งครรภ์ เพราะร่างกายมีแนวโน้มดื้อต่ออินซูลินต่อเนื่องแม้คลอดแล้ว หากไม่ควบคุมน้ำหนัก อาหาร และออกกำลังกายอย่างเหมาะสม ความเสี่ยงจะยิ่งเพิ่มขึ้น"
  },
  {
    title: "เสี่ยงแท้ง/คลอดก่อนกำหนด",
    description: "ระดับน้ำตาลในเลือดที่สูงผิดปกติอาจส่งผลต่อการเจริญเติบโตของรกและทารกในครรภ์ ทำให้รกเสื่อมหรือทำงานผิดปกติเร็วขึ้น รวมถึงเพิ่มโอกาสเกิดภาวะน้ำคร่ำมากหรือความดันโลหิตสูง ซึ่งล้วนเป็นปัจจัยกระตุ้นให้มดลูกบีบตัวก่อนกำหนด"
  }
];

function hasActivities(obj: any): obj is { activities: { image: string; title: string; description: string; }[] } {
  return obj && Array.isArray(obj.activities);
}

const Collapsible = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ textAlign: 'left', marginTop: '0.5rem', fontSize: '14px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#1E88E5', 
          cursor: 'pointer', 
          padding: '0.25rem 0',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <span style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginRight: '0.5rem' }}>
          ▶
        </span>
        {title}
      </button>
      {isOpen && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          border: '1px solid #e3f2fd', 
          borderRadius: '8px', 
          backgroundColor: '#f8faff', 
          color: '#37474F',
          lineHeight: '1.6',
          textAlign: 'justify'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

function hasContent(obj: any): obj is { content: string[] } {
  return obj && Array.isArray(obj.content);
}

function hasImage(obj: any): obj is { image: string } {
  return obj && typeof obj.image === 'string' && obj.image.length > 0;
}

export default function Topics() {
  const [open, setOpen] = useState<number | null>(null);
  const { patientData } = usePatient();
  const [downloading, setDownloading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [foodModalPage, setFoodModalPage] = useState(0);
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [activeInsulinSubTopic, setActiveInsulinSubTopic] = useState<string>('');
  const [videoLoading, setVideoLoading] = useState<{ [key: string]: boolean }>({});
  const [videoError, setVideoError] = useState<{ [key: string]: boolean }>({});
  const [sugarLevel, setSugarLevel] = useState<string>('');
  const [sugarModalPage, setSugarModalPage] = useState<'input' | 'high' | 'low'>('input');
  const [activeExerciseSubTopic, setActiveExerciseSubTopic] = useState<string | null>(null);
  const [selectedFoodImage, setSelectedFoodImage] = useState<string | null>(null);

  const calculateDailyCalories = (bmi: number, weight: number) => {
    let kcalPerKg = 30; // default
    if (bmi < 18.5) kcalPerKg = 40;
    else if (bmi >= 18.5 && bmi <= 24.9) kcalPerKg = 30;
    else if (bmi >= 25 && bmi <= 29.9) kcalPerKg = 25;
    else if (bmi >= 30) kcalPerKg = 12;
    
    return Math.round(kcalPerKg * weight);
  };

  const nutrientAdvice = {
    fat: {
      title: "ไขมัน (20%)",
      image: "/FoodFat.jpg",
      description: "ไขมันเป็นแหล่งพลังงานที่เข้มข้นที่สุดและช่วยในการดูดซึมวิตามินที่ละลายในไขมัน (วิตามิน A, D, E และ K) นอกจากนี้ ไขมันยังช่วยให้ร่างกายสร้างฮอร์โมนและเซลล์ต่าง ๆ การรับประทานไขมันในปริมาณที่พอเหมาะจึงเป็นสิ่งสำคัญ",
      sources: "แหล่งไขมันที่ดี ได้แก่ น้ำมันมะกอก น้ำมันมะพร้าว และน้ำมันเมล็ดพืช ปลา เช่น ปลาแซลมอน ปลาทูน่า ถั่วและเมล็ดพืช เช่น อัลมอนด์ เมล็ดแฟลกซ์ อะโวคาโด",
      advice: [
        "พัฒนาการสมองและระบบประสาท: กรดไขมันโอเมก้า 3 และ DHA ที่พบในปลาทะเลและอาหารอื่น ๆ มีความสำคัญต่อการพัฒนาสมองและระบบประสาทของทารกในครรภ์",
        "ลดความเสี่ยงของโรคหัวใจ: ไขมันดีช่วยลดระดับคอเลสเตอรอลที่ไม่ดีในร่างกาย ทำให้ลดความเสี่ยงของโรคหัวใจและหลอดเลือด",
        "เป็นแหล่งพลังงาน: ไขมันเป็นแหล่งพลังงานสำคัญสำหรับร่างกาย ช่วยในการดูดซึมวิตามินที่ละลายในไขมัน และช่วยในการทำงานของระบบต่าง ๆ ในร่างกาย",
        "ช่วยในการดูดซึมวิตามิน: ไขมันช่วยในการดูดซึมวิตามินที่ละลายในไขมัน เช่น วิตามินเอ, ดี, อี, และ เค"
      ]
    },
    protein: {
      title: "โปรตีน (40%)",
      image: "/FoodProtein.jpeg",
      description: "โปรตีน ซึ่งมีบทบาทสำคัญในการเสริมสร้างและซ่อมแซมเนื้อเยื่อในร่างกาย รวมถึงการสร้างกล้ามเนื้อและเอนไซม์ โปรตีนยังช่วยเสริมสร้างระบบภูมิคุ้มกันและเป็นแหล่งพลังงานที่สำคัญ",
      sources: "แหล่งโปรตีนที่ดี ได้แก่ เนื้อสัตว์ เช่น เนื้อหมู เนื้อไก่ และเนื้อวัว เนื้อปลา ไข่ นมและผลิตภัณฑ์จากนม เช่น ชีสและโยเกิร์ต ถั่วเมล็ดแห้ง เช่น ถั่วเหลือง ถั่วลิสง และถั่วแดง",
      advice: [
        "สร้างและซ่อมแซมส่วนที่สึกหรอ: โปรตีนเป็นส่วนประกอบสำคัญในการสร้างและซ่อมแซมเซลล์และเนื้อเยื่อต่าง ๆ ในร่างกายของคุณแม่และทารก",
        "เสริมสร้างพัฒนาการของทารก: โปรตีนช่วยในการเจริญเติบโตของทารกในครรภ์ โดยเฉพาะอย่างยิ่งการสร้างกล้ามเนื้อ กระดูก และสมอง",
        "ช่วยสร้างภูมิคุ้มกัน: โปรตีนมีส่วนช่วยในการสร้างภูมิคุ้มกัน ทำให้ร่างกายแข็งแรงและสามารถต่อสู้กับการติดเชื้อได้",
        "ช่วยควบคุมระดับน้ำตาลในเลือด: โปรตีนมีส่วนช่วยในการรักษาสมดุลของระดับน้ำตาลในเลือด ซึ่งมีความสำคัญสำหรับคุณแม่ที่อาจมีความเสี่ยงเป็นโรคเบาหวานขณะตั้งครรภ์"
      ]
    },
    carbs: {
      title: "คาร์โบไฮเดรต (40%)",
      image: "/FoodCarbohydrates.jpeg",
      description: "คาร์โบไฮเดรตเป็นแหล่งพลังงานหลักของร่างกาย โดยเฉพาะสำหรับการทำงานของสมองและระบบประสาท การรับประทานคาร์โบไฮเดรตในปริมาณที่เหมาะสมจะช่วยให้ร่างกายมีพลังงานเพียงพอสำหรับกิจกรรมในชีวิตประจำวัน",
      sources: "แหล่งคาร์โบไฮเดรตที่ดี ได้แก่ ข้าวและผลิตภัณฑ์จากข้าว เช่น ข้าวสวย ข้าวกล้อง ข้าวเหนียว ขนมปัง และแป้งต่าง ๆ มันฝรั่งและมันเทศ ธัญพืชต่าง ๆ เช่น ข้าวโอ๊ตและควินัว",
      advice: [
        "คาร์โบไฮเดรตมีความสำคัญต่อหญิงตั้งครรภ์ เพราะเป็นแหล่งพลังงานหลักและมีผลต่อพัฒนาการของทารกในครรภ์",
        "การเลือกทานคาร์โบไฮเดรตที่มีประโยชน์และในปริมาณที่เหมาะสมและมีความสำคัญ"
      ]
    }
  };

  const getCalorieRequirement = (bmi: number) => {
    if (bmi < 18.5) return "ประมาณ 40 kcal/kg";
    if (bmi >= 18.5 && bmi <= 24.9) return "ประมาณ 30 kcal/kg";
    if (bmi >= 25 && bmi <= 29.9) return "ประมาณ 25 kcal/kg";
    if (bmi >= 30) return "ประมาณ 12 kcal/kg";
    return "ประมาณ 30 kcal/kg"; // default
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "underweight";
    if (bmi >= 18.5 && bmi <= 24.9) return "normal";
    if (bmi >= 25 && bmi <= 29.9) return "overweight";
    if (bmi >= 30) return "obese";
    return "normal";
  };

  const getBMIDescription = (bmi: number) => {
    if (bmi < 18.5) return "(น้ำหนักต่ำกว่าเกณฑ์)";
    if (bmi >= 18.5 && bmi <= 24.9) return "(น้ำหนักตามเกณฑ์)";
    if (bmi >= 25 && bmi <= 29.9) return "(น้ำหนักสูงกว่าเกณฑ์)";
    if (bmi >= 30) return "(โรคอ้วน)";
    return "(น้ำหนักตามเกณฑ์)";
  };

  const hasImage = (obj: any): obj is { image: string } => {
    return obj && typeof obj.image === 'string';
  };

  const hasDescription = (obj: any): obj is { description: string } => {
    return obj && typeof obj.description === 'string';
  };

  const hasSources = (obj: any): obj is { sources: string } => {
    return obj && typeof obj.sources === 'string';
  };

  const foodTopicIndex = topics.findIndex(t => t.title === 'อาหาร');
  const bmiTopicIndex = topics.findIndex(t => t.title === 'bmi. แปลผล');
  const insulinTopicIndex = topics.findIndex(t => t.title === 'หญิงตั้งครรภ์ที่ฉีดอินซูลิน');
  const sugarTopicIndex = topics.findIndex(t => t.title === 'ค่าระดับน้ำตาล และวิธีการจัดการ');
  const exerciseTopicIndex = topics.findIndex(t => t.title === 'ออกกำลังกาย');
  const complicationsTopicIndex = topics.findIndex(t => t.title === 'ภาวะแทรกซ้อน');
  const contactTopicIndex = topics.findIndex(t => t.title === 'ช่องทางการติดต่อ');
  const activeFoodDetails = patientData?.bmi ? foodDetails[getBMICategory(parseFloat(patientData.bmi)) as keyof typeof foodDetails] : null;
  const currentInsulinContent = activeInsulinSubTopic ? insulinContent[activeInsulinSubTopic as keyof typeof insulinContent] : null;
  const currentExerciseContent = activeExerciseSubTopic ? exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent] : null;

  useEffect(() => {
    if (open === insulinTopicIndex && activeInsulinSubTopic === 'วีดีโอ') {
      // Add event listeners for video loading states
      setTimeout(() => {
        const needleVideo = document.getElementById('needle-video') as HTMLVideoElement;
        const penVideo = document.getElementById('pen-video') as HTMLVideoElement;
        const needleLoading = document.getElementById('needle-loading');
        const penLoading = document.getElementById('pen-loading');

        if (needleVideo && needleLoading) {
          needleVideo.addEventListener('loadstart', () => {
            needleLoading.style.display = 'block';
          });
          needleVideo.addEventListener('canplay', () => {
            needleLoading.style.display = 'none';
          });
          needleVideo.addEventListener('error', () => {
            needleLoading.style.display = 'none';
          });
        }

        if (penVideo && penLoading) {
          penVideo.addEventListener('loadstart', () => {
            penLoading.style.display = 'block';
          });
          penVideo.addEventListener('canplay', () => {
            penLoading.style.display = 'none';
          });
          penVideo.addEventListener('error', () => {
            penLoading.style.display = 'none';
          });
        }
      }, 100);
    }
  }, [open, insulinTopicIndex, activeInsulinSubTopic]);

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
    setFoodModalPage(0);
    setActiveInsulinSubTopic('');
    setVideoLoading({});
    setVideoError({});
    setSugarLevel('');
    setSugarModalPage('input');
    setActiveExerciseSubTopic(null);
    setSelectedFoodImage(null);
  };

  const handleVideoLoad = (videoType: string) => {
    setVideoLoading(prev => ({ ...prev, [videoType]: false }));
  };

  const handleVideoError = (videoType: string) => {
    setVideoLoading(prev => ({ ...prev, [videoType]: false }));
    setVideoError(prev => ({ ...prev, [videoType]: true }));
  };

  const handleVideoLoadStart = (videoType: string) => {
    setVideoLoading(prev => ({ ...prev, [videoType]: true }));
    setVideoError(prev => ({ ...prev, [videoType]: false }));
  };
  
  const formatNumber = (num: number) => {
    return num >= 1000 ? num.toLocaleString() : num.toString();
  };
  
  const pieChartData = [
    { id: 0, value: 20, label: 'ไขมัน 20%', color: '#1E88E5' },
    { id: 1, value: 40, label: 'โปรตีน 40%', color: '#FF9800' },
    { id: 2, value: 40, label: 'คาร์โบไฮเดรต 40%', color: '#4CAF50' }
  ];
  
  const getFoodImagesByKcal = (kcal: number) => {
    if (kcal <= 1600) {
      return ['/FoodA1.jpg', '/FoodA2.jpg', '/FoodA3.jpg', '/FoodA4.jpg'];
    } else if (kcal < 1900) {
      return ['/FoodB1.jpg', '/FoodB2.jpg', '/FoodB3.jpg', '/FoodB4.jpg'];
    } else {
      return ['/FoodC1.jpg', '/FoodC2.jpg', '/FoodC3.jpg', '/FoodC4.jpg'];
    }
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
          <button
            key={topic.title}
            onClick={() => setOpen(idx)}
            className={`${styles.card} ${topic.title === 'ช่องทางการติดต่อ' ? styles.contactCard : ''}`}
          >
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
            <button onClick={handleModalClose} className={styles.closeButton}>&times;</button>
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
                {foodModalPage === 0 ? (
                  <div>
                    <div className={styles.modalTitle}>
                      <h2>อาหาร</h2>
                      <button onClick={handleModalClose} className={styles.closeButton}>
                        ×
                      </button>
                    </div>
                    
                    {patientData ? (
                      <div className={styles.foodInfoContainer}>
                        <div className={styles.userInfo}>
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>น้ำหนัก:</span>
                            <span className={styles.infoValue}>{patientData.weightBefore || 'N/A'} กก.</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>ส่วนสูง:</span>
                            <span className={styles.infoValue}>{patientData.height} ซม.</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>BMI:</span>
                            <span className={styles.infoValue}>
                              {patientData.bmi} {patientData.bmi ? getBMIDescription(parseFloat(patientData.bmi)) : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.calorieSection}>
                          <h3>พลังงานที่ต้องการต่อวัน</h3>
                          <p className={styles.calorieRequirement}>
                            {patientData.bmi ? getCalorieRequirement(parseFloat(patientData.bmi)) : 'N/A'}
                          </p>
                        </div>
                        
                        <div className={styles.foodImage}>
                          <Image 
                            src="/FoodBMI.jpeg" 
                            alt="Food BMI Guide"
                            width={300}
                            height={200}
                            className={styles.foodGuideImage}
                          />
                        </div>
                      </div>
                    ) : (
                      <p>กรุณากรอกข้อมูลผู้ป่วยก่อน</p>
                    )}
                  </div>
                ) : foodModalPage === 1 ? (
                  <div>
                    <div className={styles.calorieCalculationContainer}>
                      <div className={styles.calorieCalculation}>
                        <h3>พลังงานที่คุณแม่ควรได้รับต่อวัน</h3>
                        <div className={styles.calorieResult}>
                          {patientData && patientData.bmi && patientData.weightBefore ? 
                            `ประมาณ ${formatNumber(calculateDailyCalories(parseFloat(patientData.bmi), parseFloat(patientData.weightBefore)))} Kcal/day` : 
                            'N/A'
                          }
                        </div>
                      </div>
                      
                      <div className={styles.pieChartContainer}>
                        <h4>สัดส่วนสารอาหาร</h4>
                        <div className={styles.pieChart}>
                          <PieChart
                            series={[
                              {
                                data: pieChartData,
                                arcLabel: 'label',
                                arcLabelMinAngle: 0,
                                arcLabelRadius: '60%',
                                highlightScope: { fade: 'global', highlight: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                              },
                            ]}
                            height={250}
                            width={250}
                            onItemClick={(event, item) => {
                              if (item) {
                                const nutrientMap = ['fat', 'protein', 'carbs'];
                                const selectedNutrientKey = nutrientMap[item.dataIndex];
                                setSelectedNutrient(selectedNutrient === selectedNutrientKey ? null : selectedNutrientKey);
                              }
                            }}
                            sx={{
                              '& .MuiPieArcLabel-root': {
                                fill: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                              },
                              '& .MuiChartsLegend-root': {
                                display: 'none',
                              },
                            }}
                          />
                        </div>
                        
                        <div className={styles.pieInstruction}>
                          <p>คลิกที่ส่วนต่างๆ ของวงกลมเพื่อดูคำแนะนำ</p>
                        </div>
                      </div>
                      
                      {selectedNutrient && (
                        <div className={styles.nutrientAdvice}>
                          <h4>{nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice].title}</h4>
                          {hasImage(nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice]) && (
                            <div className={styles.nutrientImage}>
                              <Image 
                                src={(nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice] as { image: string }).image}
                                alt={nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice].title}
                                width={300}
                                height={200}
                                className={styles.nutrientAdviceImage}
                              />
                            </div>
                          )}
                          {hasDescription(nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice]) && (
                            <div className={styles.nutrientDescription}>
                              <p>
                                {
                                  (nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice] as { description?: string }).description
                                }
                              </p>
                            </div>
                          )}
                          {hasSources(nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice]) && (
                            <div className={styles.nutrientSources}>
                              <p>
                                <strong>แหล่งอาหาร:</strong>{" "}
                                {
                                  (nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice] as { sources?: string }).sources
                                }
                              </p>
                            </div>
                          )}
                          <div className={styles.nutrientBenefits}>
                            <h5>ประโยชน์ของ{selectedNutrient === 'protein' ? 'โปรตีน' : selectedNutrient === 'fat' ? 'ไขมัน' : 'คาร์โบไฮเดรต'}</h5>
                          </div>
                          <div className={styles.adviceList}>
                            {nutrientAdvice[selectedNutrient as keyof typeof nutrientAdvice].advice.map((item, index) => (
                              <p key={index} className={styles.adviceItem}>{item}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : foodModalPage === 2 ? (
                  <div>
                    <h3 className={styles.modalTitle}>เลือกเมนูอาหาร</h3>
                    {selectedFoodImage ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Image src={selectedFoodImage} alt="อาหาร" width={350} height={250} style={{ borderRadius: 16, marginBottom: 16 }} />
                      </div>
                    ) : (
                      <div>
                        {patientData ? (
                          <>
                            <div className={styles.foodGrid}>
                              {getFoodImagesByKcal(
                                patientData.bmi && patientData.weightBefore
                                  ? calculateDailyCalories(parseFloat(patientData.bmi), parseFloat(patientData.weightBefore))
                                  : 0
                              ).map((img, idx) => (
                                <div key={img} className={styles.foodMiniCard} onClick={() => setSelectedFoodImage(img)}>
                                  <Image src={img} alt={`อาหาร ${idx + 1}`} width={140} height={100} style={{ borderRadius: 12, objectFit: 'cover' }} />
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p>กรุณากรอกข้อมูลผู้ป่วยก่อน</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : open === insulinTopicIndex ? (
              <div className={styles.insulinModalContent}>
                {activeInsulinSubTopic ? (
                  // Detailed View
                  (() => {
                    const currentInsulinData = insulinContent[activeInsulinSubTopic as keyof typeof insulinContent];
                    
                    // New structured content renderer
                    if (currentInsulinData.structuredContent && Array.isArray(currentInsulinData.structuredContent)) {
                      return (
                        <div className={styles.insulinDetailContent}>
                          <h3 className={styles.modalTitle}>{currentInsulinData.title}</h3>
                          {currentInsulinData.structuredContent.map((item: any, index: number) => {
                            switch (item.type) {
                              case 'heading':
                                return <h4 key={index} style={{fontWeight: 'bold', marginBottom: '1rem'}}>{item.value}</h4>;
                              case 'ordered-list':
                                return (
                                  <ol key={index} style={{paddingLeft: '2rem', marginBottom: '1rem'}}>
                                    {item.items.map((li: string, i: number) => <li key={i}>{li}</li>)}
                                  </ol>
                                );
                              case 'unordered-list':
                                return (
                                  <ul key={index} style={{paddingLeft: '2rem', marginBottom: '1rem', listStyleType: 'disc'}}>
                                    {item.items.map((li: string, i: number) => <li key={i}>{li}</li>)}
                                  </ul>
                                );
                              case 'image-with-reference':
                                return (
                                  <div key={index} style={{width:'100%',textAlign:'center',margin:'1rem 0'}}>
                                    <Image src="/Insulin_Injection.JPG" alt="ตำแหน่งการฉีดอินซูลิน" width={300} height={300} style={{maxWidth:'300px',width:'100%', height:'auto', borderRadius:'16px',boxShadow:'0 2px 8px rgba(30,136,229,0.08)'}} />
                                    <Collapsible title="อ้างอิง">
                                      <p style={{margin:0, padding: 0, wordWrap: 'break-word', textAlign: 'left'}}>
                                          Iconic Bestiary (ผู้สร้างสรรค)์. (2022). Insulin injection infographic vector. Diabetes treatment. Insulin shots area on human body. Vector illustration. [ภาพเวกเตอร]์, สืบค้นเมื่อ 15 สิงหาคม 2568, จาก: <a href="https://depositphotos.com/th/vector/insulin-injection-infographic-vector-diabetes-treatment-insulin-shots-area-human-632982418.html" target="_blank" rel="noopener noreferrer" style={{color: '#1E88E5', textDecoration: 'underline'}}>https://depositphotos.com/th/vector/insulin-injection-infographic-vector-diabetes-treatment-insulin-shots-area-human-632982418.html</a>
                                      </p>
                                    </Collapsible>
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })}
                          {currentInsulinContent && hasImage(currentInsulinContent) && (
                            <Image 
                              src={currentInsulinContent.image}
                              alt={currentInsulinContent.title}
                              width={300}
                              height={200}
                              className={styles.insulinDetailImage}
                            />
                          )}
                        </div>
                      );
                    }
            
                    // Default rendering for other insulin sub-topics
                    return (
                      <div className={styles.insulinDetailContent}>
                        <h3 className={styles.modalTitle}>{currentInsulinData.title}</h3>
                        {currentInsulinData.content.map((text, i) => 
                          <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                        )}
                        {currentInsulinContent && hasImage(currentInsulinContent) && (
                            <Image 
                              src={currentInsulinContent.image}
                              alt={currentInsulinContent.title}
                              width={300}
                              height={200}
                              className={styles.insulinDetailImage}
                            />
                         )}
                      </div>
                    );
                  })()
                ) : (
                  // Sub-topic Selection View
                  <>
                    <h3 className={styles.modalTitle}>อินซูลิน</h3>
                    <div className={styles.insulinSubTopicGrid}>
                      {insulinSubTopics.map((subTopic) => (
                        <button 
                          key={subTopic.title} 
                          className={styles.insulinSubTopicCard}
                          onClick={() => setActiveInsulinSubTopic(subTopic.title)}
                        >
                          {subTopic.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : open === sugarTopicIndex ? (
              <div className={styles.sugarModalContent}>
                {sugarModalPage === 'input' ? (
                  <>
                    <h3 className={styles.modalTitle}>ระดับน้ำตาลในเลือด</h3>
                    <div className={styles.sugarInputContainer}>
                      <span className={styles.sugarInput} style={{background:'#f8faff', border:'1px solid #e3f2fd', color:'#1E88E5', fontWeight:600}}>
                        {patientData?.sugar_level !== undefined && patientData?.sugar_level !== null && patientData?.sugar_level !== '' ? patientData.sugar_level : '-'}
                      </span>
                      <span className={styles.sugarUnit}>mg/dL</span>
                    </div>
                    {patientData?.sugar_level !== undefined && patientData?.sugar_level !== null && patientData?.sugar_level !== '' && (
                      <div className={styles.sugarResult}>
                        {parseFloat(String(patientData.sugar_level)) < 105 ? (
                          <div className={styles.sugarContent}>
                            <p className={styles.sugarResultTitle}>เบาหวานขณะตั้งครรภ์ชนิด A1 (GDM A1)</p>
                            <ul>
                              <li>เป็นเบาหวานที่ตรวจพบขณะตั้งครรภ์ และ <b>สามารถควบคุมได้ด้วยการปรับเปลี่ยนอาหาร</b> และการออกกำลังกาย</li>
                              <li><b>เป้าหมาย:</b>
                                <ul className={styles.nestedList}>
                                  <li>ระดับน้ำตาลก่อนอาหาร &lt; 95 mg/dL</li>
                                  <li>ระดับน้ำตาลหลังอาหาร 1 ชม. &lt; 140 mg/dL</li>
                                  <li>ระดับน้ำตาลหลังอาหาร 2 ชม. &lt; 120 mg/dL</li>
                                </ul>
                              </li>
                              <li>หากควบคุมได้ตามนี้ มักจะยัง <b>ไม่จำเป็นต้องใช้ยา</b></li>
                            </ul>
                          </div>
                        ) : (
                          <div className={styles.sugarContent}>
                            <p className={styles.sugarResultTitle}>เบาหวานขณะตั้งครรภ์ชนิด A2 (GDM A2)</p>
                             <ul>
                              <li>เป็นเบาหวานขณะตั้งครรภ์ที่ <b>จำเป็นต้องใช้ยาหรืออินซูลิน</b> ร่วมกับการคุมอาหาร</li>
                              <li><b>เกณฑ์พิจารณาใช้ยา:</b>
                                <ul className={styles.nestedList}>
                                  <li>ระดับน้ำตาลก่อนอาหาร ≥ 95 mg/dL</li>
                                  <li>ระดับน้ำตาลหลังอาหาร 1 ชม. &lt; 140 mg/dL</li>
                                  <li>หรือ ระดับน้ำตาลหลังอาหาร 2 ชม. ≥ 120 mg/dL (แม้จะคุมอาหารแล้ว)</li>
                                </ul>
                              </li>
                              <li>การใช้ยาจะช่วยควบคุมระดับน้ำตาลให้อยู่ในเกณฑ์ที่ปลอดภัยต่อคุณแม่และทารก</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    <div className={styles.modalButtonRow}>
                      <button onClick={() => setSugarModalPage('low')} className={styles.button}>
                        น้ำตาลต่ำ ทำยังไงดี?
                      </button>
                      <button onClick={() => setSugarModalPage('high')} className={styles.button}>
                        น้ำตาลสูง ทำยังไงดี?
                      </button>
                    </div>
                  </>
                ) : sugarModalPage === 'high' ? (
                  <div className={styles.sugarDetailContent}>
                    <h3 className={styles.modalTitle}>ภาวะน้ำตาลในเลือดสูง</h3>
                    <div className={styles.sugarSubtitle}>
                      <p><b>Hyperglycemia</b></p>
                      <p className={styles.sugarSubDetail}>คือภาวะที่ระดับน้ำตาลในเลือดสูงกว่า 100 mg/dL ซึ่งมีอาการผิดปกติดังนี้</p>
                    </div>
                    <div className={styles.sugarContent}>
                        <p><b>อาการที่ควรสังเกต:</b></p>
                        <ul>
                            <li>กระหายน้ำบ่อย ดื่มน้ำเยอะ</li>
                            <li>ปัสสาวะบ่อยและปริมาณมาก</li>
                            <li>อ่อนเพลีย ไม่มีแรง</li>
                            <li>ตาพร่ามัว</li>
                        </ul>
                        <p style={ { marginTop: '1rem' } }><b>สิ่งที่ควรทำ:</b></p>
                        <p>หากมีอาการเหล่านี้ ควรปรึกษาแพทย์เพื่อปรับแผนการรักษา และควบคุมอาหารอย่างเคร่งครัด</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.sugarDetailContent}>
                    <h3 className={styles.modalTitle}>ภาวะน้ำตาลในเลือดต่ำ</h3>
                    <div className={styles.sugarSubtitle}>
                      <p><b>Hypoglycemia</b></p>
                      <p className={styles.sugarSubDetail}>คือภาวะที่ระดับน้ำตาลในเลือดต่ำกว่า 70 mg/dL ซึ่งมีอาการผิดปกติดังนี้</p>
                    </div>
                    <div className={styles.sugarContent}>
                      <p><b>อาการที่ควรสังเกต:</b></p>
                      <ul>
                        <li>ใจสั่น มือสั่น</li>
                        <li>เหงื่อออกมากผิดปกติ</li>
                        <li>หน้ามืด เวียนศีรษะ</li>
                        <li>รู้สึกหิวทันที</li>
                        <li>วิตกกังวล กระสับกระส่าย</li>
                      </ul>
                      <p style={ { marginTop: '1rem' } }><b>สิ่งที่ควรทำ:</b></p>
                      <ul>
                        <li><b>หากรู้สึกตัวดี:</b> ให้รีบดื่มน้ำหวาน, น้ำผลไม้ (ประมาณ ½ แก้ว) หรืออมลูกอม เพื่อเพิ่มระดับน้ำตาลอย่างรวดเร็ว</li>
                        <li><b>หากอาการรุนแรงหรือไม่ดีขึ้น:</b> ควรรีบไปพบแพทย์ทันที</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : open === exerciseTopicIndex ? (
              <div className={styles.exerciseModalContent}>
                {activeExerciseSubTopic ? (
                  // Detailed View
                  <div className={styles.exerciseDetailContent}>
                    <h3 className={styles.modalTitle}>{exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent].title}</h3>
                    {currentExerciseContent && hasContent(currentExerciseContent) && currentExerciseContent.content.map((text: string, i: number) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                    ))}
                    {activeExerciseSubTopic === 'การเดิน' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
                        <Image src="/Walk1.PNG" alt="การเดิน 1" width={300} height={200} className={styles.exerciseDetailImage} />
                        <Image src="/Walk2.PNG" alt="การเดิน 2" width={300} height={200} className={styles.exerciseDetailImage} />
                      </div>
                    ) : activeExerciseSubTopic === 'โยคะ' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%' }}>
                        {yogaPoses.map((pose, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Image src={pose.image} alt={pose.title} width={300} height={200} className={styles.exerciseDetailImage} />
                            <div style={{ marginTop: '0.5rem', fontWeight: 600, color: '#1E88E5', textAlign: 'center' }}>{pose.title}</div>
                            <div style={{ color: '#37474F', textAlign: 'center', fontSize: '15px', marginTop: '0.2rem' }}>{pose.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : activeExerciseSubTopic === 'การว่ายน้ำ' && currentExerciseContent && hasActivities(currentExerciseContent) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%' }}>
                        {currentExerciseContent.activities.map((activity: { image: string; title: string; description: string; }, idx: number) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Image src={activity.image} alt={activity.title} width={300} height={200} className={styles.exerciseDetailImage} />
                            <div style={{ marginTop: '0.5rem', fontWeight: 600, color: '#1E88E5', textAlign: 'center' }}>{activity.title}</div>
                            <div style={{ color: '#37474F', textAlign: 'center', fontSize: '15px', marginTop: '0.2rem' }}>{activity.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      'image' in exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent] && (
                        <Image 
                          src={(exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent] as any).image}
                          alt={exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent].title}
                          width={300}
                          height={200}
                          className={styles.exerciseDetailImage}
                        />
                      )
                    )}
                  </div>
                ) : (
                  // Sub-topic Selection View
                  <>
                    <h3 className={styles.modalTitle}>ออกกำลังกาย</h3>
                    <div className={styles.exerciseSubTopicGrid}>
                      {exerciseSubTopics.map((subTopic) => (
                        <button 
                          key={subTopic.title} 
                          className={styles.exerciseSubTopicCard}
                          onClick={() => setActiveExerciseSubTopic(subTopic.title)}
                        >
                          {subTopic.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : open === complicationsTopicIndex ? (
              <>
                <h3 className={styles.modalTitle}>ภาวะแทรกซ้อน</h3>
                <div className={styles.complicationsModalContent}>
                  <div className={styles.complicationsGrid}>
                    {complicationsContent.map((comp, i) => (
                      <div key={i} className={styles.complicationCard}>
                        <h4 className={styles.complicationCardTitle}>{comp.title}</h4>
                        <p className={styles.complicationCardDescription}>{comp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className={styles.modalTitle}>{topics[open].title}</h3>
                <pre className={styles.modalContent}>{topics[open].details}</pre>
              </>
            )}

            {open === contactTopicIndex && (
              <div className={styles.contactModalContent}>
                <p className={styles.lineOfficialText}>Line Official: เบาใจเรื่องเบาหวาน</p>
                <a
                    href="https://lin.ee/FU5Fov47"
                    target="_blank"
                    rel="noopener noreferrer"
                  ><Image
                  src="/LineQrCode.PNG"
                  alt="Line QR Code"
                  width={200}
                  height={200}
                /></a>
                <p>
                  <a
                    href="https://lin.ee/FU5Fov47"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.lineLink}
                  >
                    LineID: @524russo
                  </a>
                </p>
                <p className={styles.lineText}>แสกน หรือคลิ๊กที่ Qrcode ได้เลย!</p>
              </div>
            )}

            <div className={styles.modalButtonRow}>
              {/* Food Modal Navigation */}
              {open === foodTopicIndex && (
                <div className={styles.modalButtonRow}>
                  {/* Food Modal Navigation */}
                  {selectedFoodImage ? (
                    <button onClick={() => setSelectedFoodImage(null)} className={styles.button}>
                      ย้อนกลับ
                    </button>
                  ) : (
                    <>
                      {foodModalPage > 0 && (
                        <button onClick={() => setFoodModalPage(foodModalPage - 1)} className={styles.button}>
                          ย้อนกลับ
                        </button>
                      )}
                      {/* There are now 3 pages: 0 (info), 1 (calorie), 2 (grid) */}
                      {foodModalPage < 2 && (
                        <button onClick={() => setFoodModalPage(foodModalPage + 1)} className={styles.button}>
                          ถัดไป
                        </button>
                      )}
                      {foodModalPage === 2 && !selectedFoodImage && (
                        <button onClick={handleModalClose} className={styles.button}>
                        กลับสู่หน้าหลัก
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Other Modals Navigation */}
              {open !== foodTopicIndex && (
                <>
                  {open === insulinTopicIndex && activeInsulinSubTopic ? (
                    <button onClick={() => setActiveInsulinSubTopic('')} className={styles.button}>
                      ย้อนกลับ
                    </button>
                  ) : null}
                  {open === sugarTopicIndex && sugarModalPage !== 'input' ? (
                    <button onClick={() => setSugarModalPage('input')} className={styles.button}>
                      ย้อนกลับ
                    </button>
                  ) : null}
                  {open === exerciseTopicIndex && activeExerciseSubTopic ? (
                    <button onClick={() => setActiveExerciseSubTopic(null)} className={styles.button}>
                      ย้อนกลับ
                    </button>
                  ) : null}
                  
                  {/* Main close button appears for most modals */}
                  {open !== complicationsTopicIndex && (
                     <button onClick={handleModalClose} className={styles.button}>
                        กลับสู่หน้าหลัก
                </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 