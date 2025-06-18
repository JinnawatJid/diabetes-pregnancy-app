"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface PatientData {
  username: string;
  age: string;
  gestationalAge: string;
  weightBefore: string;
  weightCurrent: string;
  height: string;
  bmi?: string;
  bmiCategory?: string;
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
      // Convert string values to numbers for database
      const dbData = {
        username: data.username,
        age: parseInt(data.age),
        gestational_age: parseInt(data.gestationalAge),
        weight_before: parseFloat(data.weightBefore),
        weight_current: parseFloat(data.weightCurrent),
        height: parseFloat(data.height),
        bmi: data.bmi ? parseFloat(data.bmi) : null,
        bmi_category: data.bmiCategory || null,
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
          weightCurrent: result.weight_current.toString(),
          height: result.height.toString(),
          bmi: result.bmi?.toString(),
          bmiCategory: result.bmi_category || undefined,
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