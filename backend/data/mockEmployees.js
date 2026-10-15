/**
 * Mock Data Structure (In-Memory Array)
 * Meets exam requirement: At least 5 mock employees initialized
 */

let mockEmployees = [
  {
    id: "1",
    name: "John Doe",
    position: "Software Engineer",
    status: "Active",
    salary: 45000
  },
  {
    id: "2",
    name: "Jane Smith",
    position: "Senior Developer",
    status: "Active",
    salary: 65000
  },
  {
    id: "3",
    name: "Somchai Prasert",
    position: "HR Specialist",
    status: "On Leave",
    salary: 32000
  },
  {
    id: "4",
    name: "Suda Jaidee",
    position: "Junior Developer",
    status: "Active",
    salary: 25000
  },
  {
    id: "5",
    name: "Wichai Raksa",
    position: "Engineering Manager",
    status: "Active",
    salary: 85000
  },
  {
    id: "6",
    name: "Nattaporn Boonmee",
    position: "Intern Programmer",
    status: "Active",
    salary: 18000
  }
];

let nextId = 7;

module.exports = {
  getEmployees: () => mockEmployees,
  setEmployees: (newList) => {
    mockEmployees = newList;
  },
  getNextId: () => {
    const id = String(nextId);
    nextId += 1;
    return id;
  }
};
