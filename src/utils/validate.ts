import isEmail from 'validator/lib/isEmail'
import isMobilePhone from 'validator/lib/isMobilePhone'

/**
 * @param {string} path
 * @returns {Boolean}
 */
function isExternal(path: string) : boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export { isEmail, isMobilePhone, isExternal }
