import fs from 'fs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

interface ImportPoem {
  title: string
  slug: string
  content: string
  imageLink: string
  hasTitle: boolean
  isDraft: boolean
  updatedAt: string
  createdAt: string
}

const main = async () => {
  console.log("running!")
  //await prisma.poem.deleteMany({})
  const files = fs.readdirSync('./exports')
  console.log("importing...")
  const poems: ImportPoem[] = []
  for (const fileName of files) {
    const file = fs.readFileSync(`./exports/${fileName}`)
    const importedPoem: ImportPoem = JSON.parse(file.toString())
    console.log(`importing poem: ${importedPoem.title}...`)
    poems.push(importedPoem)
  }
  const sortedPoems: ImportPoem[] = poems.sort((a: ImportPoem, b: ImportPoem) => {
    if(new Date(a.createdAt) > new Date(b.createdAt)) {
      return 1
    } else if(new Date(a.createdAt) < new Date(b.createdAt)) {
      return -1
    } else {
      return 0
    }
  })
  const swappedPoems: ImportPoem[] = sortedPoems.map((poem: ImportPoem, id) => {
    const swapId: number = sortedPoems.length - id - 1
    return {...poem, updatedAt: sortedPoems[swapId]!.updatedAt, createdAt: sortedPoems[swapId]!.createdAt}
  })
  const resortedPoems: ImportPoem[] = swappedPoems.sort((a: ImportPoem, b: ImportPoem) => {
    if(new Date(a.createdAt) > new Date(b.createdAt)) {
      return 1
    } else if(new Date(a.createdAt) < new Date(b.createdAt)) {
      return -1
    } else {
      return 0
    }
  })
  for(const importedPoem of resortedPoems) {
    await prisma.poem.create({ data: { title: importedPoem.title, slug: importedPoem.slug, content: importedPoem.content, hasTitle: importedPoem.hasTitle, imageLink: importedPoem.imageLink, createdAt: importedPoem.createdAt, updatedAt: importedPoem.updatedAt, isDraft: importedPoem.isDraft } })
  }
  console.log('finished!')
}

main()

export { }
