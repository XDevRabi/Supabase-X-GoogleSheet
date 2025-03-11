import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { google } from "npm:googleapis@105";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Load Google API Credentials
const GOOGLE_CREDENTIALS = JSON.parse(Deno.env.get("GOOGLE_CREDENTIALS") || "{}");
console.log("Credentials loaded:", !!GOOGLE_CREDENTIALS);

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = Deno.env.get('SPREADSHEET_ID') || '';
const SHEET_NAME = Deno.env.get('SHEET_NAME') || '';

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Invalid Request", { status: 400 });
    }

    try {
        // First, get the current values to determine where to start appending
        // const currentValues = await sheets.spreadsheets.values.get({
        //     spreadsheetId: SPREADSHEET_ID,
        //     range: `${SHEET_NAME}!A:D`,
        // });

        // Fetch data from users_collection
        const { data: users, error } = await supabase
            .from('users_collection')
            .select('notes, email, created_at');

        if (error) throw error;

        // Transform data for Google Sheets
        const values = users.map(user => [
            user.created_at,
            user.email,
            user.notes,
        ]);

        // Calculate the start row (skip header)
        const startRow = 2; // Assuming row 1 is header
        
        // Append to Google Sheets, starting after header
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${startRow}`,
            valueInputOption: "RAW",
            requestBody: { values },
        });

        console.log("Data fetched from Supabase:", users);
        console.log("Sheets API Response:", JSON.stringify(response.data));

        return new Response(JSON.stringify({ success: true, count: users.length }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
