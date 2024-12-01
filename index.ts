type UseRetryFnContext = {
	attempts: number;
	skipRetry: (err?: Error) => void;
};

type UseRetryFnOptions = {
	delay?: number | (({ attempts }: { attempts: number }) => number);
	onError?: (context: UseRetryFnContext) => void;
	maxAttempts?: number;
	timeout?: number;
};

type UseRetryFn<T> = (context: UseRetryFnContext) => Promise<T> | T;

const useRetryFn = async <T>(fn: UseRetryFn<T>, options: UseRetryFnOptions = {}): Promise<T> => {
	let attempts = 1;
	let lastError: Error | null = null;
	let maxAttempts = options.maxAttempts ?? 5;

	while (attempts <= maxAttempts) {
		let customError: Error | null = null;
		let skipRetry = false;
		let delay: number =
			typeof options.delay === 'function'
				? options.delay({
						attempts
					})
				: (options.delay ?? 100);

		try {
			const result = await Promise.race([
				fn({
					attempts,
					skipRetry: (err?: Error) => {
						customError = err ?? null;
						skipRetry = true;
					}
				}),
				...(options.timeout
					? [
							new Promise<never>((_, reject) => {
								setTimeout(() => {
									skipRetry = true;
									reject(new Error('Operation timed out'));
								}, options.timeout);
							})
						]
					: [])
			]);

			return result;
		} catch (err) {
			lastError = err as Error;
			attempts++;

			// call onError before any retry decision
			if (typeof options.onError === 'function') {
				options.onError({
					attempts,
					skipRetry: (err?: Error) => {
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

export type { UseRetryFn, UseRetryFnContext, UseRetryFnOptions };
export default useRetryFn;
