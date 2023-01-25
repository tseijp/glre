export function makePromise(executor = (resolve) => resolve()) {
        let current = new Promise(executor);
        return {
                finally: (fun) => (current = current.finally(fun)),
                catch: (fun) => (current = current.catch(fun)),
                then: (fun) => (current = current.then(fun))
        };
}

export function makePriority(executor = (resolve) => resolve()) {
        const promise = makePromise(executor);
        const current = [];
        return {
                finally: (fun) => promise.finally(fun),
                catch: (fun) => promise.catch(fun),
                then: (fun, priority = -1) => {
                        current.push([priority, fun]);
                        current.sort(([i], [j]) => i - j);
                        promise.then(async () => await current.shift()[1]());
                        return promise;
                }
        }
}

export function makeSleep() {
        const sleep = {
                reject: () => void console.warn(`Error: not pending`),
                resolve: () => void console.warn(`Error: not pending`),
                pending: async (ms) =>
                        await new Promise((resolve, reject) => {
                                sleep.resolve = () => resolve(sleep);
                                sleep.reject = () => reject();
                                setTimeout(sleep.resolve, ms);
                        })
        };
        return sleep;
}


export function range (n=0) {
        const ret = new Array(n)
        for (;n--;) ret[n] = n
        return ret
}