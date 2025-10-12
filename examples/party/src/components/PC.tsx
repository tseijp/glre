import { on } from '../hooks'
import { GearIcon, PersonIcon, GlobeIcon, HeartIcon, HomeIcon } from '@radix-ui/react-icons'
import type { Props } from './types'

const PC = ({ isHUD, isMenu, isModal, hasProfile, traditionalColors, culturalWorld, page = '1', children, onSignIn }: Props) => {
        return (
                <div className="fixed inset-0 text-black">
                        <div className="fixed inset-0 -z-10">{children}</div>
                        <div className={on(isHUD, 'pointer-events-none fixed inset-0')}>
                                <div className="fixed top-6 left-8 right-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                                {hasProfile ? (
                                                        <div className="glass rounded-xl">
                                                                <button className="flex items-center gap-2">
                                                                        <PersonIcon />
                                                                        文化修練者
                                                                </button>
                                                        </div>
                                                ) : (
                                                        <div className="glass rounded-xl cursor-pointer">
                                                                <button className="flex items-center gap-2" onClick={onSignIn}>
                                                                        <PersonIcon />
                                                                        参入
                                                                </button>
                                                        </div>
                                                )}
                                                <div className="glass rounded-xl">
                                                        <button className="flex items-center gap-2">
                                                                <HeartIcon />
                                                                伝統色
                                                        </button>
                                                </div>
                                                <div className="glass rounded-xl">
                                                        <button className="flex items-center gap-2">
                                                                <HomeIcon />
                                                                文化世界
                                                        </button>
                                                </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                                <div className="glass rounded-xl">
                                                        <button className="flex items-center gap-2">
                                                                <GlobeIcon />
                                                                {culturalWorld?.culturalNarrative || '文化世界'}
                                                        </button>
                                                </div>
                                                <div className="glass rounded-xl">
                                                        <button>{culturalWorld?.seasonalCycle || '春'}</button>
                                                </div>
                                                <div className="glass rounded-xl">
                                                        <button>伝統色 {traditionalColors?.length || 0}</button>
                                                </div>
                                        </div>
                                </div>
                                <div className="fixed bottom-8 left-8 w-80">
                                        <div className="glass rounded-2xl">
                                                <button className="text-sm opacity-80">文化学習</button>
                                                <button>伝統色の美学を体験する</button>
                                                <button className="text-sm opacity-70">季節の色彩で世界を創造</button>
                                        </div>
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
                                <div className="glass rounded-2xl overflow-hidden h-[480px]">
                                        <button className="flex items-center gap-2">
                                                <PersonIcon />
                                                文化修練
                                        </button>
                                        <button>伝統色</button>
                                        <button>季節感</button>
                                        <button>共同体</button>
                                        <button>世界地図</button>
                                        <button>学習記録</button>
                                </div>
                                <div className="grid gap-6">
                                        <div className="glass rounded-2xl p-6 h-56" />
                                        <div className="glass rounded-2xl p-6 h-56" />
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
