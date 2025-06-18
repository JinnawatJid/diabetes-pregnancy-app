"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePatient } from "../context/PatientContext";
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();
  const { setPatientData, savePatientData, loading, error } = usePatient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.username || form.username.length < 2 || form.username.length > 50) {
      return "กรุณากรอกชื่อผู้ใช้ (2-50 ตัวอักษร)";
    }
    const age = parseInt(form.age);
    if (isNaN(age) || age < 10 || age > 60) {
      return "อายุควรอยู่ระหว่าง 10-60 ปี";
    }
    const gestationalAge = parseInt(form.gestationalAge);
    if (isNaN(gestationalAge) || gestationalAge < 1 || gestationalAge > 42) {
      return "อายุครรภ์ควรอยู่ระหว่าง 1-42 สัปดาห์";
    }
    const weightBefore = parseFloat(form.weightBefore);
    if (isNaN(weightBefore) || weightBefore < 30 || weightBefore > 200) {
      return "น้ำหนักก่อนตั้งครรภ์ควรอยู่ระหว่าง 30-200 กก.";
    }
    const weightCurrent = parseFloat(form.weightCurrent);
    if (isNaN(weightCurrent) || weightCurrent < 30 || weightCurrent > 250) {
      return "น้ำหนักปัจจุบันควรอยู่ระหว่าง 30-250 กก.";
    }
    if (weightCurrent < weightBefore) {
      return "น้ำหนักปัจจุบันควรมากกว่าหรือเท่ากับน้ำหนักก่อนตั้งครรภ์";
    }
    const height = parseFloat(form.height);
    if (isNaN(height) || height < 120 || height > 220) {
      return "ส่วนสูงควรอยู่ระหว่าง 120-220 ซม.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const errorMsg = validateForm();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    
    // Prepare patient data with BMI
    const patientData = {
      ...form,
      bmi: bmi || undefined,
      bmiCategory: bmi ? getBMICategory(parseFloat(bmi)) : undefined
    };
    
    try {
      // Save to database
      await savePatientData(patientData);
      
      // Also set in context for immediate use
      setPatientData(patientData);
      
      router.push("/topics");
    } catch (err) {
      console.error('Failed to save patient data:', err);
      // You might want to show an error message to the user here
    }
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
    if (bmiValue < 18.5) return "ผอม";
    if (bmiValue < 23) return "ปกติ";
    if (bmiValue < 25) return "น้ำหนักเกิน";
    if (bmiValue < 30) return "อ้วนระดับ 1";
    return "อ้วนระดับ 2";
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

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
        
        {validationError && (
          <div className={styles.errorMessage}>
            {validationError}
          </div>
        )}
        {error && (
          <div className={styles.errorMessage}>
            เกิดข้อผิดพลาด: {error}
          </div>
        )}
      </form>
    </div>
  );
} 