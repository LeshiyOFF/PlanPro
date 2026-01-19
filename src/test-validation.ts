/**
 * Simple test to verify Validation System functionality
 */

import { ValidationService } from '@/domain/validation';

// Test data
interface TestData {
  name: string;
  email: string;
  age: number;
}

// Test validation
export function testValidation(): boolean {
  try {
    // Register validation rules
    const rules = [
      {
        type: 'required' as const,
        params: { ruleName: 'nameRequired' }
      },
      {
        type: 'minLength' as const,
        params: { minLength: 3, ruleName: 'nameMinLength' }
      },
      {
        type: 'email' as const,
        params: { ruleName: 'emailValid' }
      },
      {
        type: 'positive' as const,
        params: { ruleName: 'agePositive' }
      }
    ];

    // Test valid data
    const validData: TestData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };

    const result = ValidationService.validateWithConfig('test', validData, rules);
    
    if (!result.isValid) {
      console.error('Valid data failed validation:', result.errors);
      return false;
    }

    // Test invalid data
    const invalidData: TestData = {
      name: '',
      email: 'invalid-email',
      age: -5
    };

    const invalidResult = ValidationService.validateWithConfig('test', invalidData, rules);
    
    if (invalidResult.isValid) {
      console.error('Invalid data passed validation');
      return false;
    }

    if (invalidResult.errors.length < 3) {
      console.error('Expected at least 3 errors, got:', invalidResult.errors.length);
      return false;
    }

    console.log('✅ Validation System working correctly');
    console.log('✅ Valid data passes validation');
    console.log('✅ Invalid data fails validation with', invalidResult.errors.length, 'errors');
    
    return true;
  } catch (error) {
    console.error('❌ Validation System test failed:', error);
    return false;
  }
}
