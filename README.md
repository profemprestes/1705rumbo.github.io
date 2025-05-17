# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

For Supabase authentication to work, you need to create a `.env.local` file in the root of your project and add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://vtxaefjmrcfnwpqsbsyi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eGFlZmptcmNmbndwcXNic3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTcwNDAsImV4cCI6MjA2MzAzMzA0MH0.JeukfKqEHDhPAm-qY5f6myYICJl2nG5rsNLCu8BG-hI
```

Replace the example values with your actual Supabase Project URL and Anon Key if they are different.
