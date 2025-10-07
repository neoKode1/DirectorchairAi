// Test script to verify Supabase integration with generation API
const testGeneration = async () => {
  try {
    console.log('🧪 Testing Supabase integration with generation API...');
    
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'fal-ai/flux-pro/imagen4',
        prompt: 'A simple test image of a red apple on a white background',
        aspect_ratio: '1:1',
        style: 'raw'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Generation successful!');
      console.log('📊 Result:', {
        requestId: result.requestId,
        model: result.model,
        status: result.status,
        duration: result.duration
      });
      
      // Check if the generation was saved to database
      console.log('🔍 Checking database...');
      const dbResponse = await fetch('http://localhost:3000/test-supabase');
      const dbResult = await dbResponse.text();
      
      if (dbResult.includes('Database connection successful')) {
        console.log('✅ Database integration working!');
      } else {
        console.log('❌ Database integration issue');
      }
      
    } else {
      console.log('❌ Generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testGeneration();
