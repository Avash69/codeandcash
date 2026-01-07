import { createContext } from "react";

export const TaskContext = createContext();

// Initial dummy data
export const initialTasks = [
  {
    id: 1,
    title: "React Component Library Development",
    description: "Create a reusable component library with documentation",
    price: 2500,
    deadline: "2025-07-01",
    status: "open",
    applicants: 3,
    skills: ["React", "TypeScript", "Storybook"],
    company: "TechCorp Inc.",
    difficulty: "Medium",
    postedDate: "2025-06-15",
  },
  {
    id: 2,
    title: "E-commerce API Integration",
    description: "Integrate Stripe and PayPal payment gateways",
    price: 1800,
    deadline: "2025-07-15",
    status: "approved",
    applicants: 5,
    skills: ["Node.js", "Express", "Payment APIs"],
    company: "ShopRight LLC",
    difficulty: "Hard",
    postedDate: "2025-06-10",
    developerName: "Jane Smith",
    approvedAt: "2025-06-20",
  },
  {
    id: 3,
    title: "Mobile App UI Design",
    description: "Design user interface for a fitness tracking app",
    price: 1200,
    deadline: "2025-06-30",
    status: "submitted",
    applicants: 8,
    skills: ["UI/UX", "Figma", "Mobile Design"],
    company: "FitTech Solutions",
    difficulty: "Medium",
    postedDate: "2025-06-05",
    developerName: "Bob Johnson",
    approvedAt: "2025-06-12",
    submittedAt: "2025-06-28",
  },
  {
    id: 4,
    title: "Database Optimization",
    description: "Optimize PostgreSQL database performance",
    price: 2000,
    deadline: "2025-07-10",
    status: "open",
    applicants: 2,
    skills: ["PostgreSQL", "Database Design", "SQL"],
    company: "DataFlow Inc.",
    difficulty: "Hard",
    postedDate: "2025-06-18",
  },
];

export const initialSubmissions = [
  {
    id: 1,
    taskId: 3,
    userId: "user123",
    submissionDate: "2025-06-18",
    content: "Completed all requirements and added extra animations",
    status: "pending",
  },
];
