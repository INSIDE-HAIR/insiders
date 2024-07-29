// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear páginas de nivel 1
  const home = await prisma.dynamicPage.create({
    data: {
      title: "Home",
      content: JSON.stringify({ body: "Welcome to our website" }),
      slug: "home",
      fullPath: "home",
      lang: "en", // Idioma de la página
      level: 1,
      isPublished: true,
    },
  });

  const about = await prisma.dynamicPage.create({
    data: {
      title: "About Us",
      content: JSON.stringify({ body: "Learn more about our company" }),
      slug: "about",
      fullPath: "about",
      lang: "en", // Idioma de la página
      level: 1,
      isPublished: true,
    },
  });

  const services = await prisma.dynamicPage.create({
    data: {
      title: "Services",
      content: JSON.stringify({ body: "Our services" }),
      slug: "services",
      fullPath: "services",
      lang: "en", // Idioma de la página
      level: 1,
      isPublished: true,
    },
  });

  // Crear páginas de nivel 2
  const team = await prisma.dynamicPage.create({
    data: {
      title: "Our Team",
      content: JSON.stringify({ body: "Meet our team" }),
      slug: "team",
      fullPath: "about/team",
      lang: "en", // Idioma de la página
      level: 2,
      parentId: about.id,
      isPublished: true,
    },
  });

  const history = await prisma.dynamicPage.create({
    data: {
      title: "Our History",
      content: JSON.stringify({ body: "Our company's history" }),
      slug: "history",
      fullPath: "about/history",
      lang: "en", // Idioma de la página
      level: 2,
      parentId: about.id,
      isPublished: true,
    },
  });

  const webDev = await prisma.dynamicPage.create({
    data: {
      title: "Web Development",
      content: JSON.stringify({ body: "Web development services" }),
      slug: "web-development",
      fullPath: "services/web-development",
      lang: "en", // Idioma de la página
      level: 2,
      parentId: services.id,
      isPublished: true,
    },
  });

  const seo = await prisma.dynamicPage.create({
    data: {
      title: "SEO",
      content: JSON.stringify({ body: "SEO services" }),
      slug: "seo",
      fullPath: "services/seo",
      lang: "en", // Idioma de la página
      level: 2,
      parentId: services.id,
      isPublished: true,
    },
  });

  // Crear páginas de nivel 3
  const frontend = await prisma.dynamicPage.create({
    data: {
      title: "Frontend Development",
      content: JSON.stringify({ body: "Our frontend development process" }),
      slug: "frontend",
      fullPath: "services/web-development/frontend",
      lang: "en", // Idioma de la página
      level: 3,
      parentId: webDev.id,
      isPublished: true,
    },
  });

  const backend = await prisma.dynamicPage.create({
    data: {
      title: "Backend Development",
      content: JSON.stringify({ body: "Our backend development process" }),
      slug: "backend",
      fullPath: "services/web-development/backend",
      lang: "en", // Idioma de la página
      level: 3,
      parentId: webDev.id,
      isPublished: true,
    },
  });

  const contentCreation = await prisma.dynamicPage.create({
    data: {
      title: "Content Creation",
      content: JSON.stringify({ body: "Our content creation services" }),
      slug: "content-creation",
      fullPath: "services/seo/content-creation",
      lang: "en", // Idioma de la página
      level: 3,
      parentId: seo.id,
      isPublished: true,
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
