import projectConfig from 'pkg/project.config.json' assert {type: 'json'}

export function parseCommand() {
  const helpData = getCommandData('--help', false)
  const jsonData = getCommandData('--json', true)
  const filePathData = getCommandData('--file', true)
  const data = {
    jsonStr: '',
  }

  if (helpData.include) {
    console.log(`convert json to typescript type.
  version: ${projectConfig.version}

  jsontype [--help] [--json <json string>] [--file <path>]
`)
    Deno.exit(0)
  }
  
  if (jsonData.include) {
    if (!jsonData.value) {
      throw new Error('json cannot be empty')
    }
    data.jsonStr = jsonData.value
  } else if (filePathData.include) {
    if (!filePathData.value) {
      throw new Error('file cannot be empty')
    }
    try {
      const content = Deno.readTextFileSync(filePathData.value)
      data.jsonStr = content
    } catch (error) {
      console.error(error)
      Deno.exit(0)
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