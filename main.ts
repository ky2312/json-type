import {parseCommand} from 'src/utils.ts'
import {convert} from 'src/ast.ts'

if (import.meta.main) {
  try {
    const data = parseCommand()
    console.log(convert(data.jsonStr))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
  }
}
