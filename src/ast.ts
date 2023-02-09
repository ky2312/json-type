import ts from 'npm:typescript'

export function convert(jsonStr: string, name = 'json'): string {
  verifyJsonStr(jsonStr)

  const content = `const ${name} = ${jsonStr}`
  const sourceFile = ts.createSourceFile('content', content, ts.ScriptTarget.ES2015)
  const firstStatement = sourceFile.statements[0]
  if (!ts.isVariableStatement(firstStatement)) throw new Error("first statement type error")
  const variableDeclaration = firstStatement.declarationList.declarations[0]

  let _name = name
  if (ts.isIdentifier(variableDeclaration.name)) {
    _name = variableDeclaration.name.escapedText.toString()
  }

  if (!variableDeclaration.initializer) throw new Error('variable cannot empty')

  let _typeNode: ts.Node | undefined = undefined
  if (ts.isObjectLiteralExpression(variableDeclaration.initializer)) {
    const propertySignatures: ts.PropertySignature[] = []
    for (const p of variableDeclaration.initializer.properties) {
      if (ts.isPropertyAssignment(p)) {
        propertySignatures.push(convertPropertyAssignmentToPropertySignature(p))
      }
    }
    _typeNode = createInterface(_name, propertySignatures)
  } else if (ts.isArrayLiteralExpression(variableDeclaration.initializer)) {
    const typeNode = convertExperssionToTypeNode(variableDeclaration.initializer)
    if (typeNode) {
      _typeNode = createTypeAlias(_name, typeNode)
    }
  }

  if (!_typeNode) throw new Error('type node cannot empty')
  return output(sourceFile, _typeNode)
}
function verifyJsonStr(jsonStr: string): void {
  if (!jsonStr) throw new Error('json cannot be empty')
  try {
    const json = JSON.parse(jsonStr)
    if (!(json && typeof json === 'object')) {
      throw new Error('json error')
    }
  } catch (_error) {
    throw new Error('json error')
  }
}
function convertPropertyAssignmentToPropertySignature(p: ts.PropertyAssignment): ts.PropertySignature {
  const type = convertExperssionToTypeNode(p.initializer)

  let name = ''
  if (ts.isIdentifier(p.name)) {
    name = p.name.escapedText.toString()
  } else if (ts.isStringLiteral(p.name)) {
    name = p.name.text
  }
  return ts.factory.createPropertySignature(
    undefined,
    name,
    undefined,
    type,
  )
}
function convertExperssionToTypeNode(expression: ts.Expression): ts.TypeNode | undefined {
  if (ts.isStringLiteral(expression)) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
  } else if (ts.isNumericLiteral(expression)) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
  } else if (
    ts.SyntaxKind.FalseKeyword === expression.kind
    || ts.SyntaxKind.TrueKeyword === expression.kind
  ) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
  } else if (ts.isIdentifier(expression)) {
    if (expression.escapedText === 'undefined') {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    }
  } else if (ts.SyntaxKind.NullKeyword === expression.kind) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
  } else if (ts.isObjectLiteralExpression(expression)) {
    const propertySignatures: ts.PropertySignature[] = []
    for (const p of expression.properties) {
      if (!ts.isPropertyAssignment(p)) continue
      propertySignatures.push(convertPropertyAssignmentToPropertySignature(p))
    }
    return ts.factory.createTypeLiteralNode(propertySignatures)
  } else if (ts.isArrayLiteralExpression(expression)) {
    const elements: ts.TypeNode[] = []
    for (const e of expression.elements) {
      const typeNode = convertExperssionToTypeNode(e)
      if (!typeNode) continue
      elements.push(typeNode)
    }

    const resultElements = removeRepetitionTypeNodes(elements)
    if (resultElements.length === 0) {
      return ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword))
    } else if (resultElements.length === 1 && resultElements[0].kind !== ts.SyntaxKind.TypeLiteral) {
      return ts.factory.createArrayTypeNode(elements[0])
    } else {
      return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Array'), [
        ts.factory.createUnionTypeNode(resultElements)
      ])
    }
  }
}
function removeRepetitionTypeNodes(typeNodes: ts.TypeNode[]): ts.TypeNode[] {
  const m = new Map()
  typeNodes.forEach(typeNode => {
    if (m.has(typeNode.kind)) return
    m.set(typeNode.kind, typeNode)
  })
  return Array.from(m).map(([_k, t]) => t)
}
function createInterface(name: string, propertySignatures: ts.PropertySignature[]) {
  return ts.factory.createInterfaceDeclaration(
    undefined,
    `I${createOutputId(name)}`,
    undefined,
    undefined,
    propertySignatures,
  )
}
function createTypeAlias<T extends ts.TypeNode>(name: string, typeNode: T) {
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    createOutputId(name),
    undefined,
    typeNode,
  )
}
function createOutputId(name: string) {
  return `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`
}
function output<T extends ts.Node>(sourceFile: ts.SourceFile, typeNode: T): string {
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed})
  return printer.printNode(ts.EmitHint.Unspecified, typeNode, sourceFile)
}