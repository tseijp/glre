import { on, q } from '../hooks'
import './style.css'
import { GearIcon, PersonIcon, RocketIcon, MagnifyingGlassIcon, GlobeIcon } from '@radix-ui/react-icons'

type Props = { params: any; children?: any }

const Chip = ({ c = '' as any, children = null as any }) => <div className={'badge ' + c}>{children}</div>

const Row = ({ c = '' as any, children = null as any }) => (
        <div className={'flex items-center gap-4 ' + c}>{children}</div>
)

const SP = ({ params, children }: Props) => {
        const hud = q(params, 'hud', '1') !== '0'
        const menu = q(params, 'menu') === '1'
        const modal = q(params, 'modal') === '1'
        const page = q(params, 'page', '1')
        return (
                <div className="fixed inset-0 text-white">
                        <div className="fixed inset-0 -z-10">{children}</div>
                        <div className={on(hud, 'pointer-events-none fixed inset-0')}>
                                <div className="fixed top-4 left-4 right-4 flex items-center justify-between">
                                        <Row>
                                                <Chip>
                                                        <PersonIcon className="inline mr-2" />
                                                        隊士
                                                </Chip>
                                                <Chip>
                                                        <RocketIcon className="inline mr-2" />
                                                        任務
                                                </Chip>
                                        </Row>
                                        <Row>
                                                <Chip>
                                                        <GlobeIcon className="inline mr-2" />
                                                        洛内
                                                </Chip>
                                                <Chip>丑刻</Chip>
                                                <Chip>両 12,480</Chip>
                                        </Row>
                                </div>
                                <div className="fixed bottom-4 right-4 w-48 h-48 glass" />
                                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-3 text-sm">
                                        <Row>
                                                <MagnifyingGlassIcon />
                                                <div>調べる</div>
                                                <div className="opacity-60">A</div>
                                        </Row>
                                </div>
                                <div className="fixed bottom-4 left-4 flex gap-3">
                                        <Chip>ログ</Chip>
                                        <Chip>道具</Chip>
                                </div>
                        </div>
                        <div className={on(menu, 'fixed inset-0 z-40 flex items-end p-4')}>
                                <div className="glass w-full rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                                <Row c="opacity-80">
                                                        <PersonIcon />
                                                        <div>坂本龍馬</div>
                                                </Row>
                                                <Row>
                                                        <Chip>武</Chip>
                                                        <Chip>術</Chip>
                                                        <Chip>装</Chip>
                                                        <Chip>隊</Chip>
                                                        <Chip>図</Chip>
                                                </Row>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                                <div className="glass p-4 h-48" />
                                                <div className="glass p-4 h-48" />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                                <Row c="opacity-80">
                                                        <GearIcon />
                                                        <div>設定</div>
                                                </Row>
                                                <Chip>Page {page}</Chip>
                                        </div>
                                </div>
                        </div>
                        <div className={on(modal, 'fixed inset-0 z-50 bg-black/40 grid place-items-center')}>
                                <div className="glass px-8 py-6 text-center">
                                        <div className="mb-2">確認</div>
                                        <div className="opacity-70">この操作を実行します</div>
                                </div>
                        </div>
                </div>
        )
}

export default SP
