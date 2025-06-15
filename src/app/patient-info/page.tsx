"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFF 0%, #FDE7F0 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 28, boxShadow: '0 6px 32px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', maxWidth: 390, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
        <h2 style={{ color: '#1E88E5', fontWeight: 700, fontSize: 22, marginBottom: 8, letterSpacing: 1 }}>ข้อมูลคุณแม่</h2>
        <input name="username" value={form.username} onChange={handleChange} placeholder="ชื่อผู้ใช้ (Username)" style={inputStyle} required />
        <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="อายุหญิงตั้งครรภ์ (ปี)" style={inputStyle} required />
        <input name="gestationalAge" type="number" value={form.gestationalAge} onChange={handleChange} placeholder="อายุครรภ์ (สัปดาห์)" style={inputStyle} required />
        <input name="weightBefore" type="number" value={form.weightBefore} onChange={handleChange} placeholder="น้ำหนักก่อนตั้งครรภ์ (กก.)" style={inputStyle} required />
        <input name="height" type="number" value={form.height} onChange={handleChange} placeholder="ส่วนสูง (ซม.)" style={inputStyle} required />
        <textarea name="illness" value={form.illness} onChange={handleChange} placeholder="โรคประจำตัว (ถ้ามี)" style={{...inputStyle, minHeight: 48, resize: 'vertical'}} />
        <button type="submit" style={buttonStyle}>บันทึกข้อมูล</button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  color: 'black',
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: 12,
  border: '1px solid #E0E0E0',
  fontSize: 16,
  fontFamily: 'inherit',
  background: '#F8FAFF',
  marginBottom: 0,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border 0.2s',
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1DE9B6 0%, #1E88E5 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '1rem 1.2rem',
  fontWeight: 600,
  fontSize: 16,
  textAlign: 'center',
  textDecoration: 'none',
  marginTop: 8,
  width: '100%',
  boxShadow: '0 2px 8px rgba(30,136,229,0.08)',
  letterSpacing: 0.5,
  transition: 'background 0.2s',
  cursor: 'pointer',
}; 