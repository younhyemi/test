// /config/supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://xfiidzobxjkigtioprfq.supabase.co",       //https://YOUR-PROJECT-ID.supabase.co
  "sb_publishable_GodTAMm_RuNJPbjAOTut4w_Dcz4SmFs"  //YOUR-PUBLIC-ANON-KEY
);