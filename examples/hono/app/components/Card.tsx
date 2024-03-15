const Card = () => {
        return (
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="grid w-full aspect-video overflow-hidden rounded-t-lg">
                                <span className="object-cover w-full h-full rounded-md bg-muted" />
                        </div>
                        <div className="p-6 grid gap-4">
                                <h3 className="text-xl font-bold">
                                        Dancing Cubes
                                </h3>
                                <p className="text-sm leading-none">
                                        This is my first experiment with GLSL. I
                                        created a shader that makes these cubes
                                        dance to the music.
                                </p>
                        </div>
                </div>
        )
}

export default Card
