"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Accept all possible fields for patient data
interface PatientData {
  username: string;
  age: string;
  gestationalAge: string;
  weightBefore: string;
  height: string;
  bmi?: string;
  bmiCategory?: string;
  date?: string;
  sugar_level?: string | number;
  q1_screening?: string;
  q2_gct?: string;
  q2_gct_value?: string | number;
  q3_ogtt?: string;
  q3_ogtt_value?: string | number;
  q4_type?: string;
  q4_gestational_age?: string | number;
  q4_supplement_date?: string;
  q5_diabetes_type?: string;
  q6_treatment?: string;
}

interface PatientContextType {
  patientData: PatientData | null;
  setPatientData: (data: PatientData) => void;
  savePatientData: (data: PatientData) => Promise<void>;
  loadPatientData: () => Promise<void>;
  clearPatientData: () => void;
  loading: boolean;
  error: string | null;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patientData, setPatientDataState] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPatientData = (data: PatientData) => {
    setPatientDataState(data);
  };

  const savePatientData = async (data: PatientData) => {
    setLoading(true);
    setError(null);
    try {
      // Map all fields, converting types as needed
      const dbData: any = {
        username: data.username,
        age: parseInt(data.age),
        gestational_age: parseInt(data.gestationalAge),
        weight_before: parseFloat(data.weightBefore),
        height: parseFloat(data.height),
        bmi: data.bmi ? parseFloat(data.bmi) : null,
        bmi_category: data.bmiCategory || null,
        date: data.date || null,
        sugar_level: data.sugar_level !== undefined && data.sugar_level !== '' ? parseFloat(data.sugar_level as string) : null,
        q1_screening: data.q1_screening || null,
        q2_gct: data.q2_gct || null,
        q2_gct_value: data.q2_gct_value !== undefined && data.q2_gct_value !== '' ? parseFloat(data.q2_gct_value as string) : null,
        q3_ogtt: data.q3_ogtt || null,
        q3_ogtt_value: data.q3_ogtt_value !== undefined && data.q3_ogtt_value !== '' ? parseFloat(data.q3_ogtt_value as string) : null,
        q4_type: data.q4_type || null,
        q4_gestational_age: data.q4_type === 'age' && data.q4_gestational_age !== undefined && data.q4_gestational_age !== '' ? parseInt(data.q4_gestational_age as string) : null,
        q4_supplement_date: data.q4_type === 'date' ? data.q4_supplement_date || null : null,
        q5_diabetes_type: data.q5_diabetes_type || null,
        q6_treatment: data.q6_treatment || null,
      };

      const { data: result, error: dbError } = await supabase
        .from('patients')
        .insert([dbData])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      setPatientDataState(data);
      console.log('Patient data saved successfully:', result);
    } catch (err) {
      console.error('Error saving patient data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save patient data');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll load the most recent patient data
      // In a real app, you'd filter by user ID
      const { data: result, error: dbError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw dbError;
      }

      if (result) {
        // Convert database format back to app format
        const appData: PatientData = {
          username: result.username,
          age: result.age.toString(),
          gestationalAge: result.gestational_age.toString(),
          weightBefore: result.weight_before.toString(),
          height: result.height.toString(),
          bmi: result.bmi?.toString(),
          bmiCategory: result.bmi_category || undefined,
          date: result.date || undefined,
          sugar_level: result.sugar_level !== undefined && result.sugar_level !== null ? result.sugar_level.toString() : '',
          q1_screening: result.q1_screening || undefined,
          q2_gct: result.q2_gct || undefined,
          q2_gct_value: result.q2_gct_value !== undefined && result.q2_gct_value !== null ? result.q2_gct_value.toString() : '',
          q3_ogtt: result.q3_ogtt || undefined,
          q3_ogtt_value: result.q3_ogtt_value !== undefined && result.q3_ogtt_value !== null ? result.q3_ogtt_value.toString() : '',
          q4_type: result.q4_type || undefined,
          q4_gestational_age: result.q4_gestational_age !== undefined && result.q4_gestational_age !== null ? result.q4_gestational_age.toString() : '',
          q4_supplement_date: result.q4_supplement_date || undefined,
          q5_diabetes_type: result.q5_diabetes_type || undefined,
          q6_treatment: result.q6_treatment || undefined,
        };
        
        setPatientDataState(appData);
      }
    } catch (err) {
      console.error('Error loading patient data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const clearPatientData = () => {
    setPatientDataState(null);
    setError(null);
  };

  // Load patient data on component mount
  useEffect(() => {
    loadPatientData();
  }, []);

  return (
    <PatientContext.Provider value={{ 
      patientData, 
      setPatientData, 
      savePatientData, 
      loadPatientData, 
      clearPatientData,
      loading,
      error
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
} 