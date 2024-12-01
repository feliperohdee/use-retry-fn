const useRetryFn = async (fn, options = {}) => {
    let attempts = 1;
    let lastError = null;
    let maxAttempts = options.maxAttempts ?? 5;
    while (attempts <= maxAttempts) {
        let customError = null;
        let skipRetry = false;
        let delay = typeof options.delay === 'function'
            ? options.delay({
                attempts
            })
            : (options.delay ?? 100);
        try {
            const result = await Promise.race([
                fn({
                    attempts,
                    skipRetry: (err) => {
                        customError = err ?? null;
                        skipRetry = true;
                    }
                }),
                ...(options.timeout
                    ? [
                        new Promise((_, reject) => {
                            setTimeout(() => {
                                skipRetry = true;
                                reject(new Error('Operation timed out'));
                            }, options.timeout);
                        })
                    ]
                    : [])
            ]);
            return result;
        }
        catch (err) {
            lastError = err;
            attempts++;
            // call onError before any retry decision
            if (typeof options.onError === 'function') {
                options.onError({
                    attempts,
                    skipRetry: (err) => {
                        customError = err ?? null;
                        skipRetry = true;
                    }
                });
            }
            // if skipRetry was called, throws the custom err or the original one
            if (skipRetry) {
                throw customError || lastError;
            }
            await new Promise(resolve => {
                setTimeout(resolve, delay);
            });
        }
    }
    throw lastError;
};
export default useRetryFn;
