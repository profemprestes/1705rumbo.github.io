
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

For Supabase authentication and other services to work, you need to create a `.env.local` file in the root of your project. You can use the `.env.local.example` file as a template.

Copy the content of `.env.local.example` into a new file named `.env.local` and replace the placeholder values with your actual credentials.

**Required for Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon key.

**For future AI integration (Genkit with Gemini):**
- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google AI Gemini API Key.

**For future Google Maps integration:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key.

Example `.env.local` content:
```
NEXT_PUBLIC_SUPABASE_URL=https://vtxaefjmrcfnwpqsbsyi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eGFlZmptcmNmbndwcXNic3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTcwNDAsImV4cCI6MjA2MzAzMzA0MH0.JeukfKqEHDhPAm-qY5f6myYICJl2nG5rsNLCu8BG-hI
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```
