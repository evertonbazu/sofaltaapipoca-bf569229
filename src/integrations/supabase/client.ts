
import { createClient } from '@supabase/supabase-js';

// API URLs do Supabase
const supabaseUrl = 'https://fdiojhklzxuqczxiinzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaW9qaGtsenh1cWN6eGlpbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTM3NDIsImV4cCI6MjA2MjMyOTc0Mn0.E-gaFIY8p9TeWyNfK697wDr19y49rWkUaMwFC3L5Lhc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
