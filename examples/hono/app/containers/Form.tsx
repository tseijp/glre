export interface FormPorps {
        children: React.ReactNode
}

const Form = (props: FormPorps) => {
        const { children } = props
        return (
                <form
                        className="
                                flex
                                flex-col
                                bg-white
                                w-full
                                p-4
                                shadow
                        "
                >
                        {children}
                </form>
        )
}

export default Form
