import {
  getPhotosMeta,
  getUniqueCameras,
  getUniqueFilms,
  getUniqueFocalLengths,
  getUniqueLenses,
  getUniqueRecipes,
  getUniqueTags,
  getUniqueYears,
} from '@/photo/db/query';
import {
  SHOW_FILMS,
  SHOW_FOCAL_LENGTHS,
  SHOW_LENSES,
  SHOW_RECIPES,
  SHOW_CAMERAS,
  SHOW_TAGS,
  SHOW_YEARS,
  SHOW_RECENTS,
} from '@/app/config';
import { createLensKey } from '@/lens';
import { sortTagsByCount } from '@/tag';
import { sortCategoriesByCount } from '@/category';
import { sortFocalLengths } from '@/focal';

type CategoryData = Awaited<ReturnType<typeof getDataForCategories>>;

export const NULL_CATEGORY_DATA: CategoryData = {
  recents: [],
  years: [],
  cameras: [],
  lenses: [],
  tags: [],
  recipes: [],
  films: [],
  focalLengths: [],
};

export const getDataForCategories = () => Promise.all([
  SHOW_RECENTS
    ? getPhotosMeta({ recent: true })
      .then(({ count, dateRange }) => [{
        count,
        lastModified: new Date(dateRange?.end ?? ''),
      }])
      .catch(() => [])
    : undefined,
  SHOW_YEARS
    ? getUniqueYears()
      .catch(() => [])
    : undefined,
  SHOW_CAMERAS
    ? getUniqueCameras()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_LENSES
    ? getUniqueLenses()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_TAGS
    ? getUniqueTags()
      .then(sortTagsByCount)
      .catch(() => [])
    : undefined,
  SHOW_RECIPES
    ? getUniqueRecipes()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_FILMS
    ? getUniqueFilms()
      .then(sortCategoriesByCount)
      .catch(() => [])
    : undefined,
  SHOW_FOCAL_LENGTHS
    ? getUniqueFocalLengths()
      .then(sortFocalLengths)
      .catch(() => [])
    : undefined,
]).then(([
  recents = [],
  years = [],
  cameras = [],
  lenses = [],
  tags = [],
  recipes = [],
  films = [],
  focalLengths = [],
]) => ({
  recents,
  years,
  cameras,
  lenses,
  tags,
  recipes,
  films,
  focalLengths,
}));

export const getCountsForCategories = async () => {
  const {
    recents,
    years,
    cameras,
    lenses,
    tags,
    recipes,
    films,
    focalLengths,
  } = await getDataForCategories();

  return {
    recents: recents[0]?.count
      ? { count: recents[0].count }
      : {},
    years: years.reduce<Record<string, number>>((acc, year) => {
      acc[year.year] = year.count;
      return acc;
    }, {}),
    cameras: cameras.reduce<Record<string, number>>((acc, camera) => {
      acc[camera.cameraKey] = camera.count;
      return acc;
    }, {}),
    lenses: lenses.reduce<Record<string, number>>((acc, lens) => {
      acc[createLensKey(lens.lens)] = lens.count;
      return acc;
    }, {}),
    tags: tags.reduce<Record<string, number>>((acc, tag) => {
      acc[tag.tag] = tag.count;
      return acc;
    }, {}),
    recipes: recipes.reduce<Record<string, number>>((acc, recipe) => {
      acc[recipe.recipe] = recipe.count;
      return acc;
    }, {}),
    films: films.reduce<Record<string, number>>((acc, film) => {
      acc[film.film] = film.count;
      return acc;
    }, {}),
    focalLengths: focalLengths.reduce<Record<string, number>>((acc, focalLength) => {
      acc[focalLength.focal] = focalLength.count;
      return acc;
    }, {}),
  };
}; // <== JANGAN LUPA INI
