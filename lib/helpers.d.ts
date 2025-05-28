export type OnlyFirst<First, AllProperties> = First & {
    [Key in keyof Omit<AllProperties, keyof First>]?: never;
};
export type ValueOf<T> = T[keyof T];
export type MergeTypes<TypedArray extends any[], Res = object> = TypedArray extends [
    infer First,
    ...(infer Rest)
] ? MergeTypes<Rest, Res & First> : Res;
export type OneOf<TypesArray extends any[], Res = never, AllProperties = MergeTypes<TypesArray>> = TypesArray extends [infer First, ...(infer Rest)] ? OneOf<Rest, Res | OnlyFirst<First, AllProperties>, AllProperties> : Res;
