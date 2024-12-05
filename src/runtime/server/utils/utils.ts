const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as T
}

/**
 * @private
 */
export const capitalize = cacheStringFunction(<T extends string>(str: T) => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>
})

const underscoreRE = /\B([A-Z])/g
/**
 * @private
 */
export const underscore = cacheStringFunction((str: string) =>
  str.replace(underscoreRE, '_$1').toLowerCase(),
)
