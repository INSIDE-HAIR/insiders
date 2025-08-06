/**
 * Utility for testing API key functionality with Meet endpoints
 */

interface ApiTestConfig {
  baseUrl?: string;
  apiKey: string;
}

interface ApiTestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
  endpoint: string;
  method: string;
  timestamp: string;
}

export class MeetApiTester {
  private config: ApiTestConfig;

  constructor(config: ApiTestConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000',
      ...config
    };
  }

  /**
   * Test API key authentication
   */
  async testAuthentication(): Promise<ApiTestResult> {
    return this.makeRequest('GET', '/api/meet/test');
  }

  /**
   * Test Meet spaces endpoint
   */
  async testSpacesList(): Promise<ApiTestResult> {
    return this.makeRequest('GET', '/api/meet/spaces');
  }

  /**
   * Test creating a Meet space
   */
  async testCreateSpace(spaceConfig?: any): Promise<ApiTestResult> {
    const defaultConfig = {
      accessType: 'TRUSTED',
      enableRecording: true,
      enableTranscription: false,
      enableSmartNotes: false,
      attendanceReport: true,
      moderationMode: 'OFF',
      defaultJoinAsViewer: false
    };

    return this.makeRequest('POST', '/api/meet/spaces', spaceConfig || defaultConfig);
  }

  /**
   * Test Meet conferences endpoint
   */
  async testConferencesList(): Promise<ApiTestResult> {
    return this.makeRequest('GET', '/api/meet/conferences');
  }

  /**
   * Test Meet analytics endpoint
   */
  async testAnalytics(): Promise<ApiTestResult> {
    return this.makeRequest('GET', '/api/meet/analytics');
  }

  /**
   * Test all Meet endpoints
   */
  async testAllEndpoints(): Promise<ApiTestResult[]> {
    console.log('🧪 Testing Meet API with key:', this.config.apiKey.substring(0, 20) + '...');
    
    const tests = [
      { name: 'Authentication', test: () => this.testAuthentication() },
      { name: 'Spaces List', test: () => this.testSpacesList() },
      { name: 'Conferences List', test: () => this.testConferencesList() },
      { name: 'Analytics', test: () => this.testAnalytics() },
      { name: 'Create Space', test: () => this.testCreateSpace() }
    ];

    const results: ApiTestResult[] = [];
    
    for (const { name, test } of tests) {
      console.log(`\n📋 Testing ${name}...`);
      try {
        const result = await test();
        results.push(result);
        
        if (result.success) {
          console.log(`✅ ${name}: SUCCESS (${result.status})`);
        } else {
          console.log(`❌ ${name}: FAILED (${result.status}) - ${result.error}`);
        }
        
        // Add delay between requests to respect rate limits
        await this.delay(1000);
        
      } catch (error: any) {
        console.log(`💥 ${name}: ERROR - ${error.message}`);
        results.push({
          success: false,
          status: 0,
          error: error.message,
          endpoint: 'unknown',
          method: 'unknown',
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Generate test report
   */
  generateReport(results: ApiTestResult[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MEET API TEST REPORT');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n📈 Overall Success Rate: ${successful}/${total} (${Math.round(successful/total * 100)}%)`);
    
    console.log('\n📋 Detailed Results:');
    results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.method} ${result.endpoint} - ${status} (${result.status})`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.data?.permissions) {
        console.log(`   Permissions: ${Object.entries(result.data.permissions)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(', ')}`);
      }
    });

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Make HTTP request with API key
   */
  public async makeRequest(method: string, endpoint: string, body?: any): Promise<ApiTestResult> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timestamp = new Date().toISOString();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'MeetApiTester/1.0'
        }
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: data,
        error: response.ok ? undefined : data.error || data.message,
        endpoint,
        method,
        timestamp
      };

    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: `Network error: ${error.message}`,
        endpoint,
        method,
        timestamp
      };
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Quick test function for console usage
 */
export async function testMeetApi(apiKey: string, baseUrl?: string): Promise<void> {
  const tester = new MeetApiTester({ apiKey, baseUrl });
  const results = await tester.testAllEndpoints();
  tester.generateReport(results);
}

/**
 * Test individual endpoint
 */
export async function testEndpoint(
  apiKey: string, 
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  baseUrl?: string
): Promise<ApiTestResult> {
  const tester = new MeetApiTester({ apiKey, baseUrl });
  return tester.makeRequest(method, endpoint, body);
}