interface SubmitButtonProps {
        children: React.ReactNode
        isDisabled?: boolean
}

const SubmitButton = (props: SubmitButtonProps) => {
        const { isDisabled, children = '+' } = props

        const handleCreate = async () => {
                const res = await fetch('/new', { method: 'POST' })
                if (res.status !== 201)
                        return console.log('Something went wrong')
        }

        return (
                <button
                        disabled={isDisabled}
                        className="
                                bg-blue-500 text-white
                                rounded-full p-4
                                shadow-lg
                        "
                        onClick={handleCreate}
                >
                        {children}
                </button>
        )
}

export default SubmitButton
