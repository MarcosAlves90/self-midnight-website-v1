/**
 * @fileoverview This file defines arrays related to character skills and attributes
 * for a role-playing game system. It includes definitions for skills (perArray)
 * and mappings for biological characteristics (bioMap) and attributes (atrMap).

 * @module FichaPage3Arrays
 */

/**
 * Array of objects representing the skills (perícias) available in the game.
 * Each skill is associated with an attribute that influences its effectiveness.
 *
 * @type {Array.<{pericia: string, atr: string}>}
 */
export const perArray = [
    { pericia: "Acrobacia", atr: "DES" },
    { pericia: "Artes", atr: "PRE" },
    { pericia: "Atletismo", atr: "FOR" },
    { pericia: "Ciências", atr: "INT" },
    { pericia: "Enganação", atr: "PRE" },
    { pericia: "Foco", atr: "PRE" },
    { pericia: "Fortitude", atr: "VIG" },
    { pericia: "Furtividade", atr: "DES" },
    { pericia: "História", atr: "INT" },
    { pericia: "Iniciativa", atr: "DES" },
    { pericia: "Intimidação", atr: "PRE" },
    { pericia: "Intuição", atr: "INT" },
    { pericia: "Investigação", atr: "INT" },
    { pericia: "Luta", atr: "FOR" },
    { pericia: "Magia Arcana", atr: "INT" },
    { pericia: "Medicina", atr: "INT" },
    { pericia: "Percepção", atr: "PRE" },
    { pericia: "Persuasão", atr: "PRE" },
    { pericia: "Pilotagem", atr: "DES" },
    { pericia: "Precisão", atr: "DES" },
    { pericia: "Prestidigitação", atr: "DES" },
    { pericia: "Profissão", atr: "INT" },
    { pericia: "Reflexos", atr: "DES" },
    { pericia: "Religião", atr: "PRE" },
    { pericia: "Sobrevivência", atr: "INT" },
    { pericia: "Tática", atr: "INT" },
    { pericia: "Tecnologia", atr: "INT" },
    { pericia: "Vontade", atr: "PRE" },
];

/**
 * Array representing the mapping of biological characteristics used in the game.
 * It includes life, energy, skills, and chromes as key aspects of a character's bio-profile.
 *
 * @type {Array.<string>}
 */
export const bioMap = ['Vida', 'Energia', 'Pericias', 'Cromos'];

/**
 * Array representing the mapping of attributes used in the game.
 * It includes dexterity (DES), strength (FOR), intelligence (INT), presence (PRE),
 * and vigor (VIG) as the core attributes.
 *
 * @type {Array.<string>}
 */
export const atrMap = ['DES', 'FOR', 'INT', 'PRE', 'VIG'];




