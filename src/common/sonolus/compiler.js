export function compile(script, level, entities) {
    const scriptClean = script
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .join(' ')

    const tree = parseTree(scriptClean)

    const nodes = parseNodes(tree)

    const scripts = generateScripts(nodes)

    resolveReferences(nodes)
    stripIdentifiers(nodes)

    const output = {
        ...level,
        scripts,
        nodes,
    }

    output.entities = [
        ...output.entities,
        ...entities
    ]

    return output
}

function stripIdentifiers(list) {
    list.forEach(node => delete node.identifiers)
}

function resolveReferences(list) {
    list.forEach(node => {
        if (node.args) {
            node.args = node.args.map(arg => {
                if (typeof arg === 'number') {
                    return arg
                } else {
                    const index = list.findIndex(node => node.identifiers.includes(arg))
                    if (index === -1) {
                        throw new Error(`Unidentified reference: ${arg}`)
                    }
                    return index
                }
            })
        }
    })
}

function generateScripts(list) {
    const scripts = []

    list.forEach((node, index) => {
        node.identifiers.forEach(identifier => {
            if (identifier.startsWith('#')) {
                const dot = identifier.indexOf('.')
                const scriptIndex = parseInt(identifier.substr(1, dot - 1))
                let callback = identifier.substr(dot + 1)
                let order = 0
                const at = callback.indexOf('@')
                if (at !== -1) {
                    order = parseInt(callback.substr(at + 1))
                    callback = callback.substr(0, at)
                }
                for (let i = 0; i <= scriptIndex; i++) {
                    if (!scripts[i]) {
                        scripts[i] = {}
                    }
                }
                scripts[scriptIndex][callback] = { index, order }
            }
        })
    })

    return scripts
}

function addReferenceIdentifiers(list, referenceIdentifiers) {
    referenceIdentifiers.forEach(referenceIdentifier => {
        const node = list.find(node => node.identifiers.includes(referenceIdentifier.reference))
        if (!node) {
            throw new Error(`Unidentified reference: ${referenceIdentifier.reference}`)
        }
        node.identifiers.push(referenceIdentifier.identifier)
    })
}

function pushToList(node, list, referenceIdentifiers) {
    if (node.reference) {
        if (node.identifier) {
            referenceIdentifiers.push({ identifier: node.identifier, reference: node.reference })
        }
        return node.reference
    } else {
        let index
        if (node.func) {
            index =
                list.push({
                    identifiers: [],
                    func: node.func,
                }) - 1
            list[index].args = node.args.map(node => pushToList(node, list))
        } else {
            index = list.findIndex(o => o.value === node.value)
            if (index === -1) {
                index =
                    list.push({
                        identifiers: [],
                        value: node.value,
                    }) - 1
            }
        }
        if (node.identifier) {
            list[index].identifiers.push(node.identifier)
        }
        return index
    }
}

function parseNodes(tree) {
    const nodes = []
    const referenceIdentifiers = []

    tree.forEach(node => pushToList(node, nodes, referenceIdentifiers))
    addReferenceIdentifiers(nodes, referenceIdentifiers)

    return nodes
}

function parseTree(data) {
    return splitExpressions(data).map(parseExpression)
}

function splitExpressions(data) {
    const expressions = []

    let current = ''
    let level = 0

    for (let i = 0; i <= data.length; i++) {
        let add = true
        const char = data.charAt(i)
        switch (char) {
            case '(':
                level++
                break
            case ')':
                level--
                break
            case '\r':
            case '\t':
            case ' ':
            case '':
                if (level === 0) {
                    add = false
                    if (current) {
                        expressions.push(current)
                    }
                    current = ''
                }
                break
            default:
                break
        }
        if (add) {
            current += char
        }
    }

    if (level !== 0) {
        throw new Error('Brackets mismatch')
    }

    return expressions
}

function parseExpression(expression) {
    const output = {}

    if (expression.includes('(')) {
        if (!expression.endsWith(')')) {
            throw new Error('Characters after function call')
        }
        const index = expression.indexOf('(')
        output.verb = expression.substr(0, index)
        output.args = parseTree(expression.substr(index + 1, expression.length - index - 2).trim())
    } else {
        output.verb = expression
    }

    if (output.verb.includes(':')) {
        const index = output.verb.indexOf(':')
        output.identifier = output.verb.substr(0, index)
        output.verb = output.verb.substr(index + 1)
    }

    if (output.args) {
        output.func = output.verb
    } else {
        const value = parseFloat(output.verb)
        if (isNaN(value)) {
            output.reference = output.verb
        } else {
            output.value = value
        }
    }

    delete output.verb

    return output
}