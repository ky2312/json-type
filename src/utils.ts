export function parseCommand() {
  const helpData = getCommandData('--help', false)
  const jsonData = getCommandData('--json', true)
  const data = {
    jsonStr: '',
  }

  if (helpData.include) {
    console.log(`convert json to typescript type.

    jsontype [--help] [--json <json string>]
`)
    Deno.exit(0)
  }
  
  if (jsonData.include) {
    if (jsonData.value) {
      data.jsonStr = jsonData.value
    } else {
      throw new Error('json can not be empty')
    }
  }

  return data
}
function getCommandData(commandStr: string, hasValue = true) {
  const index = Deno.args.indexOf(commandStr)
  const data = {
    index,
    include: index !== -1,
    value: '',
  }

  if (data.include && hasValue) {
    data.value = Deno.args[data.index + 1] ?? ''
  }

  return data
}