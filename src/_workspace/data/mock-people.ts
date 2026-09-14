export type MockPerson = {
  name: string;
  employeeCode: string;
  email: string;
  section: string;
  positionCode: string;
  position: string;
  department: string;
};

export const mockPeople: MockPerson[] = [
  {
    name: "Poodit Suwanprateep",
    employeeCode: "S00811",
    email: "poodit.suwanprateep@furukawaelectric.com",
    section: "SOFTWARE",
    positionCode: "S3",
    position: "SENIOR ENGINEER",
    department: "IT",
  },
  {
    name: "Alex Morgan",
    employeeCode: "S00112",
    email: "alex.morgan@example.com",
    section: "SOFTWARE",
    positionCode: "S2",
    position: "SYSTEM ANALYST",
    department: "IT",
  },
  {
    name: "Emma Wilson",
    employeeCode: "S00224",
    email: "emma.wilson@example.com",
    section: "SOFTWARE",
    positionCode: "M1",
    position: "IT MANAGER",
    department: "IT",
  },
  {
    name: "Liam Carter",
    employeeCode: "S00318",
    email: "liam.carter@example.com",
    section: "PRODUCTION",
    positionCode: "M2",
    position: "PRODUCTION MANAGER",
    department: "MANUFACTURING",
  },
  {
    name: "Sophia Turner",
    employeeCode: "S00407",
    email: "sophia.turner@example.com",
    section: "PRODUCT",
    positionCode: "M2",
    position: "PRODUCT MANAGER",
    department: "PRODUCT MANAGEMENT",
  },
  {
    name: "Noah Bennett",
    employeeCode: "S00519",
    email: "noah.bennett@example.com",
    section: "SOFTWARE",
    positionCode: "S2",
    position: "BUSINESS ANALYST",
    department: "IT",
  },
  {
    name: "Olivia Parker",
    employeeCode: "S00621",
    email: "olivia.parker@example.com",
    section: "SOFTWARE",
    positionCode: "S2",
    position: "SOFTWARE ENGINEER",
    department: "IT",
  },
  {
    name: "Ethan Collins",
    employeeCode: "S00732",
    email: "ethan.collins@example.com",
    section: "PRODUCTION",
    positionCode: "S3",
    position: "PRODUCTION ENGINEER",
    department: "MANUFACTURING",
  },
  {
    name: "Mia Roberts",
    employeeCode: "S00908",
    email: "mia.roberts@example.com",
    section: "SOFTWARE",
    positionCode: "S3",
    position: "SENIOR PROGRAMMER",
    department: "IT",
  },
  {
    name: "Lucas Gray",
    employeeCode: "S01045",
    email: "lucas.gray@example.com",
    section: "SOFTWARE",
    positionCode: "S2",
    position: "QA ENGINEER",
    department: "IT",
  },
];

export const mockPersonNames = mockPeople.map((person) => person.name);
export const mockCurrentUser = mockPeople[0];

export function findMockPerson(name?: string) {
  return mockPeople.find((person) => person.name === name);
}
