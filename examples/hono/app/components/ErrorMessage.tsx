interface ErrorMessageProps {
        children: string
}

const ErrorMessage = (props: ErrorMessageProps) => {
        const { children } = props
        return (
                <div className="absolute top-0 left-0 w-full h-full z-50 overflow-scroll backdrop-blur bg-transparent shadow-lg">
                        <div className="max-w-[852px] max-h-[1049px]">
                                <div className="mx-auto mt-8 mb-8 p-8 w-[800px] h-[555px] bg-[#181818] rounded-tl-lg rounded-tr-lg border-t-8 border-t-[#ff5555] font-mono text-left">
                                        {children.split('\n').map((line, i) => (
                                                <div
                                                        key={i}
                                                        style={{
                                                                color:
                                                                        i === 0
                                                                                ? '#ff5555'
                                                                                : '#ffffff',
                                                        }}
                                                        className="block w-full h-[62px] font-mono text-lg font-semibold leading-5 mb-4 overflow-x-scroll scrollbar-hide"
                                                >
                                                        {i === 0
                                                                ? 'Could not compile glsl'
                                                                : line}
                                                </div>
                                        ))}
                                </div>
                        </div>
                </div>
        )
}

export default ErrorMessage
