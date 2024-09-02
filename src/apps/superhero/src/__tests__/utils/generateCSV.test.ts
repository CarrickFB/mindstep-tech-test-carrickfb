import { generateCSV } from '../../../../../utils';

describe('generateCSV', () => {
  it('should generate CSV with basic key-value pairs', () => {
    const data = {
      name: 'John Doe',
      age: 30,
      email: 'john.doe@example.com',
    };

    const csv = generateCSV(data);

    expect(csv).toBe('name,age,email\n"John Doe",30,"john.doe@example.com"');
  });

  it('should handle string values that contain commas and double quotes', () => {
    const data = {
      name: 'John "Johnny" Doe',
      bio: 'Loves, coding and more',
    };

    const csv = generateCSV(data);

    expect(csv).toBe(
      'name,bio\n"John ""Johnny"" Doe","Loves, coding and more"',
    );
  });

  it('should handle numerical values correctly', () => {
    const data = {
      score: 98.5,
      level: 10,
    };

    const csv = generateCSV(data);

    expect(csv).toBe('score,level\n98.5,10');
  });

  it('should handle boolean values correctly', () => {
    const data = {
      isActive: true,
      isVerified: false,
    };

    const csv = generateCSV(data);

    expect(csv).toBe('isActive,isVerified\ntrue,false');
  });

  it('should handle null and undefined values', () => {
    const data = {
      name: 'Jane Doe',
      email: null,
      age: undefined,
    };

    const csv = generateCSV(data);

    expect(csv).toBe('name,email,age\n"Jane Doe",null,undefined');
  });

  it('should handle empty data object', () => {
    const data = {};

    const csv = generateCSV(data);

    expect(csv).toBe('\n');
  });

  it('should escape double quotes in string values', () => {
    const data = {
      quote: 'He said, "Hello, World!"',
    };

    const csv = generateCSV(data);

    expect(csv).toBe('quote\n"He said, ""Hello, World!"""');
  });

  it('should handle flattened JSON object for the user field', () => {
    const data = {
      id: 1,
      name: 'Jane Doe',
      user: {
        age: 28,
        email: 'jane.doe@example.com',
      },
      status: 'active',
    };

    const csv = generateCSV(data);

    // Expect the user object to be flattened and represented correctly in the CSV
    expect(csv).toBe(
      'id,name,user.age,user.email,status\n1,"Jane Doe",28,"jane.doe@example.com","active"',
    );
  });
});
