import { createClient } from './client'

/**
 * Diagnose Supabase storage configuration and connectivity
 */
export async function diagnoseStorage() {
  const supabase = createClient()
  const results: Record<string, any> = {}

  try {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    results.authenticated = !!user
    results.userId = user?.id

    // Check if we can list buckets
    try {
      const { data: buckets, error: bucketsError } = await (supabase.storage as any).listBuckets()
      results.canListBuckets = !bucketsError
      if (bucketsError) {
        results.bucketsError = bucketsError.message
      } else {
        results.availableBuckets = buckets?.map((b: any) => b.name) || []
      }
    } catch (err: any) {
      results.bucketsError = err.message
    }

    // Check if 'stories' bucket exists and is accessible
    try {
      const { data, error } = await supabase.storage
        .from('stories')
        .list('', { limit: 1 })
      
      results.storiesBucketAccessible = !error
      if (error) {
        results.storiesBucketError = error.message
      } else {
        results.storiesBucketInfo = 'Accessible'
      }
    } catch (err: any) {
      results.storiesBucketError = err.message
    }

    // Test a small file upload
    try {
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const testPath = `diagnostic-test-${Date.now()}.txt`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(testPath, testFile, { upsert: true })

      if (uploadError) {
        results.testUploadError = uploadError.message
        results.canTestUpload = false
      } else {
        results.canTestUpload = true
        results.testUploadPath = testPath
        
        // Clean up test file
        await supabase.storage.from('stories').remove([testPath])
      }
    } catch (err: any) {
      results.testUploadError = err.message
      results.canTestUpload = false
    }
  } catch (err: any) {
    results.criticalError = err.message
  }

  return results
}
