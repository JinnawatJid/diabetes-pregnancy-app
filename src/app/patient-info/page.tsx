"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePatient } from "../context/PatientContext";
import styles from './page.module.css';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { LocalizationProvider, DatePicker as MUIDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function PatientInfo() {
  const [form, setForm] = useState({
    username: "",
    age: "",
    gestationalAge: "",
    weightBefore: "",
    height: "",
    date: "",
    sugarLevel: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();
  const { setPatientData, savePatientData, loading, error } = usePatient();
  const [step, setStep] = useState<'form' | 'summary' | 'questions'>('form');
  // State for questions
  const [questions, setQuestions] = useState({
    q1: '',
    q2: { answer: '', value: '' },
    q3: { answer: '', value: '' },
    q4type: '', // 'age' or 'date'
    q4: '', // value for age
    q4date: '', // value for date
    q5: '',
    q6: '',
  });
  // Add loading and error state for quiz save
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper to convert YYYY-MM-DD to DD-MM-YYYY (BE)
  const formatDateToDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const d = dayjs(isoDate);
    const beYear = d.year() + 543;
    return d.format('DD-MM-') + beYear;
  };
  // Helper to convert DD-MM-YYYY (BE) to YYYY-MM-DD
  const parseDisplayDateToISO = (displayDate: string) => {
    const [day, month, beYear] = displayDate.split('-');
    const year = parseInt(beYear) - 543;
    return `${year.toString().padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Helper to convert ISO to Date object
  const isoToDate = (iso: string) => iso ? new Date(iso) : null;
  // Helper to convert Date object to ISO string
  const dateToISO = (date: Date | null) => date ? dayjs(date).format('YYYY-MM-DD') : '';

  // Default date to today if empty
  const getDateValue = () => form.date ? isoToDate(form.date) : new Date();

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
    const height = parseFloat(form.height);
    if (isNaN(height) || height < 120 || height > 220) {
      return "ส่วนสูงควรอยู่ระหว่าง 120-220 ซม.";
    }
    if (!form.date) {
      return "กรุณากรอกวันที่";
    }
    if (!form.sugarLevel) {
      return "กรุณากรอกค่าระดับน้ำตาลของวันที่มาตรวจ";
    }
    return null;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept DD-MM-YYYY (BE) and convert to ISO
    const displayDate = e.target.value;
    setForm({ ...form, date: parseDisplayDateToISO(displayDate) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const errorMsg = validateForm();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    setStep('summary');
    // If you want to save to DB, do it after summary confirmation
    // await savePatientData(patientData);
  };

  // Calculate BMI when weightBefore and height are available
  const bmi = useMemo(() => {
    const weight = parseFloat(form.weightBefore);
    const height = parseFloat(form.height);

    if (weight && height && height > 0) {
      // Convert height from cm to meters and calculate BMI
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    return null;
  }, [form.weightBefore, form.height]);

  // Get BMI category
  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return "น้ำหนักต่ำกว่าเกณฑ์";
    if (bmiValue < 24.9) return "น้ำหนักตามเกณฑ์";
    if (bmiValue < 29.9) return "น้ำหนักสูงกว่าเกณฑ์";
    return "อ้วน";
  };

  const handleSummaryNext = () => setStep('questions');

  // Handler for saving all data at the end
  const handleQuizSave = async () => {
    setQuizLoading(true);
    setQuizError(null);
    // Prepare patient data for saving
    const patientData = {
      ...form,
      bmi: bmi || undefined,
      bmiCategory: bmi ? getBMICategory(parseFloat(bmi)) : undefined,
      date: form.date || null,
      sugar_level: form.sugarLevel || null,
      q1_screening: questions.q1,
      q2_gct: questions.q2.answer,
      q2_gct_value: questions.q2.value || null,
      q3_ogtt: questions.q3.answer,
      q3_ogtt_value: questions.q3.value || null,
      q4_type: questions.q4type,
      q4_gestational_age: questions.q4type === 'age' ? questions.q4 : null,
      q4_supplement_date: questions.q4type === 'date' ? questions.q4date : null,
      q5_diabetes_type: questions.q5,
      q6_treatment: questions.q6,
    };

    // Fix: Ensure 'date' and other fields are undefined instead of null to match PatientData type
    const fixedPatientData = {
      ...patientData,
      date: patientData.date ?? undefined,
      sugar_level: patientData.sugar_level ?? undefined,
      q2_gct_value: patientData.q2_gct_value ?? undefined,
      q3_ogtt_value: patientData.q3_ogtt_value ?? undefined,
      q4_gestational_age: patientData.q4_gestational_age ?? undefined,
      q4_supplement_date: patientData.q4_supplement_date ?? undefined,
    };

    try {
      await savePatientData(fixedPatientData);
      setPatientData(fixedPatientData);
      router.push('/topics');
    } catch (err: any) {
      setQuizError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {step === 'form' ? (
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
            name="height"
            type="number"
            value={form.height}
            onChange={handleChange}
            placeholder="ส่วนสูง (ซม.)"
            className={styles.input}
            required
          />
          {/* Date Field with MUI Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
            <MUIDatePicker
              label="วันที่มาตรวจ"
              value={form.date ? dayjs(form.date) : null}
              onChange={(newValue) => {
                setForm({ ...form, date: newValue ? newValue.format('YYYY-MM-DD') : '' });
              }}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  className: styles.input,
                  required: true,
                  name: 'date',
                  id: 'date-picker',
                  InputProps: {
                    className: styles.input,
                    sx: {
                      borderRadius: '8px',
                      fontFamily: 'Kanit, sans-serif',
                    },
                  },
                  sx: {
                    borderRadius: '8px',
                    fontFamily: 'Kanit, sans-serif',
                  },
                },
              }}
              views={['year', 'month', 'day']}
              minDate={dayjs().subtract(100, 'year')}
              maxDate={dayjs()}
              yearsPerRow={4}
            />
          </LocalizationProvider>
          {/* Sugar Level Field */}
          <input
            name="sugarLevel"
            type="number"
            value={form.sugarLevel}
            onChange={handleChange}
            placeholder="ค่าระดับน้ำตาลของวันที่มาตรวจ"
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
                  กรุณากรอกน้ำหนักก่อนตั้งครรภ์และส่วนสูงเพื่อคำนวณ BMI
                </span>
              )}
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'หน้าถัดไป'}
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
      ) : step === 'summary' ? (
        <div className={styles.form}>
          <h2 className={styles.title}>ข้อมูลคุณแม่</h2>
          <div className={styles.summaryField}><b>ชื่อผู้ใช้:</b> {form.username}</div>
          <div className={styles.summaryField}><b>อายุ:</b> {form.age} ปี</div>
          <div className={styles.summaryField}><b>อายุครรภ์:</b> {form.gestationalAge} สัปดาห์</div>
          <div className={styles.summaryField}><b>น้ำหนักก่อนตั้งครรภ์:</b> {form.weightBefore} กก.</div>
          <div className={styles.summaryField}><b>ส่วนสูง:</b> {form.height} ซม.</div>
          <div className={styles.summaryField}><b>วันที่มาตรวจ:</b> {form.date ? dayjs(form.date).format('DD-MM-') + (dayjs(form.date).year() + 543) : ''}</div>
          <div className={styles.summaryField}><b>ค่าระดับน้ำตาลของวันที่มาตรวจ:</b> {form.sugarLevel} mg/dL</div>
          <div className={styles.summaryField}><b>BMI:</b> {bmi} ({bmi ? getBMICategory(parseFloat(bmi)) : ''})</div>
          <button className={styles.button} style={{marginTop: '2rem'}} type="button" onClick={handleSummaryNext}>หน้าถัดไป</button>
        </div>
      ) : (
        <div className={styles.form}>
          <h2 className={styles.title}>ข้อมูลคุณแม่</h2>
          {/* Q1 */}
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>1. ท่านเคยได้รับการตรวจคัดกรองเบาหวานขณะตั้งครรภ์หรือไม่?</div>
            <div className={styles.radioGroup}>
              <label><input type="radio" name="q1" value="เคย" checked={questions.q1 === 'เคย'} onChange={() => setQuestions(q => ({ ...q, q1: 'เคย' }))} /> เคย</label>
              <label><input type="radio" name="q1" value="ไม่เคย" checked={questions.q1 === 'ไม่เคย'} onChange={() => setQuestions(q => ({ ...q, q1: 'ไม่เคย' }))} /> ไม่เคย</label>
            </div>
          </div>
          {/* Q2 */}
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>2. ท่านเคยทดสอบ Glucose Challenge Test (GCT) ด้วยกลูโคส 50 กรัม หรือไม่</div>
            <div className={styles.radioGroup}>
              <label><input type="radio" name="q2" value="เคย" checked={questions.q2.answer === 'เคย'} onChange={() => setQuestions(q => ({ ...q, q2: { ...q.q2, answer: 'เคย' } }))} /> เคย</label>
              <label><input type="radio" name="q2" value="ไม่เคย" checked={questions.q2.answer === 'ไม่เคย'} onChange={() => setQuestions(q => ({ ...q, q2: { ...q.q2, answer: 'ไม่เคย', value: '' } }))} /> ไม่เคย</label>
            </div>
            {questions.q2.answer === 'เคย' && (
              <input
                className={styles.input}
                type="text"
                placeholder="ระบุค่าน้ำตาล (mg/dL)"
                value={questions.q2.value}
                onChange={e => setQuestions(q => ({ ...q, q2: { ...q.q2, value: e.target.value } }))}
              />
            )}
          </div>
          {/* Q3 */}
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>3. ท่านเคยตรวจ OGTT ด้วยกลูโคส 100 กรัม หรือ 75 กรัม หรือไม่</div>
            <div className={styles.radioGroup}>
              <label><input type="radio" name="q3" value="เคย" checked={questions.q3.answer === 'เคย'} onChange={() => setQuestions(q => ({ ...q, q3: { ...q.q3, answer: 'เคย' } }))} /> เคย</label>
              <label><input type="radio" name="q3" value="ไม่เคย" checked={questions.q3.answer === 'ไม่เคย'} onChange={() => setQuestions(q => ({ ...q, q3: { ...q.q3, answer: 'ไม่เคย', value: '' } }))} /> ไม่เคย</label>
            </div>
            {questions.q3.answer === 'เคย' && (
              <input
                className={styles.input}
                type="text"
                placeholder="ระบุค่าน้ำตาล (mg/dL)"
                value={questions.q3.value}
                onChange={e => setQuestions(q => ({ ...q, q3: { ...q.q3, value: e.target.value } }))}
              />
            )}
          </div>
          {/* Q4 */}
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>4. ท่านเริ่มได้รับประทานยาเบาหวานอายุครรภ์เท่าไหร่/วันที่ครั้งแรกกที่รับประทานยา</div>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="q4type"
                  value="age"
                  checked={questions.q4type === 'age'}
                  onChange={() => setQuestions(q => ({ ...q, q4type: 'age', q4: '', q4date: '' }))}
                />
                อายุครรภ์ (สัปดาห์)
              </label>
              <label>
                <input
                  type="radio"
                  name="q4type"
                  value="date"
                  checked={questions.q4type === 'date'}
                  onChange={() => setQuestions(q => ({ ...q, q4type: 'date', q4: '', q4date: '' }))}
                />
                วันที่เริ่มรับประทานยา
              </label>
            </div>
            {questions.q4type === 'age' && (
              <input
                className={styles.input}
                type="number"
                placeholder="อายุครรภ์ (สัปดาห์)"
                value={questions.q4}
                onChange={e => setQuestions(q => ({ ...q, q4: e.target.value }))}
              />
            )}
            {questions.q4type === 'date' && (
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                <MUIDatePicker
                  label="วันที่เริ่มรับประทานยา"
                  value={questions.q4date ? dayjs(questions.q4date) : null}
                  onChange={newValue => setQuestions(q => ({ ...q, q4date: newValue ? newValue.format('YYYY-MM-DD') : '' }))}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      className: styles.input,
                      required: false,
                      name: 'q4date',
                    },
                  }}
                  views={['year', 'month', 'day']}
                  minDate={dayjs().subtract(100, 'year')}
                  maxDate={dayjs()}
                  yearsPerRow={4}
                />
              </LocalizationProvider>
            )}
          </div>
          {/* Q5 */}
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>5. หมอวินิจฉัยครั้งเเรกว่าท่านเป็นเบาหวานชนิดที่เท่าไหร่</div>
            <select
              className={styles.input}
              value={questions.q5}
              onChange={e => setQuestions(q => ({ ...q, q5: e.target.value }))}
            >
              <option value="">เลือกชนิดเบาหวาน</option>
              <option value="GDM">GDM (เบาหวานขณะตั้งครรภ์)</option>
              <option value="Type 1">Type 1 (เบาหวานชนิดที่ 1)</option>
              <option value="Type 2">Type 2 (เบาหวานชนิดที่ 2)</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          {/* Q6 */}
          <div className={styles.questionBlock}>
            <div className={styles.questionLabel}>6. ท่านรักษาด้วยการรับประทานยาหรือการฉีดอินซูลิน</div>
            <select
              className={styles.input}
              value={questions.q6}
              onChange={e => setQuestions(q => ({ ...q, q6: e.target.value }))}
            >
              <option value="">เลือกรูปแบบการรักษา</option>
              <option value="รับประทานยา">รับประทานยา</option>
              <option value="ฉีดอินซูลิน">ฉีดอินซูลิน</option>
              <option value="ทั้งสองอย่าง">ทั้งสองอย่าง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          <button className={styles.button} style={{marginTop: '2rem'}} type="button" onClick={handleQuizSave} disabled={quizLoading}>
            {quizLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
          {quizError && <div className={styles.errorMessage}>{quizError}</div>}
        </div>
      )}
    </div>
  );
} 