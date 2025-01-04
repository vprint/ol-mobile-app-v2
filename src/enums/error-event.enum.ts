export enum ApiEvents {
  BAD_REQUEST = 'badRequest',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'notFound',
  TIMEOUT = 'timeout',
  INTERNAL_ERROR = 'internalError',
  ERROR = 'error',
  FETCH_ERROR = 'fetchError',
}

type ErrorMessages = {
  [key in ApiEvents]: string;
};

type ErrorTitles = {
  [key in ApiEvents]: string;
};

export const errorMessages: ErrorMessages = {
  [ApiEvents.FETCH_ERROR]: 'Le serveur ne répond pas',
  [ApiEvents.BAD_REQUEST]: 'La requête est invalide',
  [ApiEvents.ERROR]: 'Une erreur inattendue est survenue',
  [ApiEvents.FORBIDDEN]:
    "Vous n'avez pas les droits nécessaires pour effectuer cette action",
  [ApiEvents.INTERNAL_ERROR]: 'Une erreur interne est survenue sur le serveur',
  [ApiEvents.NOT_FOUND]: "La ressource demandée n'a pas été trouvée",
  [ApiEvents.TIMEOUT]: "Le délai d'attente a été dépassé",
  [ApiEvents.UNAUTHORIZED]:
    'Vous devez être authentifié pour effectuer cette action',
} as const;

export const errorTitles: ErrorTitles = {
  [ApiEvents.FETCH_ERROR]: 'Erreur serveur',
  [ApiEvents.BAD_REQUEST]: 'Erreur de requête',
  [ApiEvents.ERROR]: 'Erreur',
  [ApiEvents.FORBIDDEN]: 'Accès refusé',
  [ApiEvents.INTERNAL_ERROR]: 'Erreur interne',
  [ApiEvents.NOT_FOUND]: 'Non trouvé',
  [ApiEvents.TIMEOUT]: 'Délai dépassé',
  [ApiEvents.UNAUTHORIZED]: 'Non autorisé',
} as const;
