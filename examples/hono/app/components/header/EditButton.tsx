interface EditButtonProps {
        link: string
        children: string
}

const EditButton = (props: EditButtonProps) => {
        const { link, children } = props
        return (
                <button
                        className="
                                bg-white
                                text-blue-500
                                font-bold
                                py-2
                                px-4
                                rounded
                                shadow
                                hover:bg-blue-500
                                hover:text-white
                        "
                >
                        <a href={link}>{children}</a>
                </button>
        )
}

export default EditButton
