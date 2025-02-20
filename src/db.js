// src/db.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing environment variables. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file'
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
  const { data: channel, error: channelError } = await supabase
    .from('cricket_channels')
    .select('*')
    .eq('id', id)
    .single();

  if (channelError) throw channelError;

  // Fetch additional streams for this channel
  const { data: additionalStreams, error: streamsError } = await supabase
    .from('channel_streams')
    .select('*')
    .eq('channel_id', id);

  if (streamsError) throw streamsError;

  return {
    ...channel,
    additional_streams: additionalStreams || []
  };
}

module.exports = {
  getChannels,
  getChannel
};
