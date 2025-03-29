export type ValidationResult = true | string;

export interface DateValidationOptions {
  minDate: Date;
  maxDate: Date;
  allowFutureDates: boolean;
}

/**
 * Provide date validation functionnalities
 */
export class DateValidator {
  private options: DateValidationOptions;
  private readonly regex = /^(\d{4})\/(\d{2})\/(\d{2})$/;

  constructor(options: DateValidationOptions) {
    this.options = {
      minDate: options.minDate,
      maxDate: options.maxDate,
      allowFutureDates: options.allowFutureDates,
    };
  }

  /**
   * Checks if the date is before or equal to the current date
   * @param inputDate - The input date as a string
   * @returns True if the date is anterior to the current date, error message otherwise
   */
  private isAnteriorToCurrentDate(
    inputDate: Date | undefined
  ): ValidationResult {
    let isAnterior: ValidationResult = true;

    if (inputDate) {
      const currentDate = new Date();
      if (inputDate >= currentDate) {
        isAnterior = 'La date ne peut être postérieure à la date actuelle.';
      }
    }

    return isAnterior;
  }

  /**
   * Check for the date format (yyyy/mm/dd)
   * @param inputDate - The input date as a string
   * @returns True if valid, error message otherwise
   */
  private isValid(inputDate: string | undefined): boolean {
    let isValid = true;

    if (inputDate) {
      const rawDate = inputDate.trim();
      if (!this.regex.test(rawDate)) {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Format a string to a date format.
   * @param inputDate - The input date in string format
   * @returns A date in Date format
   */
  private toDate(inputDate: string): Date {
    const date = new Date(
      parseInt(inputDate.split('/')[0]),
      parseInt(inputDate.split('/')[1]) - 1,
      parseInt(inputDate.split('/')[2])
    );
    return date;
  }

  /**
   * Complete check for a date
   * @param inputDate - The input date as a string
   * @returns True if valid, error message otherwise
   */
  public validateDate(inputDate: string | undefined): ValidationResult {
    let validator: ValidationResult = true;
    if (inputDate) {
      // Date extraction
      const year = parseInt(inputDate.split('/')[0]);
      const month = parseInt(inputDate.split('/')[1]);
      const day = parseInt(inputDate.split('/')[2]);

      if (
        isNaN(month) ||
        year < this.options.minDate.getFullYear() ||
        year > this.options.maxDate.getFullYear()
      ) {
        validator = "L'année doit être comprise entre 1900 et 2099.";
      }

      if (isNaN(month) || month < 1 || month > 12) {
        validator = 'Le mois doit être compris entre 01 et 12.';
      }

      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        validator = `Le jour doit être compris entre 01 et ${daysInMonth}.`;
      }

      if (!this.isValid(inputDate))
        validator = 'La date doit être au format YYYY/MM/DD.';

      if (!this.options.allowFutureDates) {
        const date = this.toDate(inputDate);
        const anteriorCheck = this.isAnteriorToCurrentDate(date);
        if (anteriorCheck !== true) validator = anteriorCheck;
      }
    }

    return validator;
  }
}
