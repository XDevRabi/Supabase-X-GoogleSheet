# Supabase Edge Function - Google Sheets Sync

This project contains a Supabase Edge Function that synchronizes data from a Supabase table to Google Sheets.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A Google Cloud Project with Sheets API enabled
- A Google Service Account with appropriate permissions

## Setup Instructions

1. Clone the repository & install the dependencies:
```bash
git clone https://github.com/XDevRabi/Supabase-X-GoogleSheet.git
cd Supabase-X-GoogleSheet
cd supabase/functions/syncToGoogleSheet/
npm install
```

2. Set up Google Sheets:
- Create a new Google Sheet
- Share it with your service account email
- Copy the spreadsheet ID from the URL
- Add your headers in the first row

3. Set up environment variables:
- First login to your Supabase account: `supabase login`
```bash
supabase secrets set GOOGLE_CREDENTIALS="<your-service-account-json>"
supabase secrets set SPREADSHEET_ID="your-spreadsheet-id"
supabase secrets set SHEET_NAME="your-sheet-id"
supabase secrets set SUPABASE_URL="<your-project-url>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
```

4. If any update needed on the function:
- Open `supabase/functions/syncToGoogleSheet/index.ts`

5. Deploy the function:
`supabase functions deploy syncToGoogleSheet`

## Usage
The function will sync data from your Supabase users_collection table to Google Sheets. The data will be written starting from row 2 (preserving headers) in the following order:

1. created_at
2. email
3. notes

To trigger the sync manually, make a POST request to your function URL:

```bash
curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/syncToGoogleSheet' \
--header 'Authorization: Bearer <anon-key>' \
--header 'Content-Type: application/json'
```
## Troubleshooting
1. Make sure Docker Desktop is running before deploying functions
2. Verify that the service account has editor access to the Google Sheet
3. Check if all environment variables are properly set using:
```bash
supabase secrets list
 ```

## Notes
- The function preserves the header row and existing styles in the Google Sheet
- Data is updated starting from row 2
- The function expects the Supabase table to have columns: notes, email, and created_at