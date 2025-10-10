import { on, q } from '../hooks'
import './style.css'
import { GearIcon, PersonIcon, RocketIcon, MagnifyingGlassIcon, GlobeIcon, BellIcon } from '@radix-ui/react-icons'

type Props = { params: any; children?: any }

const Box = ({ c = '' as any, children = null as any }) => <div className={'glass ' + c}>{children}</div>

const Item = ({ c = '' as any, children = null as any }) => <div className={'px-4 py-2 ' + c}>{children}</div>

const PC = ({ params, children }: Props) => {
        const hud = q(params, 'hud', '1') !== '0'
        const menu = q(params, 'menu') === '1'
        const modal = q(params, 'modal') === '1'
        const page = q(params, 'page', '1')
        return (
                <div className="fixed inset-0 text-white">
                        <div className="fixed inset-0 -z-10">{children}</div>
                        <div className={on(hud, 'pointer-events-none fixed inset-0')}>
                                <div className="fixed top-6 left-8 right-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <PersonIcon />
                                                                隊士
                                                        </Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <RocketIcon />
                                                                任務
                                                        </Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <BellIcon />
                                                                達成
                                                        </Item>
                                                </Box>
                                        </div>
                                        <div className="flex items-center gap-4">
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <GlobeIcon />
                                                                洛内・大通り
                                                        </Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item>辰刻</Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item>両 124,800</Item>
                                                </Box>
                                        </div>
                                </div>
                                <div className="fixed bottom-8 left-8 w-80">
                                        <Box c="rounded-2xl">
                                                <Item c="text-sm opacity-80">目的</Item>
                                                <Item>京の異変を探る</Item>
                                                <Item c="text-sm opacity-70">ヒント: 酒場で噂を聞く</Item>
                                        </Box>
                                </div>
                                <div className="fixed bottom-8 right-8 w-64 h-64 glass rounded-2xl" />
                                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-8 py-3 text-sm">
                                        <div className="flex items-center gap-3">
                                                <MagnifyingGlassIcon />
                                                <div>調べる</div>
                                                <div className="opacity-60">E</div>
                                        </div>
                                </div>
                        </div>
                        <div
                                className={on(
                                        menu,
                                        'fixed inset-0 z-40 grid grid-cols-[280px_1fr] gap-6 p-8 items-start'
                                )}
                        >
                                <Box c="rounded-2xl overflow-hidden h-[480px]">
                                        <Item c="flex items-center gap-2">
                                                <PersonIcon />
                                                能力
                                        </Item>
                                        <Item>指南</Item>
                                        <Item>装備</Item>
                                        <Item>隊士</Item>
                                        <Item>地図</Item>
                                        <Item>記録</Item>
                                </Box>
                                <div className="grid gap-6">
                                        <Box c="rounded-2xl p-6 h-56" />
                                        <Box c="rounded-2xl p-6 h-56" />
                                        <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 opacity-80">
                                                        <GearIcon />
                                                        設定
                                                </div>
                                                <div className="badge">Page {page}</div>
                                        </div>
                                </div>
                        </div>
                        <div className={on(modal, 'fixed inset-0 z-50 bg-black/40 grid place-items-center')}>
                                <div className="glass px-12 py-8 text-center">
                                        <div className="mb-2">確認</div>
                                        <div className="opacity-70">この操作を実行します</div>
                                </div>
                        </div>
                </div>
        )
}

export default PC
