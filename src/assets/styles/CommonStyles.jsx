/**
 * @file CommonStyles.jsx
 * This file exports styles used across the application, providing a consistent look and feel.
 * It includes styles for locked inputs and color schemes for attributes and biological characteristics.
 */

/**
 * Object containing the color schemes for different attributes (DES, FOR, INT, PRE, VIG).
 * Each attribute has a specified background and text color.
 *
 * @type {Object.<string, {background: string, color: string}>}
 */
export const atrColors = {
    "DES": {"background": "var(--yellow-des)", "color" : "black"},
    "FOR" : {"background" : "var(--red-for)", "color" : "white"},
    "INT" : {"background" : "var(--blue-int)", "color" : "white"},
    "PRE" : {"background" : "var(--purple-pre)", "color" : "white"},
    "VIG" : {"background" : "var(--green-vig)", "color" : "white"},
}

/**
 * Object containing the color schemes for different biological characteristics (Vida, Energia, Pericias, Cromos).
 * Each characteristic has a specified background and text color.
 *
 * @type {Object.<string, {background: string, color: string}>}
 */
export const bioColors = {
    "Vida": {"background": "var(--color-life)", "color" : "black"},
    "Energia" : {"background" : "var(--color-energy)", "color" : "white"},
    "Pericias" : {"background" : "var(--color-per)", "color" : "white"},
    "Cromos" : {"background" : "var(--color-cromo)", "color" : "white"},
}


