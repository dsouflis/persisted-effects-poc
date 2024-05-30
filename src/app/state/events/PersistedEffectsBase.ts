import {from, Observable, OperatorFunction, Subscriber} from "rxjs";

const EMPTY_OBS = new Observable<never>((subscriber) => subscriber.complete());

const { isArray } = Array;

/**
 * Used in operators and functions that accept either a list of arguments, or an array of arguments
 * as a single argument.
 */
export function argsOrArgArray<T>(args: (T | T[])[]): T[] {
  return args.length === 1 && isArray(args[0]) ? args[0] : (args as T[]);
}

export class Reseter {
  subscribers : (()=>void)[] = [];
  subscribe(callback:()=>void) {
    this.subscribers.push(callback);
  }
  reset() {
    for (const subscriber of this.subscribers) {
      try {
        subscriber();
      } catch (e) {
        console.log(`Reset subscriber failed`, e);
      }
    }
  }
}

export abstract class PersistedEffectsBase {
  abstract persist(label: string, state: any): any;
  abstract state(label: string): any;
  abstract zeroState(label: string): any;

  persistedZipWith<A>(label: string, ...otherInputs: Observable<A>[]): OperatorFunction<A, A[]> {
    return (source) =>
      new Observable((subscriber) => {
        this.persistedZip(label, source, ...otherInputs).subscribe({
          next: (v) => subscriber.next(v),
          error: (e) => subscriber.error(e),
          complete: () => subscriber.complete(),
        });
      });
  }

  persistedZip<A>(label: string, ...args: [...Observable<A>[]]): Observable<A[]> {
    const sources = argsOrArgArray(args) as Observable<unknown>[];

    return sources.length
      ? new Observable<A[]>((destination) => {
        // A collection of buffers of values from each source.
        // Keyed by the same index with which the sources were passed in.
        // let buffers: unknown[][] = sources.map(() => []);
        let buffers: unknown[][] = this.state(label).buffers;

        // An array of flags of whether the sources have completed.
        // This is used to check to see if we should complete the result.
        // Keyed by the same index with which the sources were passed in.
        // let completed = sources.map(() => false);
        let completed: boolean[] = this.state(label).completed;

        // When everything is done, release the arrays above.
        destination.add(() => {
          buffers = completed = null!;
        });

        // Loop over our sources and subscribe to each one. The index `i` is
        // especially important here, because we use it in closures below to
        // access the related buffers and completion properties
        for (let sourceIndex = 0; !destination.closed && sourceIndex < sources.length; sourceIndex++) {
          if (completed[sourceIndex]) continue;

          from(sources[sourceIndex]).subscribe(
            ({
              next: (value) => {
                if(!buffers) return;
                buffers[sourceIndex].push(value);
                this.persist(label, {buffers, completed});

                // if every buffer has at least one value in it, then we
                // can shift out the oldest value from each buffer and emit
                // them as an array.
                if (buffers.every((buffer) => buffer.length)) {
                  const result: any = buffers.map((buffer) => buffer.shift()!);
                  // Emit the array. If theres' a result selector, use that.
                  destination.next(result);
                  // If any one of the sources is both complete and has an empty buffer
                  // then we complete the result. This is because we cannot possibly have
                  // any more values to zip together.
                  if (buffers.some((buffer, i) => !buffer.length && completed[i])) {
                    destination.complete();
                  }
                }
              },
              complete: () => {
                if (completed) {
                  completed[sourceIndex] = true;
                  this.persist(label, {buffers, completed});
                }

                if (destination.closed) return;

                // This source completed. Mark it as complete so we can check it later
                // if we have to.

                // But, if this complete source has nothing in its buffer, then we
                // can complete the result, because we can't possibly have any more
                // values from this to zip together with the other values.
                !buffers[sourceIndex].length && destination.complete();
              },
            })
          );
        }

        // When everything is done, release the arrays above.
        return () => {
          buffers = completed = null!;
        };
      })
      : EMPTY_OBS;
  }

  persistedScan<V, A>(label: string, accumulator: (acc: A, value: V, index: number) => A, reseter?: Reseter): OperatorFunction<V, A> {
    return (source) => new Observable((subscriber) => this.persistedScanInternals(label, accumulator, undefined as A, false, true, false, source, subscriber, reseter));
  }

  persistedScanInternals<V, A>(
    label: string,
    accumulator: (acc: A, value: V, index: number) => A,
    seed: A,
    hasSeed: boolean,
    emitOnNext: boolean,
    emitBeforeComplete: boolean,
    source: Observable<V>,
    destination: Subscriber<any>,
    reseter?: Reseter
  ) {
    // Whether we have state yet. This will only be
    // false before the first value arrives if we didn't get
    // a seed value.
    let hasState = hasSeed;
    // The state that we're tracking, starting with the seed,
    // if there is one, and then updated by the return value
    // from the accumulator on each emission.
    let state: any = seed;
    // An index to pass to the accumulator function.
    let index = 0;
    reseter?.subscribe(() => {
      state = this.zeroState(label) as A;
      console.log(`Inside scanInternals for ${label}, state is now ${state}`);
    });

    // Subscribe to our source. All errors and completions are passed through.
    source.subscribe(
      ({
        next: (value) => {
          // Always increment the index.
          const i = index++;

          if (!hasState) {
            state = this.state(label) as A;
            hasState = true;
          }
          // Set the state
          state = accumulator(state, value, i);

          this.persist(label, state);

          // Maybe send it to the consumer.
          emitOnNext && destination.next(state);
        },
        // If an onComplete was given, call it, otherwise
        // just pass through the complete notification to the consumer.
        complete: emitBeforeComplete
          ? () => {
            hasState && destination.next(state);
            destination.complete();
          }
          : undefined,
      })
    );
  }
}
