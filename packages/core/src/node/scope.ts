import { getId } from './utils'
import { conversion, node } from './node'
import type {
        FnLayout,
        NodeProps,
        NodeProxy,
        X,
        Constants,
        Int,
        StructFactory,
        StructNode,
        StructFields,
} from './types'

let scope: NodeProxy | null = null
let define: NodeProxy | null = null

const addToScope = (x: NodeProxy) => {
        if (!scope) return
        if (!scope.props.children) scope.props.children = []
        scope.props.children.push(x)
        if (x.type !== 'return' || !define) return
        const { props } = define
        if (!props.inferFrom) props.inferFrom = []
        props.inferFrom.push(x)
}

export function toVar<T extends StructFields>(x: StructNode<T>, id?: string): StructNode<T>
export function toVar<T extends Constants>(x: NodeProxy<T>, id?: string): NodeProxy<T> {
        if (!id) id = getId()
        const y = node<T>('variable', { id, inferFrom: [x] })
        const z = node<T>('declare', null, x as NodeProxy, y)
        addToScope(z)
        return y
}

export const assign = <T extends Constants>(x: NodeProxy<T>, isScatter = false, y: X<T>): X<T> => {
        const z = node(isScatter ? 'scatter' : 'assign', null, x, y)
        addToScope(z)
        return x
}

export const Return = <T extends Constants>(x: X<T>): NodeProxy<T> => {
        const y = node<T>('return', { inferFrom: [x] }, x)
        addToScope(y)
        return y
}

export const struct = <T extends StructFields>(fields: T, id = getId()): StructFactory<T> => {
        return (initialValues: StructFields = {}, instanceId = getId()) => {
                const x = node('variable', { id: instanceId, inferFrom: [id] })
                const y = node('struct', { id, fields, initialValues }, x)
                addToScope(y)
                return x as StructNode<T>
        }
}

const scoped = (x: NodeProxy, fun: () => NodeProxy | void, y = define) => {
        const [_scope, _define] = [scope, define]
        ;[scope, define] = [x, y]
        const z = fun()
        if (z) Return(z)
        ;[scope, define] = [_scope, _define]
}

export const If = (x: NodeProxy, fun: () => void) => {
        const y = node('scope')
        scoped(y, fun)
        const ifNode = node('if', null, x, y)
        addToScope(ifNode)
        const ret = () => ({
                ElseIf: (_x: X, _fun: () => void) => {
                        const _y = node('scope')
                        scoped(_y, _fun)
                        ifNode.props.children!.push(_x, _y)
                        return ret()
                },
                Else: (_fun: () => void) => {
                        const _x = node('scope')
                        scoped(_x, _fun)
                        ifNode.props.children!.push(_x)
                },
        })
        return ret()
}

export const Loop = (x: NodeProxy, fun: (params: { i: Int }) => void) => {
        const y = node('scope')
        const id = getId()
        scoped(y, () => fun({ i: node<'int'>('variable', { id, inferFrom: [conversion('int', 0)] }) }))
        const ret = node('loop', { id }, x, y)
        addToScope(ret)
        return ret
}

export const Switch = (x: NodeProxy) => {
        const switchNode = node('switch', null, x)
        addToScope(switchNode)
        const ret = () => ({
                Case: (...values: X[]) => {
                        return (fun: () => void) => {
                                const y = node('scope')
                                scoped(y, fun)
                                for (const _x of values) switchNode.props.children!.push(_x, y)
                                return ret()
                        }
                },
                Default: (fun: () => void) => {
                        const scope = node('scope')
                        scoped(scope, fun)
                        switchNode.props.children!.push(scope)
                },
        })
        return ret()
}

export function Fn<T extends NodeProxy | StructNode, Args extends any>(fun: (args: Args) => T, defaultId = getId()) {
        let layout: FnLayout
        const ret = (...args: any[]) => {
                const id = layout?.name || defaultId
                const x = node('scope')
                const paramVars: NodeProxy[] = []
                const paramDefs: NodeProps[] = []
                if (layout?.inputs) {
                        for (const input of layout.inputs) {
                                paramDefs.push({ id: input.name, inferFrom: [conversion(input.type)] })
                        }
                } else {
                        for (let i = 0; i < args.length; i++) {
                                paramDefs.push({ id: `p${i}`, inferFrom: [args[i]] })
                        }
                }
                for (const props of paramDefs) paramVars.push(node('variable', props))
                const y = node('define', { id, layout }, x, ...args)
                scoped(x, () => fun(paramVars as Args), y)
                return y
        }
        ret.setLayout = (_layout: FnLayout) => {
                layout = _layout
                return ret
        }
        return ret as unknown as Args extends readonly unknown[] ? (...args: Args) => T : never
}
