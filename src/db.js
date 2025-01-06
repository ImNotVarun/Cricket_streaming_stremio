const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Add error checking for environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing environment variables. Please make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file'
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function getChannels() {
  const { data, error } = await supabase
    .from('cricket_channels')
    .select('*');
  
  if (error) throw error;
  return data;
}

async function getChannel(id) {
  const { data, error } = await supabase
    .from('cricket_channels')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

module.exports = {
  getChannels,
  getChannel
};