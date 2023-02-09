import projectConfig from 'pkg/project.config.json' assert {type: 'json'}

interface IGetCommandDataOptions {
  hasValue?: boolean
  sortName?: string
}

export function parseCommand() {
  const commandData = {
    helpData: getCommandData('--help', {sortName: '-h'}),
    versionData: getCommandData('--version', {sortName: '-v'}),
    jsonData: getCommandData('--json', {hasValue: true}),
    filePathData: getCommandData('--file', {hasValue: true}),
    outputPathData: getCommandData('--output', {hasValue: true}),
    nameData: getCommandData('--name', {hasValue: true}),
  }
  const data = {
    jsonStr: '',
    outputPath: '',
    name: '',
  }

  const notInclude = !Object.entries(commandData).some(([_key, value]) => value.include)
  if (notInclude) {
    console.log('not match all params\n')
  }
  if (commandData.helpData.include || notInclude) {
    console.log(`convert json to typescript type.
version: ${projectConfig.version}

jsontype [--help | -h] [--version | -v] [--json <json string>] [--file <path>] [--name <name>] [--output <path>]`)
    Deno.exit(0)
  }

  if (commandData.versionData.include) {
    console.log(projectConfig.version)
    Deno.exit(0)
  }
  
  if (commandData.jsonData.include) {
    if (!commandData.jsonData.value) throw new Error('json cannot empty')
    data.jsonStr = commandData.jsonData.value
  } else if (commandData.filePathData.include) {
    if (!commandData.filePathData.value) throw new Error('file cannot empty')
    try {
      const content = Deno.readTextFileSync(commandData.filePathData.value)
      data.jsonStr = content
    } catch (error) {
      console.error(error)
      Deno.exit(0)
    }
  }

  if (commandData.outputPathData.include) {
    if (!commandData.outputPathData.value) throw new Error('output path cannot empty')
    data.outputPath = commandData.outputPathData.value
  }

  if (commandData.nameData.include) {
    if (!commandData.nameData.value) throw new Error('name cannot empty')
    data.name = commandData.nameData.value
  }

  return data
}
function getCommandData(commandStr: string, options?: IGetCommandDataOptions) {
  const fullIndex = Deno.args.indexOf(commandStr)
  const sortIndex = options?.sortName ? Deno.args.indexOf(options?.sortName) : -1
  const data = {
    index: -1,
    include: false,
    value: '',
  }
  
  if (fullIndex !== -1) {
    data.index = fullIndex
    data.include = true
  } else if (sortIndex !== -1) {
    data.index = sortIndex
    data.include = true
  }
  
  if (data.include && options?.hasValue) {
    data.value = Deno.args[data.index + 1] ?? ''
  }

  return data
}