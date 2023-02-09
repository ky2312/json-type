import {ensureFile} from 'std/fs/mod.ts'
import {parseCommand} from 'src/utils.ts'
import {convert} from 'src/ast.ts'

if (import.meta.main) {
  try {
    const data = parseCommand()
    const jsonType = convert(data.jsonStr)

    await output(jsonType, data.outputPath)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
  }
}

async function output(content: string, path: string): Promise<void> {
  if (path) {
    await ensureFile(path)
    await Deno.writeTextFile(path, content)
  } else {
    console.log(content)
  }
}
