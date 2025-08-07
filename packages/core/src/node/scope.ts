import { getId } from './utils'
import { conversion, create } from './create'
import type {
        FnLayout,
        FnType,
        Constants as C,
        Int,
        NodeProps,
        Struct,
        StructFactory,
        StructFields,
        X,
        Y,
} from './types'

let scope: X | null = null
let define: X | null = null

export const addToScope = <T extends C>(x: X<T>) => {
        if (!scope) return
        if (!scope.props.children) scope.props.children = []
        scope.props.children.push(x)
        if (x.type !== 'return' || !define) return x
        const { props } = define
        if (!props.inferFrom) props.inferFrom = []
        props.inferFrom.push(x)
        return x
}

export function toVar<T extends StructFields>(x: Struct<T>, id?: string): Struct<T>
export function toVar<T extends C>(x: X<T>, id?: string): X<T> {
        if (!id) id = getId()
        const y = create<T>('variable', { id, inferFrom: [x] })
        const z = create<T>('declare', null, x as X, y)
        addToScope(z)
        return y
}

export const assign = <T extends C>(x: X<T>, isScatter = false, y: Y<T>): X<T> => {
        const z = create(isScatter ? 'scatter' : 'assign', null, x, y)
        addToScope(z)
        return x
}

export const Return = <T extends C>(x: Y<T>): Y<T> => {
        return addToScope(create<T>('return', { inferFrom: [x] }, x))
}

export const Break = (): Y => {
        return addToScope(create('break'))
}

export const Continue = (): Y => {
        return addToScope(create('continue'))
}

export const struct = <T extends StructFields>(fields: T, id = getId()): StructFactory<T> => {
        return (initialValues: StructFields = {}, instanceId = getId()) => {
                const x = create('variable', { id: instanceId, inferFrom: [id] })
                const y = create('struct', { id, fields, initialValues }, x)
                addToScope(y)
                return x as Struct<T>
        }
}

export const scoped = (x: X, fun: () => X | void, y = define) => {
        const [_scope, _define] = [scope, define]
        ;[scope, define] = [x, y]
        const z = fun()
        if (z) Return(z)
        ;[scope, define] = [_scope, _define]
}

export const If = (x: Y, fun: () => void) => {
        const y = create('scope')
        scoped(y, fun)
        const ifNode = create('if', null, x, y)
        addToScope(ifNode)
        const ret = () => ({
                ElseIf: (_x: X, _fun: () => void) => {
                        const _y = create('scope')
                        scoped(_y, _fun)
                        ifNode.props.children!.push(_x, _y)
                        return ret()
                },
                Else: (_fun: () => void) => {
                        const _x = create('scope')
                        scoped(_x, _fun)
                        ifNode.props.children!.push(_x)
                },
        })
        return ret()
}

export const Loop = (x: Y, fun: (params: { i: Int }) => void) => {
        const y = create('scope')
        const id = getId()
        scoped(y, () => fun({ i: create<'int'>('variable', { id, inferFrom: [conversion('int', 0)] }) }))
        const ret = create('loop', { id }, x, y)
        return addToScope(ret)
}

export const Switch = (x: Y) => {
        const switchNode = create('switch', null, x)
        addToScope(switchNode)
        const ret = () => ({
                Case: (...values: X[]) => {
                        return (fun: () => void) => {
                                const y = create('scope')
                                scoped(y, fun)
                                for (const _x of values) switchNode.props.children!.push(_x, y)
                                return ret()
                        }
                },
                Default: (fun: () => void) => {
                        const scope = create('scope')
                        scoped(scope, fun)
                        switchNode.props.children!.push(scope)
                },
        })
        return ret()
}

export function Fn<T extends X | Struct | void, Args extends any[]>(fun: (args: Args) => T, defaultId = getId()) {
        let layout: FnLayout
        const ret = (...args: any[]) => {
                const id = layout?.name || defaultId
                const x = create('scope')
                const paramVars: X[] = []
                const paramDefs: NodeProps[] = []
                for (let i = 0; i < args.length; i++) {
                        const input = layout?.inputs?.[i]
                        if (!input) paramDefs.push({ id: `p${i}`, inferFrom: [args[i]] })
                        else
                                paramDefs.push({
                                        id: input.name,
                                        inferFrom:
                                                input.type === 'auto' ? [args[i]] : [conversion(input.type, args[i])],
                                })
                }
                for (const props of paramDefs) paramVars.push(create('variable', props))
                const y = create('define', { id, layout }, x, ...args)
                scoped(x, () => fun(paramVars as Args) as any, y)
                return y
        }
        ret.getLayout = () => layout
        ret.setLayout = (_layout: FnLayout) => {
                layout = _layout
                return ret
        }
        return ret as unknown as Args extends readonly unknown[] ? FnType<T, Args> : never
}
