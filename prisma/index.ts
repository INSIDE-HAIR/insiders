// import { PrismaClient } from '@prisma/client/edge' // Not supported yet until we have the serverless version of mongodb
import { PrismaClient } from '@prisma/client'
// import { withAccelerate } from '@prisma/extension-accelerate' //Not supported yet until we have the serverless version of mongodb


declare global {
  var prisma: PrismaClient 
}
export const dbMongo = global.prisma || new PrismaClient()
// export const dbMongo = global.prisma || new PrismaClient().$extends(withAccelerate()) //Not supported yet until we have the serverless version of mongodb
if (process.env.NODE_ENV === 'development') global.prisma = dbMongo