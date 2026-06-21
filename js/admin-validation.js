import { t } from './i18n.js';

export function validateCategory(fd) {
  const errors = [];
  const nameFr = fd.get('nameFR')?.trim();
  if (!nameFr) {
    errors.push(t('admin.validate.nameFrRequired'));
  }
  const sortOrder = fd.get('sortOrder');
  if (sortOrder && (isNaN(sortOrder) || Number(sortOrder) < 0)) {
    errors.push(t('admin.validate.sortOrderPositive'));
  }
  return errors;
}

export function validateItem(fd) {
  const errors = [];
  const nameFr = fd.get('nameFR')?.trim();
  if (!nameFr) {
    errors.push(t('admin.validate.nameFrRequired'));
  }
  const categoryId = fd.get('categoryId');
  if (!categoryId) {
    errors.push(t('admin.validate.categoryRequired'));
  }
  const price = fd.get('price');
  if (!price || isNaN(price) || Number(price) <= 0) {
    errors.push(t('admin.validate.pricePositive'));
  }
  return errors;
}

export function validateSettings(fd) {
  const errors = [];
  const name = fd.get('restaurant_name')?.trim();
  if (!name) {
    errors.push(t('admin.validate.restaurantNameRequired'));
  }
  const wa = fd.get('wa_number')?.trim();
  if (!wa) {
    errors.push(t('admin.validate.waNumberRequired'));
  }
  return errors;
}
