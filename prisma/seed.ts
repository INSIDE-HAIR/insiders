import { PrismaClient, Template, PageStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear páginas de nivel 1
  const home = await prisma.dynamicPage.create({
    data: {
      title: "Home",
      content: JSON.stringify({ body: "Welcome to our website" }),
      slug: "home",
      fullPath: "home",
      lang: "en",
      level: 1,
      status: PageStatus.published,
      isEditable: false,
      author: "System",
      template: Template.custom,
    },
  });

  const about = await prisma.dynamicPage.create({
    data: {
      title: "About Us",
      content: JSON.stringify({ body: "Learn more about our company" }),
      slug: "about",
      fullPath: "about",
      lang: "en",
      level: 1,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  const services = await prisma.dynamicPage.create({
    data: {
      title: "Services",
      content: JSON.stringify({ body: "Our services" }),
      slug: "services",
      fullPath: "services",
      lang: "en",
      level: 1,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  // Crear páginas de nivel 2
  const team = await prisma.dynamicPage.create({
    data: {
      title: "Our Team",
      content: JSON.stringify({ body: "Meet our team" }),
      slug: "team",
      fullPath: "about/team",
      lang: "en",
      level: 2,
      parentId: about.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  const history = await prisma.dynamicPage.create({
    data: {
      title: "Our History",
      content: JSON.stringify({ body: "Our company's history" }),
      slug: "history",
      fullPath: "about/history",
      lang: "en",
      level: 2,
      parentId: about.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  const webDev = await prisma.dynamicPage.create({
    data: {
      title: "Web Development",
      content: JSON.stringify({ body: "Web development services" }),
      slug: "web-development",
      fullPath: "services/web-development",
      lang: "en",
      level: 2,
      parentId: services.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  const seo = await prisma.dynamicPage.create({
    data: {
      title: "SEO",
      content: JSON.stringify({ body: "SEO services" }),
      slug: "seo",
      fullPath: "services/seo",
      lang: "en",
      level: 2,
      parentId: services.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  // Crear páginas de nivel 3
  const frontend = await prisma.dynamicPage.create({
    data: {
      title: "Frontend Development",
      content: JSON.stringify({ body: "Our frontend development process" }),
      slug: "frontend",
      fullPath: "services/web-development/frontend",
      lang: "en",
      level: 3,
      parentId: webDev.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  const backend = await prisma.dynamicPage.create({
    data: {
      title: "Backend Development",
      content: JSON.stringify({ body: "Our backend development process" }),
      slug: "backend",
      fullPath: "services/web-development/backend",
      lang: "en",
      level: 3,
      parentId: webDev.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  const contentCreation = await prisma.dynamicPage.create({
    data: {
      title: "Content Creation",
      content: JSON.stringify({ body: "Our content creation services" }),
      slug: "content-creation",
      fullPath: "services/seo/content-creation",
      lang: "en",
      level: 3,
      parentId: seo.id,
      status: PageStatus.published,
      author: "Admin",
      template: Template.sideMenuAndTabs,
    },
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
