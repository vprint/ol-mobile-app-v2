export const UserMessage = {
  WFS: {
    INSERT: {
      CONFIRM: "Confirmer l'insertion en base",
      SUCCESS: 'Entité inserée avec succès',
      FAIL: "Echec de l'insertion",
    },
    UPDATE: {
      CONFIRM: 'Confirmer la mise à jour en base',
      SUCCESS: 'Entité mise à jour avec succès',
      FAIL: 'Echec de la mise à jour',
    },
    DELETE: {
      CONFIRM: 'Confirmer la suppression en base',
      SUCCESS: 'Entité supprimée avec succès',
      FAIL: 'Echec de la suppression',
    },
  },

  MEASURE: {
    DISTANCE: 'Distance',
    AREA: 'Area',
    DELETE: 'Remove',
    TOOLTIP: {
      DISTANCE: 'Distance measurement',
      AREA: 'Area measurement',
      DELETE: 'Remove measurement',
    },
  },

  GENERIC: {
    SUCCESS: 'Succès',
    FAIL: 'Echec',
    CANCEL: 'Annuler',
    INSERT: 'Insérer',
    DEFINITIVE_OPERATION: 'Cette opération est définitive.',
    EDIT: 'Editer',
    SAVE: 'Sauvegarder',
    CLOSE: 'Fermer',
  },
} as const;
