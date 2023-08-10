import type {BuiltIns, HasMultipleCallSignatures} from './internal';
import type {Writable} from './writable.js';

/**
Create a deeply mutable version of an `object`/`ReadonlyMap`/`ReadonlySet`/`ReadonlyArray` type. The inverse of `ReadonlyDeep<T>`. Use `Writable<T>` if you only need one level deep.

This can be used to [store and mutate options within a class](https://github.com/sindresorhus/pageres/blob/4a5d05fca19a5fbd2f53842cbf3eb7b1b63bddd2/source/index.ts#L72), [edit `readonly` objects within tests](https://stackoverflow.com/questions/50703834), [construct a `readonly` object within a function](https://github.com/Microsoft/TypeScript/issues/24509), or to define a single model where the only thing that changes is whether or not some of the keys are writable.

@example
```
import type {WritableDeep} from 'type-fest';

type Foo = {
	readonly a: number;
	readonly b: readonly string[]; // To show that mutability is deeply affected.
	readonly c: boolean;
};

const writableDeepFoo: WritableDeep<Foo> = {a: 1, b: ['2'], c: true};
writableDeepFoo.a = 3;
writableDeepFoo.b[0] = 'new value';
writableDeepFoo.b = ['something'];
```

Note that types containing overloaded functions are not made deeply writable due to a [TypeScript limitation](https://github.com/microsoft/TypeScript/issues/29732).

@see Writable
@category Object
@category Array
@category Set
@category Map
*/
export type WritableDeep<T> = T extends BuiltIns
	? T
	: T extends (...arguments_: any[]) => unknown
		? {} extends WritableObjectDeep<T>
			? T
			: HasMultipleCallSignatures<T> extends true
				? T
				: ((...arguments_: Parameters<T>) => ReturnType<T>) & WritableObjectDeep<T>
		: T extends Readonly<ReadonlyMap<infer KeyType, infer ValueType>>
			? WritableMapDeep<KeyType, ValueType>
			: T extends Readonly<ReadonlySet<infer ItemType>>
				? WritableSetDeep<ItemType>
				: T extends object
					? WritableObjectDeep<T>
					: unknown;

/**
Same as `WritableDeep`, but accepts only `Map`s as inputs. Internal helper for `WritableDeep`.
*/
type WritableMapDeep<KeyType, ValueType> = {} & Writable<Map<WritableDeep<KeyType>, WritableDeep<ValueType>>>;

/**
Same as `WritableDeep`, but accepts only `Set`s as inputs. Internal helper for `WritableDeep`.
*/
type WritableSetDeep<ItemType> = {} & Writable<Set<WritableDeep<ItemType>>>;

/**
Same as `WritableDeep`, but accepts only `object`s as inputs. Internal helper for `WritableDeep`.
*/
type WritableObjectDeep<ObjectType extends object> = {
	-readonly [KeyType in keyof ObjectType]: WritableDeep<ObjectType[KeyType]>
};
