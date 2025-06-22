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
  'น้ำหนักตามเกณฑ์': { // Normal
    pages: [
      {
        type: 'text',
        title: 'อาหารที่แนะนำให้รับประทาน',
        subtitle: 'น้ำหนักตามเกณฑ์',
        content: [
          'เน้นอาหาร เลือกกินอาหารมีประโยชน์ให้ครบทั้ง 5 หมู่',
          'เลือกอาหารประเภทโปรตีนเป็นหลัก เช่น เนื้อ นม ไข่ ถั่ว',
          'รับประทานวิตามินจากพืชผักและผลไม้',
          'ไม่เน้นอาหารประเภทคาร์โบไฮเดรต และอาหารที่มีน้ำตาลสูง',
          'รับประทานอาหารย่อยง่ายและมีกากใย เช่น โปรตีนจากเนื้อปลา และวิตามินจากผัก',
        ],
      },
      {
        type: 'image',
        title: 'ตัวอย่างอาหารที่แนะนำ',
        subtitle: 'น้ำหนักตามเกณฑ์',
        content: [
          { image: '/5Group.png', description: 'เลือกกินอาหารมีประโยชน์ให้ครบทั้ง 5 หมู่' },
          { image: '/salmon.png', description: 'เลือกอาหารประเภทโปรตีนเป็นหลัก' },
          { image: '/veg.png', description: 'รับประทานวิตามินจากพืชผักและผลไม้' },
          { image: '/fiber.png', description: 'รับประทานอาหารย่อยง่ายและมีกากใย' },
        ],
      },
    ],
  },
  'น้ำหนักสูงกว่าเกณฑ์': { // Overweight
    pages: [
      {
        type: 'text',
        title: 'อาหารที่แนะนำให้รับประทาน',
        subtitle: 'น้ำหนักสูงกว่าเกณฑ์',
        content: [
          'เน้นอาหารที่มีโปรตีนสูง เช่น ไข่ต้ม ไก่ไม่ติดหนัง ปลา เต้าหู้ นมพร่องมันเนยโดยสามารถชะลอความหิวระหว่างวัน  ทำให้ควบคุมน้ำตาลในเลือดให้นิ่งขึ้น',
          'เน้นผักและผลไม้ที่มีน้ำตาลน้อย เช่น ตำลึง คะน้า บร็อคโคลี แครอท แตงกวา เนื่องจากใยอาหารจะช่วยการดูดซึมน้ำตาล',
          'เลือกรับประทานไขมันที่ดี เช่น น้ำมันมะกอกหรือน้ำมันรำข้าว เป็นหลักในการปรุงประกอบอาหาร ลดอาหารที่มีไขมันทรานส์ เช่น เนยขาว มาการีน และไขมันที่มีการเติม H บางส่วนลงไปในโมเลกุลไขมัน',
          'ควบคุมปริมาณคาร์โบไฮเดรต เลือกเป็นคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ขนมปังโฮลวีต ข้าวโอ๊ต แทนข้าวขาวหรือแป้งขัดสีโดยเลือกรับประทานน้อยแต่บ่อยครั้ง',
        ],
      },
      {
        type: 'image',
        title: 'ตัวอย่างอาหารที่แนะนำ',
        subtitle: 'น้ำหนักสูงกว่าเกณฑ์',
        content: [
          { image: '/highProtein.png', description: 'เน้นอาหารที่มีโปรตีนสูง เช่น ไข่ต้ม ไก่ไม่ติดหนัง ปลา' },
          { image: '/veg2.png', description: 'เน้นผักและผลไม้ที่มีน้ำตาลน้อย เช่น ตำลึง คะน้า' },
          { image: '/goodFat.png', description: 'เลือกรับประทานไขมันที่ดี ลดอาหารที่มีไขมันทรานส์' },
          { image: '/carb.png', description: 'เลือกคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ขนมปังโฮลวีต' },
        ],
      },
    ],
  },
  'อ้วน': { // Obese
    pages: [
      {
        type: 'text',
        title: 'อาหารที่แนะนำให้รับประทาน',
        subtitle: 'อ้วน',
        content: [
          'เน้นอาหารที่มีโปรตีนสูง เช่น ไข่ต้ม ไก่ไม่ติดหนัง ปลา เต้าหู้ นมพร่องมันเนย โดยสามารถชะลอความหิวระหว่างวัน  ทำให้ควบคุมน้ำตาลในเลือดให้นิ่งขึ้น',
          'เน้นผักและผลไม้ที่มีน้ำตาลน้อย เช่น ตำลึง คะน้า บร็อคโคลี แครอท แตงกวา เนื่องจากใยอาหารจะช่วยการดูดซึมน้ำตาล',
          'ควบคุมปริมาณคาร์โบไฮเดรต เลือกเป็นคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ขนมปังโฮลวีต ข้าวโอ๊ต แทนข้าวขาวหรือแป้งขัดสี โดยเลือกรับประทานน้อยแต่บ่อยครั้ง',
        ],
      },
      {
        type: 'image',
        title: 'ตัวอย่างอาหารที่แนะนำ',
        subtitle: 'อ้วน',
        content: [
          { image: '/highProtein2.png', description: 'เน้นอาหารที่มีโปรตีนสูง เช่น ไข่ต้ม ไก่ไม่ติดหนัง ปลา' },
          { image: '/veg3.png', description: 'เน้นผักและผลไม้ที่มีน้ำตาลน้อย เช่น ตำลึง คะน้า' },
          { image: '/avocado.png', description: 'ใยอาหารจาก อาโวคาโด จะช่วยการดูดซึมน้ำตาล' },
          { image: '/carb3.png', description: 'เลือกคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ขนมปังโฮลวีต' },
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
];

const insulinSubTopics = [
  { title: "อินซูลินคืออะไร" },
  { title: "วิธีการฉีดอินซูลิน" },
  { title: "ผลข้างเคียงของอินซูลิน" },
];

const insulinContent = {
  "อินซูลินคืออะไร": {
    title: "อินซูลินคืออะไร",
    content: [
      "<b>อินซูลินคือฮอร์โมนที่สำคัญ</b>",
      "อินซูลินเป็นฮอร์โมนที่ผลิตจากตับอ่อน ทำหน้าที่ช่วยให้ร่างกายนำน้ำตาลจากเลือดเข้าสู่เซลล์เพื่อใช้เป็นพลังงาน",
      "",
      "<b>ทำไมต้องใช้อินซูลินในเบาหวานขณะตั้งครรภ์</b>",
      "• เมื่อตั้งครรภ์ ร่างกายต้องการอินซูลินมากขึ้น",
      "• หากร่างกายไม่สามารถผลิตอินซูลินได้เพียงพอ จะทำให้ระดับน้ำตาลในเลือดสูง",
      "• การใช้อินซูลินช่วยควบคุมระดับน้ำตาลให้อยู่ในเกณฑ์ที่ปลอดภัย",
      "",
      "<b>ประโยชน์ของการใช้อินซูลิน</b>",
      "• ช่วยควบคุมระดับน้ำตาลในเลือดให้อยู่ในเกณฑ์ปกติ",
      "• ลดความเสี่ยงต่อภาวะแทรกซ้อนต่างๆ",
      "• ช่วยให้ทารกในครรภ์เจริญเติบโตได้ตามปกติ",
      "• ลดความเสี่ยงต่อการคลอดก่อนกำหนด",
    ],
    image: "/insulin.jpg",
  },
  "วิธีการฉีดอินซูลิน": {
    title: "วิธีการฉีดอินซูลิน",
    content: [
      "<b>ขั้นตอนการฉีดอินซูลิน</b>",
      "1. ล้างมือให้สะอาด",
      "2. เตรียมอุปกรณ์การฉีด",
      "3. เลือกตำแหน่งที่เหมาะสม",
      "4. ทำความสะอาดผิวหนัง",
      "5. ฉีดอินซูลินตามที่แพทย์แนะนำ",
      "",
      "<b>ตำแหน่งที่แนะนำในการฉีด</b>",
      "• หน้าท้อง (ห่างจากสะดือ 2 นิ้ว)",
      "• ต้นแขนด้านนอก",
      "• ต้นขาด้านนอก",
      "• ก้น",
      "",
      "<b>ข้อควรระวัง</b>",
      "• เปลี่ยนตำแหน่งการฉีดทุกครั้ง",
      "• ไม่ฉีดในบริเวณที่มีรอยแผลหรือการอักเสบ",
      "• เก็บอินซูลินในตู้เย็น",
      "• ตรวจสอบวันหมดอายุก่อนใช้",
    ],
    image: "/insulin2.jpg",
  },
  "ผลข้างเคียงของอินซูลิน": {
    title: "ผลข้างเคียงของอินซูลิน",
    content: [
      "<b>ผลข้างเคียงที่อาจเกิดขึ้น</b>",
      "<b>ภาวะน้ำตาลในเลือดต่ำ (Hypoglycemia)</b>",
      "• อาการ: เหงื่อออก ใจสั่น หิว อ่อนเพลีย",
      "• การแก้ไข: รับประทานน้ำตาลหรือน้ำผลไม้",
      "",
      "<b>ปฏิกิริยาที่บริเวณฉีด</b>",
      "• อาการ: แดง บวม คัน",
      "• การแก้ไข: เปลี่ยนตำแหน่งการฉีด",
      "",
      "<b>น้ำหนักขึ้น</b>",
      "• อาจเกิดจากการที่อินซูลินช่วยให้ร่างกายเก็บไขมัน",
      "• ควรควบคุมอาหารและออกกำลังกาย",
      "",
      "<b>เมื่อไหร่ควรติดต่อแพทย์</b>",
      "• มีอาการน้ำตาลต่ำบ่อย",
      "• มีปฏิกิริยารุนแรงที่บริเวณฉีด",
      "• ระดับน้ำตาลไม่ลดลงหลังฉีดอินซูลิน",
    ],
    image: "/insulin3.jpg",
  },
};

const exerciseSubTopics = [
  { title: "ประโยชน์การออกกำลังกาย" },
  { title: "ประเภทการออกกำลังกาย" },
  { title: "ข้อพึงระวังก่อนการออกกำลังกาย" },
];

const exerciseContent = {
  "ประโยชน์การออกกำลังกาย": {
    title: "ประโยชน์การออกกำลังกาย",
    content: [
      "<b>ควบคุมระดับน้ำตาลในเลือด</b>",
      "การออกกำลังกายช่วยให้ร่างกายใช้ฮอร์โมนอินซูลินได้ดีขึ้น ทำให้ระดับน้ำตาลในเลือดลดลง",
      "",
      "<b>ลดความเสี่ยงของภาวะแทรกซ้อน</b>",
      "การออกกำลังกายอย่างสม่ำเสมอสามารถลดความเสี่ยงของ:",
      "• เบาหวานขณะตั้งครรภ์",
      "• ภาวะครรภ์เป็นพิษ", 
      "• น้ำหนักขึ้นมากเกินไป",
      "",
      "<b>ช่วยให้สุขภาพจิตดีขึ้น</b>",
      "การออกกำลังกายสามารถช่วยลดความเครียดและความวิตกกังวลที่อาจเกิดขึ้นระหว่างตั้งครรภ์ได้",
      "",
      "<b>ช่วยให้ร่างกายแข็งแรง</b>",
      "การออกกำลังกายช่วยเพิ่มความแข็งแรงของกล้ามเนื้อ และช่วยให้ร่างกายสามารถรับน้ำหนักที่เพิ่มขึ้นขณะตั้งครรภ์ได้",
      "",
      "<b>ช่วยให้ระบบต่างๆ ทำงานได้ดีขึ้น</b>",
      "การออกกำลังกายช่วยให้:",
      "• ระบบไหลเวียนโลหิตดีขึ้น",
      "• ระบบย่อยอาหารทำงานได้ดีขึ้น", 
      "• การขับถ่ายเป็นปกติ",
      "",
      "<b>ช่วยควบคุมน้ำหนัก</b>",
      "การออกกำลังกายช่วยเผาผลาญไขมันและช่วยควบคุมน้ำหนักให้อยู่ในเกณฑ์ที่เหมาะสมระหว่างตั้งครรภ์",
    ],
    image: "/yoga1.jpg",
  },
  "ประเภทการออกกำลังกาย": {
    title: "ประเภทการออกกำลังกาย",
    content: [
      "<b>หลักการสำคัญ:</b>",
      "ควรทำเฉพาะกล้ามเนื้อส่วนบนของร่างกาย โดยให้มีผลกระทบต่อกล้ามเนื้อส่วนท้องน้อยที่สุด",
      "",
      "<b>การเดิน</b>",
      "• เป็นกิจกรรมที่สามารถทำได้ง่ายและสะดวกทุกที่",
      "• ช่วยเพิ่มการเผาผลาญน้ำตาลในเลือดและเพิ่มความไวต่ออินซูลิน",
      "• ปลอดภัยสำหรับหญิงตั้งครรภ์ทุกคน",
      "",
      "<b>ว่ายน้ำ</b>",
      "• เป็นกิจกรรมที่การลอยตัวช่วยลดแรงกระแทกต่อข้อต่อ",
      "• ช่วยให้รู้สึกสบายตัวและผ่อนคลายกล้ามเนื้อ",
      "• ไม่ต้องรับน้ำหนักของร่างกาย",
      "",
      "<b>โยคะ</b>",
      "• ช่วยลดความเครียดและเพิ่มความยืดหยุ่นของร่างกาย",
      "• มีโยคะสำหรับหญิงตั้งครรภ์โดยเฉพาะ",
      "• ช่วยสอนเทคนิคการหายใจและการผ่อนคลาย",
    ],
    image: "/yoga2.png",
  },
  "ข้อพึงระวังก่อนการออกกำลังกาย": {
    title: "ข้อพึงระวังก่อนการออกกำลังกาย",
    content: [
      "<b>การเริ่มต้นออกกำลังกาย</b>",
      "• ควรเริ่มออกกำลังกายครั้งละน้อย ๆ ก่อน แล้วค่อยเพิ่มขึ้นอย่างช้า ๆ",
      "• ควรปรึกษาแพทย์ก่อนเริ่มออกกำลังกาย",
      "",
      "<b>ระดับความหนักของการออกกำลังกาย</b>",
      "• ห้ามออกกำลังกายหนักเกินไป",
      "• ขณะออกกำลังกายควรพูดคุยกับคนอื่นได้ โดยไม่เหนื่อยหอบ",
      "• ไม่ควรออกกำลังกายจนถึงจุดเหนื่อยล้า",
      "",
      "<b>สภาพแวดล้อมที่ควรหลีกเลี่ยง</b>",
      "• ห้ามออกกำลังกายในที่ร้อนอบอ้าวหรือชื้น",
      "• ห้ามออกกำลังกายในที่ที่มีมลภาวะ",
      "• ห้ามออกกำลังกายขณะมีไข้",
      "",
      "<b>การเคลื่อนไหวที่ควรหลีกเลี่ยง</b>",
      "• ห้ามออกกำลังกายแบบมีการกระตุกรุนแรง",
      "• ห้ามเปลี่ยนท่าอย่างรวดเร็ว",
      "• ห้ามเคลื่อนไหวของข้อมากเกินไป",
      "",
      "<b>ระยะเวลาการออกกำลังกาย</b>",
      "• ไม่ควรออกกำลังกายนานเกิน 30 นาที",
      "• เพื่อลดโอกาสเกิดภาวะระดับน้ำตาลในเลือดต่ำ (Hypoglycemia)",
      "• ลดโอกาสเกิดภาวะคีโตซิส (Ketosis)",
      "• ลดโอกาสเกิดภาวะอุณหภูมิกายสูง (Hyperthermia)",
      "",
      "<b>ท่าพักผ่อนที่แนะนำ</b>",
      "• ควรมีการพักการออกกำลังกายในท่านอนตะแคงซ้าย",
      "• งอเข่าเล็กน้อย ให้เลือดไหลเวียนได้ดีขึ้น",
      "",
      "<b>ข้อห้ามสำหรับไตรมาสที่ 2-3</b>",
      "• ภายหลังตั้งครรภ์ 4 เดือนไปแล้ว ไม่ควรออกกำลังกายในท่านอนหรือนอนหงายนาน ๆ",
      "• เพราะอาจเกิดภาวะความดันโลหิตต่ำขณะนอนหงายจากการกดทับเส้นเลือด",
      "• เลี่ยงการยืนนาน ๆ โดยเฉพาะในไตรมาสที่ 3",
      "",
      "<b>การเปลี่ยนท่า</b>",
      "• ขณะเปลี่ยนท่าต้องค่อย ๆ เปลี่ยน",
      "• เพื่อลดการเกิดภาวะความดันโลหิตต่ำขณะเปลี่ยนท่า",
      "",
      "<b>การรับประทานอาหาร</b>",
      "• ห้ามรับประทานอาหารอย่างน้อยครึ่งชั่วโมงก่อนออกกำลังกาย",
      "",
      "<b>อาการที่ต้องหยุดออกกำลังกายทันที</b>",
      "• ปวดต่าง ๆ",
      "• เลือดออกทางช่องคลอด",
      "• มดลูกหดรัดตัวผิดปกตินานเกิน 15 นาที หรือหดรัดตัวบ่อย",
      "• มึนงง เวียนศีรษะ ตาพร่ามัว",
      "• เป็นลม หายใจลำบาก หัวใจเต้นเร็วมาก",
      "• คลื่นไส้อาเจียน",
      "• มีน้ำคร่ำไหลออกมา",
      "• ทารกดิ้นน้อย",
      "• อาการบวมจากภาวะความดันโลหิตสูง",
      "• ปวดน่อง และขาบวม",
    ],
    image: "/yoga3.jpg",
  },
};

export default function Topics() {
  const [open, setOpen] = useState<number | null>(null);
  const { patientData } = usePatient();
  const [downloading, setDownloading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [foodModalPage, setFoodModalPage] = useState(0);
  const [activeInsulinSubTopic, setActiveInsulinSubTopic] = useState<string | null>(null);
  const [sugarLevel, setSugarLevel] = useState<string>('');
  const [sugarModalPage, setSugarModalPage] = useState<'input' | 'high' | 'low'>('input');
  const [activeExerciseSubTopic, setActiveExerciseSubTopic] = useState<string | null>(null);
  const bmiTopicIndex = topics.findIndex(t => t.title === 'bmi. แปลผล');
  const foodTopicIndex = topics.findIndex(t => t.title === 'อาหาร');
  const insulinTopicIndex = topics.findIndex(t => t.title === 'หญิงตั้งครรภ์ที่ฉีดอินซูลิน');
  const sugarTopicIndex = topics.findIndex(t => t.title === 'ค่าระดับน้ำตาล และวิธีการจัดการ');
  const exerciseTopicIndex = topics.findIndex(t => t.title === 'ออกกำลังกาย');
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
    setFoodModalPage(0);
    setActiveInsulinSubTopic(null);
    setSugarLevel('');
    setSugarModalPage('input');
    setActiveExerciseSubTopic(null);
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
            ) : open === insulinTopicIndex ? (
              <div className={styles.insulinModalContent}>
                {activeInsulinSubTopic ? (
                  // Detailed View
                  <div className={styles.insulinDetailContent}>
                    <h3 className={styles.modalTitle}>{insulinContent[activeInsulinSubTopic as keyof typeof insulinContent].title}</h3>
                    {insulinContent[activeInsulinSubTopic as keyof typeof insulinContent].content.map((text, i) => 
                      <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                    )}
                    <Image 
                      src={insulinContent[activeInsulinSubTopic as keyof typeof insulinContent].image}
                      alt={insulinContent[activeInsulinSubTopic as keyof typeof insulinContent].title}
                      width={300}
                      height={200}
                      className={styles.insulinDetailImage}
                    />
                  </div>
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
                      <input
                        type="number"
                        value={sugarLevel}
                        onChange={(e) => setSugarLevel(e.target.value)}
                        placeholder="ค่าระดับน้ำตาลในเลือด"
                        className={styles.sugarInput}
                      />
                      <span className={styles.sugarUnit}>mg/dL</span>
                    </div>
                    
                    {sugarLevel && (
                      <div className={styles.sugarResult}>
                        {parseFloat(sugarLevel) < 105 ? (
                          <div className={styles.sugarContent}>
                            <p className={styles.sugarResultTitle}>เบาหวานขณะตั้งครรภ์ชนิด A1 (GDM A1)</p>
                            <ul>
                              <li>เป็นเบาหวานที่ตรวจพบขณะตั้งครรภ์ และ <b>สามารถควบคุมได้ด้วยการปรับเปลี่ยนอาหาร</b> และการออกกำลังกาย</li>
                              <li><b>เป้าหมาย:</b>
                                <ul className={styles.nestedList}>
                                  <li>ระดับน้ำตาลก่อนอาหาร &lt; 105 mg/dL</li>
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
                                  <li>ระดับน้ำตาลก่อนอาหาร ≥ 105 mg/dL</li>
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
                      <p className={styles.sugarSubDetail}>คือภาวะที่ระดับน้ำตาลในเลือดสูงกว่าปกติ ซึ่งอาจเป็นอันตรายหากไม่ได้รับการควบคุม</p>
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
                      <p className={styles.sugarSubDetail}>คือภาวะที่ระดับน้ำตาลในเลือดต่ำกว่าปกติ ซึ่งอาจเป็นอันตรายเฉียบพลันได้</p>
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
                    {exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent].content.map((text, i) => 
                      <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                    )}
                    <Image 
                      src={exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent].image}
                      alt={exerciseContent[activeExerciseSubTopic as keyof typeof exerciseContent].title}
                      width={300}
                      height={200}
                      className={styles.exerciseDetailImage}
                    />
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
            ) : (
              <>
            <h3 className={styles.modalTitle}>{topics[open].title}</h3>
            <pre className={styles.modalContent}>{topics[open].details}</pre>
              </>
            )}

            <div className={styles.modalButtonRow}>
              {open === foodTopicIndex && activeFoodDetails && foodModalPage < activeFoodDetails.pages.length - 1 ? (
                <button onClick={() => setFoodModalPage(p => p + 1)} className={styles.button}>
                  ถัดไป
                </button>
              ) : null}
              {open === insulinTopicIndex && activeInsulinSubTopic ? (
                <button onClick={() => setActiveInsulinSubTopic(null)} className={styles.button}>
                  กลับสู่เมนู
                </button>
              ) : null}
              {open === sugarTopicIndex && sugarModalPage !== 'input' ? (
                <button onClick={() => setSugarModalPage('input')} className={styles.button}>
                  กลับสู่เมนู
                </button>
              ) : null}
              {open === exerciseTopicIndex && activeExerciseSubTopic ? (
                <button onClick={() => setActiveExerciseSubTopic(null)} className={styles.button}>
                  กลับสู่เมนู
                </button>
              ) : null}
              <button onClick={handleModalClose} className={styles.button}>
                กลับสู่หน้าหลัก
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 