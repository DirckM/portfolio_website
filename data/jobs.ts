export interface Job {
    title: string;
    company: string;
    location?: string;
    type?: string;
    period: string;
    description: string;
    responsibilities: string[];
    image: {
      src: string;
      alt: string;
    };
  }
  
  export const jobs: Job[] = [
    {
      title: "Full-Stack Developer",
      company: "Freelance",
      location: "Remote",
      type: "Freelance",
      period: "Jan 2023 – Present",
      description:
        "Working on freelance projects focused on creating engaging and performant web experiences using React, Next.js, and Tailwind CSS. Prioritizing clean design, accessibility, and user-friendly interfaces.",
      responsibilities: [
        "Developed and deployed custom websites for clients and small businesses.",
        "Built reusable components and responsive layouts for dynamic projects.",
        "Handled both technical implementation and client communication.",
      ],
      image: {
        src: "/frontend.svg",
        alt: "Frontend Development",
      },
    },
    {
      title: "Course Assistant (IT Education)",
      company: "CTI Vaksteunpunt",
      location: "Utrecht, NL",
      period: "Sep 2022 – Jun 2023",
      description:
        "Supported IT courses for high school students by creating exercises, grading assignments, and helping students understand core computing concepts.",
      responsibilities: [
        "Designed and tested programming exercises and digital projects.",
        "Reviewed and graded student work, giving constructive feedback.",
        "Encouraged curiosity and problem-solving in technology learning.",
      ],
      image: {
        src: "/cti-vaksteunpunt.svg",
        alt: "CTI Vaksteunpunt",
      },
    },
    {
      title: "Founder & Owner",
      company: "MarineNet",
      period: "2020 – 2022",
      description:
        "Founded a small business selling handmade bracelets made from recycled fishing nets, promoting sustainability and craftsmanship through both online and local retail.",
      responsibilities: [
        "Designed and crafted eco-friendly bracelets using upcycled materials.",
        "Sold products through online platforms and local stores.",
        "Managed marketing, logistics, and client communication independently.",
      ],
      image: {
        src: "/marinenet.svg",
        alt: "Ocean Bracelets",
      },
    },
    {
      title: "Service Staff",
      company: "Restaurant Lekker aan de Haven",
      period: "2019 – 2021",
      description:
        "Worked in a small restaurant environment, providing customer service, taking orders, and coordinating with kitchen staff to ensure a great dining experience.",
      responsibilities: [
        "Developed strong communication and multitasking skills.",
        "Maintained a professional and friendly atmosphere for guests.",
        "Learned teamwork and responsibility under pressure.",
      ],
      image: {
        src: "/lekker_aan_de_haven.svg",
        alt: "Restaurant Lekker aan de Haven",
      },
    },
  ];
  