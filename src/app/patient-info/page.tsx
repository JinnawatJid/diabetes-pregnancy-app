"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

export default function PatientInfo() {
  const [form, setForm] = useState({
    username: "",
    age: "",
    gestationalAge: "",
    weightBefore: "",
    height: "",
    illness: ""
  });
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/topics");
  };
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>ข้อมูลคุณแม่</h2>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="ชื่อผู้ใช้ (Username)"
          className={styles.input}
          required
        />
        <input
          name="age"
          type="number"
          value={form.age}
          onChange={handleChange}
          placeholder="อายุหญิงตั้งครรภ์ (ปี)"
          className={styles.input}
          required
        />
        <input
          name="gestationalAge"
          type="number"
          value={form.gestationalAge}
          onChange={handleChange}
          placeholder="อายุครรภ์ (สัปดาห์)"
          className={styles.input}
          required
        />
        <input
          name="weightBefore"
          type="number"
          value={form.weightBefore}
          onChange={handleChange}
          placeholder="น้ำหนักก่อนตั้งครรภ์ (กก.)"
          className={styles.input}
          required
        />
        <input
          name="height"
          type="number"
          value={form.height}
          onChange={handleChange}
          placeholder="ส่วนสูง (ซม.)"
          className={styles.input}
          required
        />
        <textarea
          name="illness"
          value={form.illness}
          onChange={handleChange}
          placeholder="โรคประจำตัว (ถ้ามี)"
          className={styles.textarea}
        />
        <button type="submit" className={styles.button}>
          บันทึกข้อมูล
        </button>
      </form>
    </div>
  );
} 