import {ensureFile} from 'std/fs/mod.ts'
import {error as errorlog} from 'colorlog'
import {parseCommand} from 'src/command.ts'
import {convert} from 'src/ast.ts'

if (import.meta.main) {
  try {
    const data = parseCommand()
    const jsonType = convert(data.jsonStr, data.name || undefined)

    await output(jsonType, data.outputPath)
  } catch (error) {
    if (error instanceof Error) {
      console.error(errorlog(error.message))
    } else {
      console.error(errorlog(error))
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