import { on } from '../hooks'
import { GearIcon, PersonIcon, RocketIcon, MagnifyingGlassIcon, GlobeIcon, BellIcon, HeartIcon, HomeIcon } from '@radix-ui/react-icons'

type Props = { 
        isHUD?: boolean
        isMenu?: boolean
        isModal?: boolean
        hasCulturalProfile?: boolean
        traditionalColors?: any[]
        culturalWorld?: any
        page?: string
        children?: any
        onSignIn?: () => void
}
const Box = ({ c = '' as any, children = null as any }) => <div className={'glass ' + c}>{children}</div>
const Item = ({ c = '' as any, children = null as any }) => <div className={'px-4 py-2 ' + c}>{children}</div>
const PC = ({ isHUD, isMenu, isModal, hasCulturalProfile, traditionalColors, culturalWorld, page = '1', children, onSignIn }: Props) => {
        return (
                <div className="fixed inset-0 text-white">
                        <div className="fixed inset-0 -z-10">{children}</div>
                        <div className={on(isHUD, 'pointer-events-none fixed inset-0')}>
                                <div className="fixed top-6 left-8 right-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                                {hasCulturalProfile ? (
                                                        <Box c="rounded-xl">
                                                                <Item c="flex items-center gap-2">
                                                                        <PersonIcon />
                                                                        文化修練者
                                                                </Item>
                                                        </Box>
                                                ) : (
                                                        <Box c="rounded-xl cursor-pointer" onClick={onSignIn}>
                                                                <Item c="flex items-center gap-2">
                                                                        <PersonIcon />
                                                                        参入
                                                                </Item>
                                                        </Box>
                                                )}
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <HeartIcon />
                                                                伝統色
                                                        </Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <HomeIcon />
                                                                文化世界
                                                        </Item>
                                                </Box>
                                        </div>
                                        <div className="flex items-center gap-4">
                                                <Box c="rounded-xl">
                                                        <Item c="flex items-center gap-2">
                                                                <GlobeIcon />
                                                                {culturalWorld?.culturalNarrative || '文化世界'}
                                                        </Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item>{culturalWorld?.seasonalCycle || '春'}</Item>
                                                </Box>
                                                <Box c="rounded-xl">
                                                        <Item>伝統色 {traditionalColors?.length || 0}</Item>
                                                </Box>
                                        </div>
                                </div>
                                <div className="fixed bottom-8 left-8 w-80">
                                        <Box c="rounded-2xl">
                                                <Item c="text-sm opacity-80">文化学習</Item>
                                                <Item>伝統色の美学を体験する</Item>
                                                <Item c="text-sm opacity-70">季節の色彩で世界を創造</Item>
                                        </Box>
                                </div>
                                <div className="fixed bottom-8 right-8 w-64 h-64 glass rounded-2xl" />
                                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-8 py-3 text-sm">
                                        <div className="flex items-center gap-3">
                                                <HeartIcon />
                                                <div>色彩を感じる</div>
                                                <div className="opacity-60">Space</div>
                                        </div>
                                </div>
                        </div>
                        <div className={on(isMenu, 'fixed inset-0 z-40 grid grid-cols-[280px_1fr] gap-6 p-8 items-start')}>
                                <Box c="rounded-2xl overflow-hidden h-[480px]">
                                        <Item c="flex items-center gap-2">
                                                <PersonIcon />
                                                文化修練
                                        </Item>
                                        <Item>伝統色</Item>
                                        <Item>季節感</Item>
                                        <Item>共同体</Item>
                                        <Item>世界地図</Item>
                                        <Item>学習記録</Item>
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
                        <div className={on(isModal, 'fixed inset-0 z-50 bg-black/40 grid place-items-center')}>
                                <div className="glass px-12 py-8 text-center">
                                        <div className="mb-2">確認</div>
                                        <div className="opacity-70">この操作を実行します</div>
                                </div>
                        </div>
                </div>
        )
}
export default PC
