export const createCreation = (title: string, content: string) => {
        fetch('/new', {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        title,
                        content,
                }),
        })
}

export const updateCreation = (id: string, title: string, content: string) => {
        fetch(`/hono/${id}`, {
                method: 'PUT',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        title,
                        content,
                }),
        })
}

export const deleteCreation = (id: string) => {
        fetch(`/hono/${id}`, {
                method: 'DELETE',
        })
}
