import { SVGProps } from 'react'

const MessageCircleIcon = (props: SVGProps<SVGSVGElement>) => {
        return (
                <svg
                        {...props}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                >
                        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                </svg>
        )
}

export default MessageCircleIcon
