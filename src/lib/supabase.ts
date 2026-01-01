import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://itzecympleovransjovy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emVjeW1wbGVvdnJhbnNqb3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODE2NjAsImV4cCI6MjA4MjY1NzY2MH0.gbpHNxaI67Xi7bMYpyNXqbapcB9z32ckKDlyZXM9CnA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);