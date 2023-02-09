import projectConfig from 'pkg/project.config.json' assert {type: 'json'}

export function parseCommand() {
  const helpData = getCommandData('--help', false)
  const jsonData = getCommandData('--json', true)
  const filePathData = getCommandData('--file', true)
  const outputPathData = getCommandData('--output', true)
  const nameData = getCommandData('--name', true)
  const data = {
    jsonStr: '',
    outputPath: '',
    name: '',
  }

  if (helpData.include) {
    console.log(`convert json to typescript type.
  version: ${projectConfig.version}

  jsontype [--help] [--json <json string>] [--file <path>] [--output <path>]
`)
    Deno.exit(0)
  }
  
  if (jsonData.include) {
    if (!jsonData.value) throw new Error('json cannot empty')
    data.jsonStr = jsonData.value
  } else if (filePathData.include) {
    if (!filePathData.value) throw new Error('file cannot empty')
    try {
      const content = Deno.readTextFileSync(filePathData.value)
      data.jsonStr = content
    } catch (error) {
      console.error(error)
      Deno.exit(0)
    }
  }

  if (outputPathData.include) {
    if (!outputPathData.value) throw new Error('output path cannot empty')
    data.outputPath = outputPathData.value
  }

  if (nameData.include) {
    if (!nameData.value) throw new Error('name cannot empty')
    data.name = nameData.value
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