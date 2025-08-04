import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Basic debug route started');
    
    // Test 1: Basic response
    console.log('✅ Basic route working');
    
    // Test 2: Environment variables
    console.log('🔍 Testing environment variables...');
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
    console.log('NEXTAUTH_SECRET exists:', hasNextAuthSecret);
    console.log('NEXTAUTH_URL exists:', hasNextAuthUrl);
    
    // Test 3: Try to import auth
    console.log('🔍 Testing auth import...');
    let authImportError = null;
    try {
      const { auth } = await import('@/src/config/auth/auth');
      console.log('✅ Auth import successful');
      
      // Test 4: Try to get session
      console.log('🔍 Testing session...');
      const session = await auth();
      console.log('Session result:', session ? 'Found' : 'Not found');
      if (session?.user) {
        console.log('User:', { email: session.user.email, role: session.user.role });
      }
    } catch (error) {
      authImportError = error instanceof Error ? error.message : 'Unknown auth error';
      console.error('❌ Auth import/session error:', authImportError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug route working',
      environment: {
        hasNextAuthSecret,
        hasNextAuthUrl,
        nodeEnv: process.env.NODE_ENV
      },
      authImportError,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug route error:', error);
    return NextResponse.json(
      { 
        error: 'Debug route failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      },
      { status: 500 }
    );
  }
}