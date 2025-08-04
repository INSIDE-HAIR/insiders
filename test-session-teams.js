/**
 * Test script para verificar el mapping de teams
 */

const { getUserTeams, extractDomainFromEmail } = require('./src/lib/team-mapper.ts');

// Test cases
const testCases = [
  {
    name: "Admin user with insidesalons.com domain",
    groups: ['admin', 'management'],
    email: 'admin@insidesalons.com',
    role: 'ADMIN'
  },
  {
    name: "Creative user with groups",
    groups: ['creative', 'designers'],
    email: 'designer@externaldomain.com',
    role: 'EMPLOYEE'
  },
  {
    name: "Consultant user",
    groups: ['consulting', 'advisors'],
    email: 'consultant@company.com',
    role: 'EMPLOYEE'
  },
  {
    name: "Client user without groups",
    groups: [],
    email: 'client@example.com',
    role: 'CLIENT'
  }
];

console.log('🧪 Testing Team Mapper functionality...\n');

testCases.forEach(testCase => {
  const domain = extractDomainFromEmail(testCase.email);
  const teams = getUserTeams(testCase.groups, domain, testCase.role);
  
  console.log(`📋 ${testCase.name}:`);
  console.log(`   Email: ${testCase.email}`);
  console.log(`   Domain: ${domain}`);
  console.log(`   Groups: [${testCase.groups.join(', ')}]`);
  console.log(`   Role: ${testCase.role}`);
  console.log(`   Teams: [${teams.join(', ')}]`);
  console.log('');
});

console.log('✅ Team mapping test completed!');