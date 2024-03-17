const ToolbarForm = () => {
        return (
                <form className="flex items-center gap-2">
                        <img
                                alt="Avatar"
                                className="rounded-full"
                                height="32"
                                src="/placeholder.svg"
                                style={{
                                        aspectRatio: '32/32',
                                        objectFit: 'cover',
                                }}
                                width="32"
                        />
                        <div className="flex-1">
                                <textarea
                                        className="min-h-[100px] text-sm"
                                        placeholder="What are your thoughts?"
                                />
                        </div>
                        <button>Post</button>
                </form>
        )
}

export default ToolbarForm
