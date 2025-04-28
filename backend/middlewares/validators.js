const { body, param, validationResult } = require('express-validator');

// Fonction pour vérifier les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation pour la création d'un compte
exports.validateAccountCreation = [
  body('type')
    .isIn(['courant', 'epargne', 'entreprise'])
    .withMessage('Le type de compte doit être courant, epargne ou entreprise'),
  body('initial_balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le solde initial doit être un nombre positif'),
  validate
];

// Validation pour la création d'une transaction
exports.validateTransaction = [
  body('from_account_id')
    .isInt({ min: 1 })
    .withMessage('Identifiant du compte source invalide'),
  body('to_account_id')
    .isInt({ min: 1 })
    .withMessage('Identifiant du compte destinataire invalide')
    .custom((value, { req }) => {
      if (value === req.body.from_account_id) {
        throw new Error('Le compte destinataire doit être différent du compte source');
      }
      return true;
    }),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Le montant doit être supérieur à 0'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('La description doit contenir entre 1 et 255 caractères'),
  validate
];

// Validation pour la création d'une carte bancaire
exports.validateCardCreation = [
  body('account_id')
    .isInt({ min: 1 })
    .withMessage('Identifiant du compte invalide'),
  body('card_type')
    .optional()
    .isIn(['visa', 'mastercard'])
    .withMessage('Le type de carte doit être visa ou mastercard'),
  body('pin')
    .isString()
    .isLength({ min: 4, max: 4 })
    .matches(/^\d{4}$/)
    .withMessage('Le code PIN doit contenir exactement 4 chiffres'),
  validate
];

// Validation pour l'inscription d'un utilisateur
exports.validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('Adresse email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  body('first_name')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .trim(),
  body('last_name')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim(),
  validate
];

// Validation pour la mise à jour des informations utilisateur
exports.validateUserUpdate = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Adresse email invalide')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .trim(),
  body('last_name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim(),
  validate
];