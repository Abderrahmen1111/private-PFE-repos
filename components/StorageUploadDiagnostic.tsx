'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DiagnosticResult {
  category: string;
  checks: {
    name: string;
    status: 'success' | 'error' | 'warning';
    message: string;
  }[];
}

export function StorageUploadDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: DiagnosticResult[] = [];

    // 1. Environment Variables
    const envChecks = [];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    envChecks.push({
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      status: supabaseUrl ? 'success' : 'error',
      message: supabaseUrl ? `Configured: ${supabaseUrl.substring(0, 30)}...` : 'NOT SET - This will cause uploads to fail'
    });

    envChecks.push({
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      status: supabaseKey ? 'success' : 'error',
      message: supabaseKey ? `Configured: ${supabaseKey.substring(0, 20)}...` : 'NOT SET - This will cause uploads to fail'
    });

    diagnostics.push({ category: '1. Environment Variables', checks: envChecks });

    // 2. Supabase Connection
    const connectionChecks = [];
    const supabase = createClient();

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      connectionChecks.push({
        name: 'User Authentication',
        status: user ? 'success' : 'warning',
        message: user ? `Logged in as: ${user.email}` : 'Not authenticated - Sign in to upload'
      });
    } catch (err: any) {
      connectionChecks.push({
        name: 'User Authentication',
        status: 'error',
        message: err.message
      });
    }

    diagnostics.push({ category: '2. Authentication', checks: connectionChecks });

    // 3. Storage Bucket Access
    const bucketChecks = [];

    try {
      const { data, error } = await supabase.storage.from('stories').list('', { limit: 1 });
      
      if (error) {
        bucketChecks.push({
          name: 'Stories Bucket Access',
          status: 'error',
          message: `Cannot access bucket: ${error.message}`
        });
      } else {
        bucketChecks.push({
          name: 'Stories Bucket Access',
          status: 'success',
          message: 'Bucket is accessible'
        });
      }
    } catch (err: any) {
      bucketChecks.push({
        name: 'Stories Bucket Access',
        status: 'error',
        message: `Connection error: ${err.message}`
      });
    }

    // 4. Test Upload
    const uploadChecks = [];
    try {
      const testFile = new File(['test'], `test-${Date.now()}.txt`, { type: 'text/plain' });
      const { data, error } = await supabase.storage
        .from('stories')
        .upload(`test/${testFile.name}`, testFile, { upsert: true });

      if (error) {
        uploadChecks.push({
          name: 'Test Upload',
          status: 'error',
          message: `Upload failed: ${error.message}`
        });
      } else {
        // Clean up
        await supabase.storage.from('stories').remove([`test/${testFile.name}`]);
        uploadChecks.push({
          name: 'Test Upload',
          status: 'success',
          message: 'Test file uploaded and deleted successfully'
        });
      }
    } catch (err: any) {
      uploadChecks.push({
        name: 'Test Upload',
        status: 'error',
        message: `Error during upload: ${err.message}`
      });
    }

    diagnostics.push({ category: '3. Storage Operations', checks: uploadChecks });

    // 5. Network/CORS
    const networkChecks = [];
    try {
      const response = await fetch(supabaseUrl + '/auth/v1/health', { method: 'GET' });
      networkChecks.push({
        name: 'Supabase API Connectivity',
        status: response.ok ? 'success' : 'warning',
        message: response.ok ? 'API is reachable' : `HTTP ${response.status}`
      });
    } catch (err: any) {
      networkChecks.push({
        name: 'Supabase API Connectivity',
        status: 'error',
        message: `Cannot reach API: ${err.message}`
      });
    }

    diagnostics.push({ category: '4. Network & CORS', checks: networkChecks });

    setResults(diagnostics);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Storage Upload Diagnostics</h2>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{result.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.checks.map((check, checkIdx) => (
                <div key={checkIdx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  <Badge variant={check.status === 'success' ? 'default' : check.status === 'error' ? 'destructive' : 'secondary'}>
                    {check.status}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{check.name}</p>
                    <p className="text-xs text-muted-foreground break-words">{check.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">Common Causes of Network Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>❌ Environment Variables Not Set</strong>
            <p className="text-xs text-muted-foreground">NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be in .env.local</p>
          </div>
          <div>
            <strong>❌ Stories Bucket Doesn't Exist</strong>
            <p className="text-xs text-muted-foreground">Create a bucket named "stories" in Supabase Storage</p>
          </div>
          <div>
            <strong>❌ RLS Policies Block Uploads</strong>
            <p className="text-xs text-muted-foreground">Check Row Level Security policies for the stories bucket</p>
          </div>
          <div>
            <strong>❌ User Not Authenticated</strong>
            <p className="text-xs text-muted-foreground">User must be logged in to upload files</p>
          </div>
          <div>
            <strong>❌ File Too Large</strong>
            <p className="text-xs text-muted-foreground">Stories are limited to 50MB max file size</p>
          </div>
          <div>
            <strong>❌ Network/Firewall Issues</strong>
            <p className="text-xs text-muted-foreground">Check your internet connection or firewall settings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
