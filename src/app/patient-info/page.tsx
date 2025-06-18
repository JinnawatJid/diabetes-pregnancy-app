"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

export default function PatientInfo() {
  const [form, setForm] = useState({
    username: "",
    age: "",
    gestationalAge: "",
    weightBefore: "",
    weightCurrent: "",
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

  // Calculate BMI when weightCurrent and height are available
  const bmi = useMemo(() => {
    const weight = parseFloat(form.weightCurrent);
    const height = parseFloat(form.height);

    if (weight && height && height > 0) {
      // Convert height from cm to meters and calculate BMI
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    return null;
  }, [form.weightCurrent, form.height]);

  // Get BMI category
  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return "น้ำหนักต่ำกว่าเกณฑ์";
    if (bmiValue < 25) return "น้ำหนักปกติ";
    if (bmiValue < 30) return "น้ำหนักเกิน";
    return "อ้วน";
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
          placeholder="อายุ (ปี)"
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
          name="weightCurrent"
          type="number"
          value={form.weightCurrent}
          onChange={handleChange}
          placeholder="น้ำหนักปัจจุบัน (กก.)"
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

        {/* BMI Display */}
        <div className={styles.bmiContainer}>
          <h3 className={styles.bmiTitle}>ดัชนีมวลกาย (BMI)</h3>
          <div className={styles.bmiValue}>
            {bmi ? (
              <>
                <span className={styles.bmiNumber}>{bmi}</span>
                <span className={styles.bmiCategory}>
                  {getBMICategory(parseFloat(bmi))}
                </span>
              </>
            ) : (
              <span className={styles.bmiPlaceholder}>
                กรุณากรอกน้ำหนักและส่วนสูงเพื่อคำนวณ BMI
              </span>
            )}
          </div>
        </div>

        <button type="submit" className={styles.button}>
          บันทึกข้อมูล
        </button>
      </form>
    </div>
  );
} 